import SwiftUI

/// A column-based table — the same issue data as Board and Backlog, sortable
/// and with native multi-selection.
struct IssueTableView: View {
    @Environment(WorkspaceStore.self) private var store
    let project: Project

    @State private var selection = Set<IssueID>()
    @State private var sortOrder = [KeyPathComparator(\Issue.identifier.number)]

    private var rows: [Issue] {
        store.applyFilters(store.issues(in: project.id)).sorted(using: sortOrder)
    }

    var body: some View {
        VStack(spacing: 0) {
            FilterStripView(project: project)
            Divider().opacity(0.5)

            Table(rows, selection: $selection, sortOrder: $sortOrder) {
                TableColumn("Type", value: \Issue.type.rawValue) { issue in
                    Image(systemName: issue.type.symbolName)
                        .foregroundStyle(LyraColor.type(issue.type))
                }
                .width(36)

                TableColumn("Key", value: \Issue.identifier.number) { issue in
                    Text(issue.identifier.description)
                        .font(.system(size: 11.5, design: .monospaced))
                        .foregroundStyle(.secondary)
                }
                .width(70)

                TableColumn("Summary", value: \Issue.title) { issue in
                    Text(issue.title)
                        .font(.system(size: 12.5))
                        .lineLimit(1)
                }
                .width(min: 220, ideal: 320)

                TableColumn("Status", value: \Issue.status.rawValue) { issue in
                    Text(issue.status.displayName)
                        .font(.system(size: 11.5))
                        .foregroundStyle(LyraColor.status(issue.status))
                }
                .width(100)

                TableColumn("Assignee") { issue in
                    Text(store.user(issue.assigneeID)?.name ?? "Unassigned")
                        .font(.system(size: 11.5))
                        .foregroundStyle(issue.assigneeID == nil ? .tertiary : .primary)
                }
                .width(120)

                TableColumn("Priority", value: \Issue.priority.rawValue) { issue in
                    Text(issue.priority.displayName)
                        .font(.system(size: 11.5))
                        .foregroundStyle(LyraColor.priority(issue.priority))
                }
                .width(90)

                TableColumn("Sprint") { issue in
                    Text(store.cycle(issue.cycleID)?.name ?? "—")
                        .font(.system(size: 11.5))
                        .foregroundStyle(.secondary)
                }
                .width(80)

                TableColumn("Updated") { issue in
                    Text(issue.updatedAt, style: .relative)
                        .font(.system(size: 11))
                        .foregroundStyle(.tertiary)
                }
                .width(90)
            }
            .contextMenu(forSelectionType: IssueID.self) { ids in
                if let id = ids.first {
                    Button("Open Issue") { store.openIssueDetail(id) }
                }
            } primaryAction: { ids in
                if let id = ids.first {
                    store.openIssueDetail(id)
                }
            }
        }
    }
}
