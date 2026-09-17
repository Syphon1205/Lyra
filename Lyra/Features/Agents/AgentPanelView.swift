import SwiftUI

/// The right-side Agent Panel: a translucent Liquid Glass surface that
/// slides in over the canvas. Agents are conversational — this is a chat,
/// not a terminal job list.
///
/// This view is intentionally host-agnostic (used both as the companion
/// panel and inside a detached window) so a session's state never depends
/// on which surface is showing it.
struct AgentPanelView: View {
    @Environment(WorkspaceStore.self) private var store
    @Environment(\.openWindow) private var openWindow
    var isDetachedWindow: Bool = false
    /// When set (a detached chat window), this session's issue is pinned
    /// regardless of what the main window's agent chat is currently showing
    /// — window-local state, deliberately not read from the shared store.
    var pinnedIssueID: IssueID?
    @State private var draft = ""
    @State private var showAgentSwitcher = false
    @FocusState private var isComposerFocused: Bool

    private var issue: Issue? {
        store.issue(pinnedIssueID ?? store.agentChatIssueID)
    }

    private var session: AgentChatSession? {
        guard let issue else { return nil }
        return store.chatSession(for: issue.id)
    }

    var body: some View {
        VStack(spacing: 0) {
            header
            Divider().opacity(0.5)
            if let issue {
                contextBar(issue: issue)
                Divider().opacity(0.5)
            }

            if let session {
                conversation(session: session)
            } else {
                Spacer()
                Text("No conversation yet.")
                    .font(.system(size: 12.5))
                    .foregroundStyle(.secondary)
                Spacer()
            }

            composer
        }
        .frame(width: isDetachedWindow ? nil : 400)
        .lyraGlass(.chrome, cornerRadius: 0)
        .onAppear { isComposerFocused = true }
    }

    private var header: some View {
        HStack(spacing: 10) {
            Button {
                showAgentSwitcher.toggle()
            } label: {
                HStack(spacing: 6) {
                    Text(session?.adapterName ?? "Codex")
                        .font(.system(size: 13, weight: .semibold))
                    Image(systemName: "chevron.down")
                        .font(.system(size: 9, weight: .semibold))
                        .foregroundStyle(.tertiary)
                }
            }
            .buttonStyle(.plain)
            .popover(isPresented: $showAgentSwitcher, arrowEdge: .bottom) {
                AgentSwitcherView(session: session)
            }

            if session?.isDemo == true {
                Text("DEMO")
                    .font(.system(size: 9, weight: .bold))
                    .foregroundStyle(.orange)
                    .padding(.horizontal, 5)
                    .padding(.vertical, 1)
                    .background(.orange.opacity(0.15), in: Capsule())
                    .help("Scripted responses — not connected to a live CLI agent.")
            }

            HStack(spacing: 5) {
                Circle()
                    .fill(session?.isStreaming == true ? .orange : .green)
                    .frame(width: 6, height: 6)
                Text(session?.isStreaming == true ? "Working" : "Ready")
                    .font(.system(size: 11))
                    .foregroundStyle(.secondary)
            }

            if session?.isStreaming == true {
                Button("Stop") {
                    session?.cancel()
                }
                .buttonStyle(.plain)
                .font(.system(size: 11))
                .foregroundStyle(.red)
            }

            Spacer()

            if !isDetachedWindow {
                Button {
                    if let issue {
                        openWindow(id: "agent-chat", value: issue.id)
                    }
                } label: {
                    Image(systemName: "arrow.up.forward.app")
                }
                .buttonStyle(.borderless)
                .help("Open Chat in Window")
                .disabled(issue == nil)

                Button {
                    store.closeCompanionPanel()
                } label: {
                    Image(systemName: "sidebar.trailing")
                }
                .buttonStyle(.borderless)
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
    }

    private func contextBar(issue: Issue) -> some View {
        HStack(spacing: 8) {
            Image(systemName: "doc.text")
                .font(.system(size: 10))
                .foregroundStyle(.secondary)
            Text(issue.identifier.description)
                .font(.system(size: 11, design: .monospaced))
            Text(issue.title)
                .font(.system(size: 11))
                .foregroundStyle(.secondary)
                .lineLimit(1)
            Spacer()
            Image(systemName: "chevron.left.forwardslash.chevron.right")
                .font(.system(size: 10))
                .foregroundStyle(.secondary)
            Text(store.repositories.first?.currentBranch ?? "main")
                .font(.system(size: 11, design: .monospaced))
                .foregroundStyle(.secondary)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 8)
    }

    private func conversation(session: AgentChatSession) -> some View {
        ScrollViewReader { proxy in
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    ForEach(session.messages) { message in
                        AgentChatBubble(message: message, onViewDiff: {
                            withAnimation(.spring(duration: 0.32, bounce: 0.12)) {
                                store.agentDiffPreview = message.diff
                            }
                        }, onApply: {
                            session.approveDiff()
                            store.agentDiffPreview = nil
                        })
                        .id(message.id)
                    }
                }
                .padding(16)
            }
            .onChange(of: session.messages.count) {
                if let last = session.messages.last {
                    withAnimation { proxy.scrollTo(last.id, anchor: .bottom) }
                }
            }
        }
    }

    private var composer: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(alignment: .top, spacing: 8) {
                Button {} label: {
                    Image(systemName: "plus")
                }
                .buttonStyle(.borderless)
                .padding(.top, 2)
                .help("Attach an issue, file, or branch reference (not yet implemented)")

                TextField("Message Agent…", text: $draft, axis: .vertical)
                    .textFieldStyle(.plain)
                    .font(.system(size: 13))
                    .lineLimit(1...5)
                    .focused($isComposerFocused)
                    .onSubmit(send)

                Button(action: send) {
                    Image(systemName: "arrow.up.circle.fill")
                        .font(.system(size: 20))
                        .foregroundStyle(draft.isEmpty ? Color.secondary.opacity(0.4) : LyraColor.accent)
                }
                .buttonStyle(.plain)
                .disabled(draft.isEmpty)
            }

            HStack(spacing: 10) {
                composerTag(session?.adapterName ?? "Codex")
                if let issue {
                    composerTag(issue.identifier.description)
                }
                Spacer()
            }
        }
        .padding(12)
        .lyraGlass(.toolbar, cornerRadius: 14)
        .padding(12)
    }

    private func composerTag(_ text: String) -> some View {
        Text(text)
            .font(.system(size: 10.5, weight: .medium))
            .foregroundStyle(.secondary)
            .padding(.horizontal, 7)
            .padding(.vertical, 2)
            .background(.primary.opacity(0.06), in: Capsule())
    }

    private func send() {
        guard !draft.isEmpty, let issue else { return }
        store.chatSession(for: issue.id).send(draft)
        draft = ""
    }
}

private struct AgentSwitcherView: View {
    var session: AgentChatSession?
    private let names = ["Codex CLI", "Claude Code", "Gemini CLI", "OpenCode"]

    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            ForEach(names, id: \.self) { name in
                HStack {
                    Image(systemName: "checkmark")
                        .opacity(name.hasPrefix(session?.adapterName ?? "Codex") ? 1 : 0)
                        .font(.system(size: 10, weight: .bold))
                    Text(name)
                        .font(.system(size: 12.5))
                    Spacer()
                }
                .padding(.horizontal, 10)
                .padding(.vertical, 5)
                .contentShape(Rectangle())
                .onTapGesture {
                    session?.adapterName = String(name.split(separator: " ").first ?? "Codex")
                }
            }
        }
        .padding(6)
        .frame(width: 180)
    }
}
