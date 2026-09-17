import type { AgentAdapterDescriptor, AgentProviderId, AgentRunEvent } from "../../../shared/agentEvents.js";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

export interface AgentRunRequest {
  runId: string;
  prompt: string;
  cwd: string;
  model?: string;
  reasoningEffort?: string;
  customExecutablePath?: string;
  /** A previously-seen provider session id, if this adapter supports resume. */
  resumeSessionId?: string;
}

/**
 * A CLI-agent integration. Each adapter owns its executable's real argument
 * array and wire format — the rest of Lyra only ever sees `AgentRunEvent`.
 */
export interface AgentAdapter {
  readonly id: AgentProviderId;
  readonly displayName: string;

  detect(customPath?: string): Promise<AgentAdapterDescriptor>;

  /** Starts a run; events (including run.completed/run.failed) are delivered via onEvent. */
  start(request: AgentRunRequest, onEvent: (event: AgentRunEvent) => void): { cancel: () => void };
}

/** Resolves an executable on PATH or in known bin locations without invoking a shell. */
export async function resolveExecutable(name: string): Promise<string | undefined> {
  const home = os.homedir();
  const candidates = [
    `/opt/homebrew/bin/${name}`,
    `/usr/local/bin/${name}`,
    `/usr/bin/${name}`,
    path.join(home, ".nvm/versions/node/v24.18.0/bin", name),
    path.join(home, ".cargo/bin", name),
    path.join(home, ".local/bin", name),
  ];

  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }

  // Also check other nvm node versions if present
  const nvmDir = path.join(home, ".nvm/versions/node");
  if (fs.existsSync(nvmDir)) {
    try {
      const versions = fs.readdirSync(nvmDir);
      for (const v of versions) {
        const binPath = path.join(nvmDir, v, "bin", name);
        if (fs.existsSync(binPath)) return binPath;
      }
    } catch {
      // ignore
    }
  }

  const { spawnSync } = await import("node:child_process");
  const result = spawnSync("/usr/bin/which", [name], { encoding: "utf8" });
  const found = result.stdout?.trim();
  return found && result.status === 0 && fs.existsSync(found) ? found : undefined;
}

