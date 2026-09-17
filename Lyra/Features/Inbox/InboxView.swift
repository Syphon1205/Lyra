import SwiftUI

struct InboxView: View {
    @Environment(WorkspaceStore.self) private var store

    private var recentIssues: [Issue] {
        store.issues
            .filter { $0.updatedAt > Calendar.current.date(byAdding: .day, value: -3, to: .now) ?? .distantPast }
            .sorted { $0.updatedAt > $1.updatedAt }
    }

    var body: some View {
        IssueListView(issues: recentIssues, title: "Inbox", emptyTitle: "Inbox Zero", emptySubtitle: "Nothing needs your attention.")
            .navigationTitle("Inbox")
    }
}
