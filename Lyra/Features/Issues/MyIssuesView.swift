import SwiftUI

struct MyIssuesView: View {
    @Environment(WorkspaceStore.self) private var store

    private var myIssues: [Issue] {
        store.issues(assignedTo: store.currentUser.id)
    }

    var body: some View {
        IssueListView(issues: myIssues, title: "My Issues", emptyTitle: "No issues assigned to you.", emptySubtitle: "Enjoy the silence.")
            .navigationTitle("My Issues")
    }
}
