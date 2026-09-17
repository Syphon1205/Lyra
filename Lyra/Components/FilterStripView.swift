import SwiftUI

/// The compact filter strip shown beneath a project's tab bar on Board and
/// Backlog: text search, assignee, epic, and a clear-filters action. Shared
/// so board and backlog stay in sync when the user switches views.
struct FilterStripView: View {
    @Environment(WorkspaceStore.self) private var store
    let project: Project

    var body: some View {
        @Bindable var store = store

        HStack(spacing: 10) {
            HStack(spacing: 6) {
                Image(systemName: "magnifyingglass")
                    .font(.system(size: 11))
                    .foregroundStyle(.secondary)
                TextField("Search board", text: $store.searchText)
                    .textFieldStyle(.plain)
                    .font(.system(size: 12))
            }
            .padding(.horizontal, 8)
            .padding(.vertical, 5)
            .frame(width: 180)
            .lyraCardBackground(cornerRadius: 6)

            Menu {
                Button("Any Assignee") { store.assigneeFilter = nil }
                Divider()
                ForEach(store.users.filter { project.memberIDs.contains($0.id) }) { user in
                    Button(user.name) { store.assigneeFilter = user.id }
                }
            } label: {
                filterLabel("Assignee", value: store.user(store.assigneeFilter)?.name)
            }
            .menuStyle(.borderlessButton)
            .fixedSize()

            let epics = store.epics(in: project.id)
            if !epics.isEmpty {
                Menu {
                    Button("Any Epic") { store.epicFilter = nil }
                    Divider()
                    ForEach(epics, id: \.self) { epic in
                        Button(epic) { store.epicFilter = epic }
                    }
                } label: {
                    filterLabel("Epic", value: store.epicFilter)
                }
                .menuStyle(.borderlessButton)
                .fixedSize()
            }

            if store.hasActiveFilters {
                Button("Clear Filters") {
                    store.clearFilters()
                }
                .buttonStyle(.plain)
                .font(.system(size: 11.5))
                .foregroundStyle(LyraColor.accent)
            }

            Spacer()
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 10)
    }

    private func filterLabel(_ title: String, value: String?) -> some View {
        HStack(spacing: 4) {
            Text(value ?? title)
            Image(systemName: "chevron.down")
                .font(.system(size: 8, weight: .semibold))
        }
        .font(.system(size: 11.5))
        .foregroundStyle(value == nil ? .secondary : .primary)
    }
}
