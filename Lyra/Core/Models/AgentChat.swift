import Foundation

enum AgentChatRole: Hashable {
    case user
    case agent
}

struct FileChangeSummary: Identifiable, Hashable {
    let id = UUID()
    var path: String
    var additions: Int
    var deletions: Int
}

/// An inline, structured record of something an agent did — shown as a
/// compact activity object in the chat, never as raw JSON.
struct AgentActivityItem: Identifiable, Hashable {
    enum Kind: Hashable { case filesChanged, testsRun, buildRan, permissionRequested }

    let id = UUID()
    var kind: Kind
    var title: String
    var files: [FileChangeSummary] = []
    var detail: String?
    var succeeded: Bool = true
}

struct AgentChatMessage: Identifiable, Hashable {
    let id = UUID()
    var role: AgentChatRole
    var agentName: String?
    var text: String
    var activity: AgentActivityItem?
    var diff: MockDiff?
    var createdAt: Date = .now
    var isStreaming: Bool = false
}

struct MockDiffLine: Identifiable, Hashable {
    enum Kind: Hashable { case context, addition, deletion }
    let id = UUID()
    var kind: Kind
    var text: String
}

struct MockDiff: Identifiable, Hashable {
    let id = UUID()
    var fileName: String
    var lines: [MockDiffLine]
}

/// A chat session backed by mock, scripted responses — there is no live CLI
/// process behind it. `isDemo` is surfaced in the UI (a "Demo" badge) so it
/// never reads as a working adapter connection. See ARCHITECTURE.md for what
/// a real `AgentAdapter`-backed session would additionally need.
@MainActor
@Observable
final class AgentChatSession {
    let isDemo = true
    var issueID: IssueID?
    var adapterName: String = "Codex"
    var messages: [AgentChatMessage]
    var isStreaming: Bool = false
    var pendingDiff: MockDiff?
    private var runningTask: Task<Void, Never>?

    init(issueID: IssueID? = nil, messages: [AgentChatMessage] = []) {
        self.issueID = issueID
        self.messages = messages
    }

    func send(_ text: String) {
        guard !text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { return }
        messages.append(AgentChatMessage(role: .user, text: text))
        streamMockReply()
    }

    func cancel() {
        runningTask?.cancel()
        runningTask = nil
        isStreaming = false
        if let index = messages.lastIndex(where: { $0.isStreaming }) {
            messages[index].isStreaming = false
            messages[index].text += " (canceled)"
        }
    }

    private func streamMockReply() {
        isStreaming = true
        let reply = AgentChatMessage(
            role: .agent,
            agentName: adapterName,
            text: "I found the transition being applied at two different levels of the view hierarchy. I'm going to inspect SidebarContainer.swift and WorkspaceView.swift.",
            isStreaming: true
        )
        messages.append(reply)

        runningTask = Task { [weak self] in
            try? await Task.sleep(for: .seconds(1.1))
            guard let self, !Task.isCancelled else { return }
            if let index = self.messages.lastIndex(where: { $0.id == reply.id }) {
                self.messages[index].isStreaming = false
            }
            self.isStreaming = false

            try? await Task.sleep(for: .milliseconds(400))
            guard !Task.isCancelled else { return }
            let diff = MockDiff(
                fileName: "WorkspaceView.swift",
                lines: [
                    MockDiffLine(kind: .context, text: "    .navigationSplitViewStyle(.balanced)"),
                    MockDiffLine(kind: .deletion, text: "    .animation(.default, value: isCollapsed)"),
                    MockDiffLine(kind: .addition, text: "    .animation(.spring(duration: 0.28), value: isCollapsed)"),
                    MockDiffLine(kind: .context, text: "    .transition(.move(edge: .leading))"),
                ]
            )
            let activity = AgentActivityItem(
                kind: .filesChanged,
                title: "Changed 3 files",
                files: [
                    FileChangeSummary(path: "SidebarView.swift", additions: 14, deletions: 8),
                    FileChangeSummary(path: "WorkspaceView.swift", additions: 4, deletions: 2),
                    FileChangeSummary(path: "Animation.swift", additions: 18, deletions: 0),
                ]
            )
            self.messages.append(
                AgentChatMessage(
                    role: .agent,
                    agentName: self.adapterName,
                    text: "The problem is in WorkspaceView.swift:184 — the animation is applied at both the container and the split view. I can fix this by moving it to the container only.",
                    activity: activity,
                    diff: diff
                )
            )
            self.pendingDiff = diff
        }
    }

    func approveDiff() {
        guard let diff = pendingDiff else { return }
        pendingDiff = nil
        messages.append(AgentChatMessage(role: .agent, agentName: adapterName, text: "Applied the change to \(diff.fileName). Running tests…"))
        Task { [weak self] in
            try? await Task.sleep(for: .seconds(1))
            guard let self else { return }
            self.messages.append(
                AgentChatMessage(
                    role: .agent,
                    agentName: self.adapterName,
                    text: "Tests passed.",
                    activity: AgentActivityItem(kind: .testsRun, title: "Ran 42 tests", detail: "42 passed · 0 failed", succeeded: true)
                )
            )
        }
    }
}
