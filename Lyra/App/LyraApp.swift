import SwiftUI

@main
struct LyraApp: App {
    @State private var store = WorkspaceStore()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environment(store)
                .frame(minWidth: 980, minHeight: 640)
        }
        .defaultSize(width: 1440, height: 900)
        .windowToolbarStyle(.unified(showsTitle: false))
        .windowStyle(.hiddenTitleBar)
        .commands {
            LyraCommands(store: store)
        }

        // "Open in New Window" for an issue — the detached window shares the
        // same WorkspaceStore, so edits made there are visible everywhere.
        WindowGroup(id: "issue-detail", for: IssueID.self) { $issueID in
            IssueDetailWindowView(issueID: issueID)
                .environment(store)
                .frame(minWidth: 380, minHeight: 480)
        }
        .defaultSize(width: 420, height: 640)

        // "Open Chat in Window" — references the same AgentChatSession
        // (keyed by issue ID in the store), not a duplicate conversation.
        WindowGroup(id: "agent-chat", for: IssueID.self) { $issueID in
            AgentChatWindowView(issueID: issueID)
                .environment(store)
                .frame(minWidth: 380, minHeight: 480)
        }
        .defaultSize(width: 420, height: 640)

        Settings {
            SettingsView()
                .environment(store)
        }
    }
}

private struct IssueDetailWindowView: View {
    @Environment(WorkspaceStore.self) private var store
    let issueID: IssueID?

    var body: some View {
        if let issueID, let issue = store.issue(issueID) {
            IssueDetailView(issue: issue, showsCloseButton: false)
                .preferredColorScheme(store.appearanceMode.colorScheme)
        } else {
            ContentUnavailableView("Issue Not Found", systemImage: "questionmark.folder")
        }
    }
}

private struct AgentChatWindowView: View {
    @Environment(WorkspaceStore.self) private var store
    let issueID: IssueID?

    var body: some View {
        if let issueID {
            AgentPanelView(isDetachedWindow: true, pinnedIssueID: issueID)
                .preferredColorScheme(store.appearanceMode.colorScheme)
        } else {
            ContentUnavailableView("No Session", systemImage: "cpu")
        }
    }
}
