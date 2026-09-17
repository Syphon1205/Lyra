import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { EventEmitter } from "node:events";

/**
 * Launches a CLI with an explicit executable path and argument array — never
 * a shell string, so user/agent text can never be interpreted as a command.
 * Streams stdout/stderr concurrently, line-buffered, off the Electron main
 * thread's synchronous call stack (spawn + event listeners are inherently
 * async; nothing here blocks the event loop).
 */
export class RunningProcess extends EventEmitter {
  private child: ChildProcessWithoutNullStreams;
  private stdoutBuffer = "";
  private stderrChunks: string[] = [];
  private killed = false;

  constructor(executable: string, args: string[], options: { cwd?: string; env?: NodeJS.ProcessEnv; timeoutMs?: number } = {}) {
    super();
    this.child = spawn(executable, args, {
      cwd: options.cwd,
      env: options.env ?? process.env,
      stdio: ["pipe", "pipe", "pipe"],
    });

    // Some CLIs (codex exec) block reading stdin for an optional trailing
    // prompt block unless it's closed — close it immediately since Lyra
    // always passes the prompt as an argument.
    this.child.stdin.end();

    this.child.stdout.setEncoding("utf8");
    this.child.stdout.on("data", (chunk: string) => this.handleStdout(chunk));

    this.child.stderr.setEncoding("utf8");
    this.child.stderr.on("data", (chunk: string) => {
      this.stderrChunks.push(chunk);
      if (this.stderrChunks.length > 200) this.stderrChunks.shift(); // bounded
      this.emit("stderr", chunk);
    });

    this.child.on("error", (err) => {
      this.emit("spawnError", err);
    });

    this.child.on("close", (code) => {
      if (this.stdoutBuffer.trim().length > 0) {
        this.emit("line", this.stdoutBuffer);
        this.stdoutBuffer = "";
      }
      this.emit("exit", code, this.stderrChunks.join(""));
    });

    if (options.timeoutMs) {
      setTimeout(() => {
        if (!this.killed) this.cancel();
      }, options.timeoutMs);
    }
  }

  private handleStdout(chunk: string) {
    this.stdoutBuffer += chunk;
    const lines = this.stdoutBuffer.split("\n");
    this.stdoutBuffer = lines.pop() ?? "";
    for (const line of lines) {
      if (line.trim().length > 0) this.emit("line", line);
    }
  }

  cancel() {
    if (this.killed) return;
    this.killed = true;
    this.child.kill("SIGTERM");
  }
}
