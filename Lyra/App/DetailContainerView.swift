import SwiftUI

struct DetailContainerView: View {
    @Environment(WorkspaceStore.self) private var store

    var body: some View {
        Group {
            switch store.selection {
            case .forYou:
                IssueListView(
                    issues: store.issues(assignedTo: store.currentUser.id),
                    title: "For You",
                    emptyTitle: "No issues assigned to you.",
                    emptySubtitle: "Enjoy the silence."
                )
                .navigationTitle("For You")
            case .recent:
                IssueListView(
                    issues: store.recentIssueIDs.compactMap { store.issue($0) },
                    title: "Recent",
                    emptyTitle: "Nothing opened yet.",
                    emptySubtitle: "Issues you view will show up here."
                )
                .navigationTitle("Recent")
            case .starred:
                StarredProjectsView()
            case .project(let id):
                if let project = store.project(id) {
                    ProjectView(project: project)
                } else {
                    ContentUnavailableView("Project Not Found", systemImage: "questionmark.folder")
                }
            case .filters:
                FiltersView()
            case .team:
                ContentUnavailableView("Team", systemImage: "person.2")
            case .agents:
                AgentsView()
            case .runs:
                ContentUnavailableView("No Runs Yet", systemImage: "bolt")
            }
        }
        .lyraCanvasBackground()
    }
}

private struct StarredProjectsView: View {
    @Environment(WorkspaceStore.self) private var store

    private var starred: [Project] {
        store.projects.filter { store.starredProjectIDs.contains($0.id) }
    }

    var body: some View {
        Group {
            if starred.isEmpty {
                LyraEmptyState(title: "Nothing starred.", subtitle: "Star a project to pin it here.", actionTitle: "Browse Projects") {
                    store.selection = .project(store.projects.first?.id ?? MockData.project.id)
                }
            } else {
                ScrollView {
                    VStack(alignment: .leading, spacing: 2) {
                        ForEach(starred) { project in
                            Button {
                                store.selection = .project(project.id)
                            } label: {
                                HStack(spacing: 10) {
                                    Image(systemName: project.iconSymbol)
                                        .foregroundStyle(.secondary)
                                    Text(project.name)
                                        .font(.system(size: 13))
                                    Spacer()
                                }
                                .padding(10)
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    .padding(20)
                }
            }
        }
        .navigationTitle("Starred")
    }
}

/// Working, minimal saved-filter presets — not a placeholder page.
private struct FiltersView: View {
    @Environment(WorkspaceStore.self) private var store
    @State private var selectedPreset: String?

    private var presets: [(String, [Issue])] {
        [
            ("Assigned to Me", store.issues(assignedTo: store.currentUser.id)),
            ("Reported by Me", store.issues.filter { $0.creatorID == store.currentUser.id }),
            ("High Priority", store.issues.filter { $0.priority == .high || $0.priority == .urgent }),
        ]
    }

    var body: some View {
        Group {
            if let selectedPreset, let issues = presets.first(where: { $0.0 == selectedPreset })?.1 {
                IssueListView(issues: issues, title: selectedPreset, emptyTitle: "No matching issues.", emptySubtitle: "")
                    .safeAreaInset(edge: .top) {
                        Button {
                            self.selectedPreset = nil
                        } label: {
                            Label("Filters", systemImage: "chevron.left")
                        }
                        .buttonStyle(.plain)
                        .padding(12)
                    }
            } else {
                ScrollView {
                    VStack(alignment: .leading, spacing: 8) {
                        ForEach(presets, id: \.0) { name, issues in
                            Button {
                                selectedPreset = name
                            } label: {
                                HStack {
                                    Image(systemName: "line.3.horizontal.decrease.circle")
                                        .foregroundStyle(.secondary)
                                    Text(name)
                                        .font(.system(size: 13))
                                    Spacer()
                                    Text("\(issues.count)")
                                        .font(.system(size: 11.5))
                                        .foregroundStyle(.tertiary)
                                }
                                .padding(10)
                                .lyraCardBackground()
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    .padding(20)
                }
            }
        }
        .navigationTitle("Filters")
    }
}
