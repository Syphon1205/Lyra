import type { AgentAdapter, AgentRunRequest } from "./agentAdapter.js";
import { resolveExecutable } from "./agentAdapter.js";
import { RunningProcess } from "../processRunner.js";
import type { AgentAdapterDescriptor, AgentRunEvent } from "../../../shared/agentEvents.js";

export class OpenCodeAdapter implements AgentAdapter {
  readonly id = "opencode" as const;
  readonly displayName = "OpenCode";

  async detect(customPath?: string): Promise<AgentAdapterDescriptor> {
    const executablePath = customPath || (await resolveExecutable("opencode"));
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
      supportedModels: ["anthropic/claude-3-7-sonnet", "openai/o3", "google/gemini-2.5-pro"],
      supportedReasoningEfforts: ["medium"],
      capabilities: {
        streaming: true,
        toolActivity: true,
        approvals: false,
        sessionResume: true,
        images: false,
      },
    };
  }

  start(request: AgentRunRequest, onEvent: (event: AgentRunEvent) => void) {
    const args = ["--prompt", request.prompt];
    if (request.model) {
      args.push("-m", request.model);
    }
    let canceled = false;
    let proc: RunningProcess | undefined;

    void (async () => {
      const resolved = request.customExecutablePath || (await resolveExecutable("opencode")) || "opencode";
      if (canceled) return;
      proc = new RunningProcess(resolved, args, { cwd: request.cwd, timeoutMs: 5 * 60_000 });
      onEvent({ type: "run.started", runId: request.runId });

      proc.on("line", (line: string) => {
        if (line.trim()) {
          onEvent({ type: "message.delta", runId: request.runId, textDelta: line + "\n" });
        }
      });

      proc.on("exit", (code: number | null) => {
        if (code === 0) {
          onEvent({ type: "run.completed", runId: request.runId });
        } else {
          onEvent({
            type: "run.failed",
            runId: request.runId,
            reason: "unknown",
            message: `OpenCode exited with code ${code}`,
          });
        }
      });
    })();

    return {
      cancel: () => {
        canceled = true;
        proc?.cancel();
      },
    };
  }
}
