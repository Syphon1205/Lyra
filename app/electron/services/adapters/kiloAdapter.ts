import type { AgentAdapter, AgentRunRequest } from "./agentAdapter.js";
import { resolveExecutable } from "./agentAdapter.js";
import { RunningProcess } from "../processRunner.js";
import type { AgentAdapterDescriptor, AgentRunEvent } from "../../../shared/agentEvents.js";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export class KiloAdapter implements AgentAdapter {
  readonly id = "kilo" as const;
  readonly displayName = "Kilo Code";

  async detect(customPath?: string): Promise<AgentAdapterDescriptor> {
    const executablePath = customPath || (await resolveExecutable("kilo"));
    let version: string | undefined;
    let available = false;
    let status: AgentAdapterDescriptor["status"] = "not_found";

    if (executablePath) {
      available = true;
      status = "installed_ready";
      try {
        const { stdout } = await execFileAsync(executablePath, ["--version"], { encoding: "utf8", timeout: 3000 });
        const trimmed = stdout.trim();
        const lines = trimmed.split("\n");
        version = lines.find((l) => l.trim().length > 0)?.trim();
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
      supportedModels: ["kilo-auto", "claude-3-7-sonnet", "o3", "gemini-2.5-pro"],
      supportedReasoningEfforts: ["medium"],
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
    const args = ["run", request.prompt];
    if (request.model) {
      args.push("-m", request.model);
    }

    let canceled = false;
    let proc: RunningProcess | undefined;

    void (async () => {
      const bin = request.customExecutablePath || (await resolveExecutable("kilo")) || "kilo";
      if (canceled) return;
      proc = new RunningProcess(bin, args, { cwd: request.cwd, timeoutMs: 5 * 60_000 });
      wireEvents(proc, request, onEvent);
    })();

    return {
      cancel: () => {
        canceled = true;
        proc?.cancel();
      },
    };
  }
}

function wireEvents(proc: RunningProcess, request: AgentRunRequest, onEvent: (event: AgentRunEvent) => void) {
  let completed = false;

  proc.on("line", (line: string) => {
    if (!line.trim()) return;
    try {
      const json = JSON.parse(line);
      if (json.type === "message" || json.text) {
        onEvent({ type: "message.delta", runId: request.runId, textDelta: json.text ?? json.message });
      }
    } catch {
      onEvent({ type: "message.delta", runId: request.runId, textDelta: line + "\n" });
    }
  });

  proc.on("exit", (code: number, signal?: string) => {
    if (completed) return;
    completed = true;
    if (signal === "SIGTERM" || signal === "SIGINT") {
      onEvent({ type: "run.canceled", runId: request.runId });
    } else if (code === 0) {
      onEvent({ type: "run.completed", runId: request.runId });
    } else {
      onEvent({
        type: "run.failed",
        runId: request.runId,
        reason: "unknown",
        message: `Kilo exited with code ${code}`,
      });
    }
  });
}
