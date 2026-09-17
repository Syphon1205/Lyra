import type { AgentAdapter, AgentRunRequest } from "./agentAdapter.js";
import { resolveExecutable } from "./agentAdapter.js";
import { RunningProcess } from "../processRunner.js";
import type { AgentAdapterDescriptor, AgentRunEvent } from "../../../shared/agentEvents.js";

/**
 * Real integration with the Codex CLI's documented scripting mode:
 *   codex exec --json --sandbox read-only --skip-git-repo-check <prompt>
 *
 * Event shapes captured from a live probe of this machine's installed
 * `codex` binary (see MIGRATION.md) — not invented:
 *   {"type":"thread.started","thread_id": string}
 *   {"type":"turn.started"}
 *   {"type":"item.completed","item":{"id":..., "type":"error"|..., "message": string}}
 *   {"type":"error","message": string}
 *   {"type":"turn.failed","error":{"message": string}}
 *
 * Both live probes in this environment failed before reaching a successful
 * "turn.completed"/agent-message event (unsupported model, then a real
 * usage-limit error), so this adapter's success-path event names
 * ("turn.completed", assistant message items) are inferred from Codex's
 * `item.completed` pattern rather than directly observed — flagged as
 * unverified in MIGRATION.md.
 */
export class CodexAdapter implements AgentAdapter {
  readonly id = "codex" as const;
  readonly displayName = "Codex CLI";

  async detect(): Promise<AgentAdapterDescriptor> {
    const executablePath = await resolveExecutable("codex");
    return {
      id: this.id,
      displayName: this.displayName,
      available: !!executablePath,
      executablePath,
      capabilities: {
        streaming: true,
        toolActivity: true,
        approvals: false,
        sessionResume: true,
        images: true,
      },
    };
  }

  start(request: AgentRunRequest, onEvent: (event: AgentRunEvent) => void) {
    const args = ["exec", "--json", "--sandbox", "read-only", "--skip-git-repo-check", request.prompt];

    let canceled = false;
    let proc: RunningProcess | undefined;

    void resolveExecutable("codex").then((resolved) => {
      if (canceled) return;
      proc = new RunningProcess(resolved ?? "codex", args, { cwd: request.cwd, timeoutMs: 5 * 60_000 });
      wireEvents(proc, request, onEvent);
    });

    return { cancel: () => {
      canceled = true;
      proc?.cancel();
    } };
  }
}

function wireEvents(proc: RunningProcess, request: AgentRunRequest, onEvent: (event: AgentRunEvent) => void) {
    let completed = false;

    proc.on("line", (line: string) => {
      let json: any;
      try {
        json = JSON.parse(line);
      } catch {
        return;
      }

      switch (json.type) {
        case "thread.started":
          onEvent({ type: "run.started", runId: request.runId, providerSessionId: json.thread_id });
          break;
        case "item.completed": {
          const item = json.item ?? {};
          if (item.type === "error") {
            onEvent({ type: "tool.completed", runId: request.runId, toolCallId: item.id ?? "warning", label: "Warning", detail: item.message, succeeded: false });
          } else if (typeof item.message === "string" || typeof item.text === "string") {
            onEvent({ type: "message.completed", runId: request.runId, text: item.message ?? item.text });
          }
          break;
        }
        case "turn.completed":
          completed = true;
          onEvent({ type: "run.completed", runId: request.runId });
          break;
        case "error":
          completed = true;
          onEvent({ type: "run.failed", runId: request.runId, reason: classifyError(String(json.message ?? "")), message: String(json.message ?? "Codex reported an error.") });
          break;
        case "turn.failed":
          completed = true;
          onEvent({ type: "run.failed", runId: request.runId, reason: classifyError(String(json.error?.message ?? "")), message: String(json.error?.message ?? "The Codex run failed.") });
          break;
      }
    });

    proc.on("spawnError", (err: NodeJS.ErrnoException) => {
      completed = true;
      onEvent({ type: "run.failed", runId: request.runId, reason: err.code === "ENOENT" ? "executable_not_found" : "unknown", message: err.message });
    });

    proc.on("exit", (code: number | null, stderr: string) => {
      if (!completed) {
        onEvent({ type: "run.failed", runId: request.runId, reason: "unknown", message: stderr.trim() || `codex exited with code ${code}` });
      }
    });
}

function classifyError(text: string): "authentication" | "rate_limit" | "unknown" {
  const lower = text.toLowerCase();
  if (lower.includes("auth") || lower.includes("login") || lower.includes("credential")) return "authentication";
  if (lower.includes("usage limit") || lower.includes("rate limit") || lower.includes("quota")) return "rate_limit";
  return "unknown";
}
