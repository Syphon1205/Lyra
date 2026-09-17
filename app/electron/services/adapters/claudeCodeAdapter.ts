import type { AgentAdapter, AgentRunRequest } from "./agentAdapter.js";
import { resolveExecutable } from "./agentAdapter.js";
import { RunningProcess } from "../processRunner.js";
import type { AgentAdapterDescriptor, AgentRunEvent } from "../../../shared/agentEvents.js";

/**
 * Real integration with the Claude Code CLI's documented scripting mode:
 *   claude -p <prompt> --output-format stream-json --include-partial-messages --verbose
 *
 * The exact event shapes below were captured from a live probe of this
 * machine's installed `claude` binary (see MIGRATION.md) — not invented.
 * Observed line kinds:
 *   {"type":"system","subtype":"init", session_id, model, ...}
 *   {"type":"system","subtype":"status","status":"requesting"}
 *   {"type":"assistant","message":{content:[{type:"text",text}], ...}, "error"?: string}
 *   {"type":"result","subtype":"success"|..., "result": string, "is_error": bool, "total_cost_usd": number}
 *
 * The probe's own run failed with `authentication_failed` (nested CLI
 * invocation had no credentials in this environment) — the success path
 * (assistant streaming deltas) was not observed directly, so this adapter
 * treats every non-error "assistant" line as a completed text chunk rather
 * than assuming a specific delta framing it hasn't verified.
 */
export class ClaudeCodeAdapter implements AgentAdapter {
  readonly id = "claude-code" as const;
  readonly displayName = "Claude Code";

  async detect(customPath?: string): Promise<AgentAdapterDescriptor> {
    const executablePath = customPath || (await resolveExecutable("claude"));
    let version: string | undefined;
    let available = false;
    let status: AgentAdapterDescriptor["status"] = "not_found";

    if (executablePath) {
      available = true;
      status = "installed_ready";
      try {
        const { execFile } = await import("node:child_process");
        const { promisify } = await import("node:util");
        const { stdout } = await promisify(execFile)(executablePath, ["--version"], { encoding: "utf8", timeout: 3000 });
        version = stdout.trim().split("\n")[0];
      } catch {
        status = "installed_ready";
      }
    }

    return {
      id: this.id,
      displayName: this.displayName,
      status,
      available,
      executablePath,
      version,
      supportedModels: ["claude-3-7-sonnet", "claude-3-5-sonnet", "claude-3-5-haiku"],
      supportedReasoningEfforts: ["low", "medium", "high"],
      capabilities: {
        streaming: true,
        toolActivity: true,
        approvals: true,
        sessionResume: true,
        images: false,
      },
    };
  }

  start(request: AgentRunRequest, onEvent: (event: AgentRunEvent) => void) {
    const args = [
      "-p",
      request.prompt,
      "--output-format",
      "stream-json",
      "--include-partial-messages",
      "--verbose",
      "--permission-mode",
      "plan",
    ];
    if (request.resumeSessionId) {
      args.push("--resume", request.resumeSessionId);
    }

    let canceled = false;
    let proc: RunningProcess | undefined;

    void (async () => {
      const executable = request.customExecutablePath || (await resolveExecutable("claude")) || "claude";
      if (canceled) return;
      proc = new RunningProcess(executable, args, { cwd: request.cwd, timeoutMs: 5 * 60_000 });
      wireEvents(proc, request, onEvent);
    })();

    return { cancel: () => {
      canceled = true;
      proc?.cancel();
    } };
  }
}

function wireEvents(proc: RunningProcess, request: AgentRunRequest, onEvent: (event: AgentRunEvent) => void) {
    onEvent({ type: "run.started", runId: request.runId });

    let sawResult = false;

    proc.on("line", (line: string) => {
      let json: any;
      try {
        json = JSON.parse(line);
      } catch {
        return; // not a JSON line — ignore rather than surface garbage to the UI
      }

      if (json.type === "system" && json.subtype === "init") {
        onEvent({ type: "run.started", runId: request.runId, providerSessionId: json.session_id });
        return;
      }

      if (json.type === "assistant") {
        if (json.error || json.is_api_error_message) {
          onEvent({
            type: "run.failed",
            runId: request.runId,
            reason: classifyError(String(json.error ?? "")),
            message: extractText(json.message) || String(json.error ?? "Unknown error"),
          });
          return;
        }
        const text = extractText(json.message);
        if (text) onEvent({ type: "message.completed", runId: request.runId, text });
        return;
      }

      if (json.type === "result") {
        sawResult = true;
        if (json.is_error) {
          onEvent({
            type: "run.failed",
            runId: request.runId,
            reason: classifyError(String(json.result ?? "")),
            message: String(json.result ?? "The agent run failed."),
          });
          return;
        }
        if (typeof json.total_cost_usd === "number") {
          onEvent({ type: "usage", runId: request.runId, costUsd: json.total_cost_usd });
        }
        onEvent({ type: "run.completed", runId: request.runId });
      }
    });

    proc.on("spawnError", (err: NodeJS.ErrnoException) => {
      onEvent({
        type: "run.failed",
        runId: request.runId,
        reason: err.code === "ENOENT" ? "executable_not_found" : "unknown",
        message: err.message,
      });
    });

    proc.on("exit", (code: number | null, stderr: string) => {
      if (!sawResult) {
        onEvent({
          type: "run.failed",
          runId: request.runId,
          reason: "unknown",
          message: stderr.trim() || `claude exited with code ${code}`,
        });
      }
    });
}

function extractText(message: any): string {
  if (!message?.content) return "";
  return message.content
    .filter((c: any) => c.type === "text")
    .map((c: any) => c.text)
    .join("");
}

function classifyError(text: string): "authentication" | "rate_limit" | "unknown" {
  const lower = text.toLowerCase();
  if (lower.includes("auth") || lower.includes("oauth") || lower.includes("login")) return "authentication";
  if (lower.includes("rate limit") || lower.includes("usage limit") || lower.includes("quota")) return "rate_limit";
  return "unknown";
}
