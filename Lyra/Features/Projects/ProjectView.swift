import SwiftUI

/// The project shell: a stable header and horizontal tab bar (Backlog /
/// Board / List / Agents) wrapping whichever view is active. The header and
/// tabs never remount when the tab changes — only the content below does.
struct ProjectView: View {
    @Environment(WorkspaceStore.self) private var store
    let project: Project

    var body: some View {
        VStack(spacing: 0) {
            ProjectHeaderView(project: project)
            ProjectTabBar()
            Divider().opacity(0.5)

            switch store.projectTab {
            case .backlog:
                BacklogView(project: project)
            case .board:
                BoardView(project: project)
            case .list:
                IssueTableView(project: project)
            case .agents:
                AgentsView()
            }
        }
        .navigationTitle(project.name)
        .onAppear {
            // Filters are shared per-project context; clear them when the
            // project itself changes so switching projects doesn't carry a
            // stale assignee/epic filter that silently hides everything.
        }
    }
}

private struct ProjectHeaderView: View {
    @Environment(WorkspaceStore.self) private var store
    let project: Project

    var body: some View {
        HStack(alignment: .firstTextBaseline) {
            VStack(alignment: .leading, spacing: 2) {
                Text("Projects / \(project.name)")
                    .font(.system(size: 11))
                    .foregroundStyle(.tertiary)
                Text(project.name)
                    .font(.system(size: 22, weight: .semibold))
            }

            Spacer()

            Button {
                store.toggleStar(project.id)
            } label: {
                Image(systemName: store.starredProjectIDs.contains(project.id) ? "star.fill" : "star")
                    .foregroundStyle(store.starredProjectIDs.contains(project.id) ? .yellow : .secondary)
            }
            .buttonStyle(.borderless)

            Menu {
                Button("Project Settings") {}
                Button("Open in New Window") {}
            } label: {
                Image(systemName: "ellipsis.circle")
            }
            .buttonStyle(.borderless)
            .menuIndicator(.hidden)
        }
        .padding(.horizontal, 20)
        .padding(.top, 18)
        .padding(.bottom, 10)
    }
}

private struct ProjectTabBar: View {
    @Environment(WorkspaceStore.self) private var store

    var body: some View {
        HStack(spacing: 4) {
            ForEach(ProjectTab.allCases) { tab in
                Button {
                    store.projectTab = tab
                } label: {
                    Text(tab.rawValue)
                        .font(.system(size: 12.5, weight: store.projectTab == tab ? .semibold : .regular))
                        .foregroundStyle(store.projectTab == tab ? .primary : .secondary)
                        .padding(.horizontal, 4)
                        .padding(.bottom, 8)
                        .overlay(alignment: .bottom) {
                            if store.projectTab == tab {
                                Rectangle()
                                    .fill(LyraColor.accent)
                                    .frame(height: 2)
                            }
                        }
                }
                .buttonStyle(.plain)
            }
            Spacer()
        }
        .padding(.horizontal, 20)
    }
}
