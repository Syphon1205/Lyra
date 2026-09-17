import type { AgentAdapter, AgentRunRequest } from "./agentAdapter.js";
import { resolveExecutable } from "./agentAdapter.js";
import { RunningProcess } from "../processRunner.js";
import type { AgentAdapterDescriptor, AgentRunEvent } from "../../../shared/agentEvents.js";

export class OpenCodeAdapter implements AgentAdapter {
  readonly id = "opencode" as const;
  readonly displayName = "OpenCode";

  async detect(): Promise<AgentAdapterDescriptor> {
    const executablePath = await resolveExecutable("opencode");
    return {
      id: this.id,
      displayName: this.displayName,
      available: !!executablePath,
      executablePath,
      capabilities: {
        streaming: true,
        toolActivity: true,
        approvals: false,
        sessionResume: false,
        images: false,
      },
    };
  }

  start(request: AgentRunRequest, onEvent: (event: AgentRunEvent) => void) {
    const args = ["run", request.prompt];
    let canceled = false;
    let proc: RunningProcess | undefined;

    void resolveExecutable("opencode").then((resolved) => {
      if (canceled) return;
      proc = new RunningProcess(resolved ?? "opencode", args, { cwd: request.cwd, timeoutMs: 5 * 60_000 });
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
    });

    return {
      cancel: () => {
        canceled = true;
        proc?.cancel();
      },
    };
  }
}
