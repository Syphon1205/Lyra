import SwiftUI

/// The single trailing companion region: issue details and agent chat never
/// stack. Opening one replaces whatever the region was previously showing.
struct CompanionPanelView: View {
    @Environment(WorkspaceStore.self) private var store

    var body: some View {
        switch store.companionPanel {
        case .none:
            EmptyView()
        case .issueDetail(let id):
            if let issue = store.issue(id) {
                IssueDetailView(issue: issue)
                    .frame(width: 380)
                    .overlay(alignment: .leading) {
                        Rectangle().fill(LyraColor.divider).frame(width: 1)
                    }
                    .transition(.move(edge: .trailing).combined(with: .opacity))
            }
        case .agentChat:
            AgentPanelView()
                .transition(.move(edge: .trailing).combined(with: .opacity))
        }
    }
}
