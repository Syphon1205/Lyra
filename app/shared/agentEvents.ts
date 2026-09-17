/**
 * Provider-independent agent run events. Each `AgentAdapter` translates its
 * CLI's real wire format into these — the renderer never sees a
 * provider-specific event shape. See electron/services/adapters/*.ts for the
 * adapters that produce these from verified, real CLI output (not invented
 * schemas — see MIGRATION.md for the probe transcripts this was built from).
 */

export type AgentProviderId = "claude-code" | "codex" | "opencode" | "gemini" | "kilo";

export type AgentProviderStatus =
  | "installed_ready"
  | "auth_required"
  | "config_required"
  | "not_found"
  | "unsupported_version"
  | "error";

export interface AgentCapabilities {
  streaming: boolean;
  toolActivity: boolean;
  approvals: boolean;
  sessionResume: boolean;
  images: boolean;
}

export interface AgentAdapterDescriptor {
  id: AgentProviderId;
  displayName: string;
  /** Status of the CLI agent */
  status: AgentProviderStatus;
  available: boolean;
  executablePath?: string;
  version?: string;
  supportedModels: string[];
  supportedReasoningEfforts?: string[];
  capabilities: AgentCapabilities;
}

export interface FileChangeSummary {
  path: string;
  additions: number;
  deletions: number;
}

export type AgentRunEvent =
  | { type: "run.started"; runId: string; providerSessionId?: string }
  | { type: "message.delta"; runId: string; textDelta: string }
  | { type: "message.completed"; runId: string; text: string }
  | { type: "tool.started"; runId: string; toolCallId: string; label: string; detail?: string }
  | { type: "tool.completed"; runId: string; toolCallId: string; label: string; detail?: string; succeeded: boolean }
  | { type: "files.changed"; runId: string; files: FileChangeSummary[] }
  | { type: "approval.requested"; runId: string; requestId: string; summary: string }
  | { type: "usage"; runId: string; costUsd?: number; inputTokens?: number; outputTokens?: number }
  | { type: "run.completed"; runId: string }
  | { type: "run.failed"; runId: string; reason: "authentication" | "rate_limit" | "executable_not_found" | "unknown"; message: string }
  | { type: "run.canceled"; runId: string };
