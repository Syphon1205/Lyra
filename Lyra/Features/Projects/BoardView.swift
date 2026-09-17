import SwiftUI

/// The default screen when a project opens: a live, filterable board with
/// draggable cards. Columns are derived from `IssueStatus`, never hard-coded
/// per view — moving a card mutates the shared issue store directly.
struct BoardView: View {
    @Environment(WorkspaceStore.self) private var store
    let project: Project

    private let columns: [IssueStatus] = [.todo, .inProgress, .inReview, .done]

    private var boardIssues: [Issue] {
        store.applyFilters(store.issues(in: project.id).filter { $0.status != .backlog && $0.status != .canceled })
    }

    var body: some View {
        VStack(spacing: 0) {
            FilterStripView(project: project)
            Divider().opacity(0.5)

            ScrollView(.horizontal) {
                HStack(alignment: .top, spacing: 12) {
                    ForEach(columns) { status in
                        BoardColumn(
                            status: status,
                            issues: boardIssues.filter { $0.status == status },
                            project: project
                        )
                    }
                }
                .padding(20)
            }
        }
    }
}

private struct BoardColumn: View {
    @Environment(WorkspaceStore.self) private var store
    let status: IssueStatus
    let issues: [Issue]
    let project: Project
    @State private var isDropTargeted = false

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(spacing: 6) {
                Circle()
                    .fill(LyraColor.status(status))
                    .frame(width: 6, height: 6)
                Text(status.displayName.uppercased())
                    .font(.system(size: 10.5, weight: .semibold))
                    .tracking(0.4)
                Text("\(issues.count)")
                    .font(.system(size: 10.5))
                    .foregroundStyle(.quaternary)
                Spacer()
                Menu {
                    Button("Collapse Column") {}
                    Button("Sort by Priority") {}
                } label: {
                    Image(systemName: "ellipsis")
                }
                .buttonStyle(.borderless)
                .menuIndicator(.hidden)
                .fixedSize()
            }
            .foregroundStyle(.secondary)
            .padding(.horizontal, 4)

            VStack(spacing: 8) {
                ForEach(issues) { issue in
                    BoardCard(issue: issue)
                        .draggable(issue.id.uuidString) {
                            BoardCard(issue: issue).frame(width: 264)
                        }
                }
            }

            InlineCreateButton(status: status, project: project)
        }
        .frame(width: 280, alignment: .top)
        .padding(8)
        .background {
            RoundedRectangle(cornerRadius: 8, style: .continuous)
                .fill(isDropTargeted ? LyraColor.accent.opacity(0.08) : Color.clear)
        }
        .dropDestination(for: String.self) { items, _ in
            guard let raw = items.first, let id = UUID(uuidString: raw) else { return false }
            store.moveIssue(id, to: status)
            return true
        } isTargeted: { targeted in
            isDropTargeted = targeted
        }
    }
}

private struct InlineCreateButton: View {
    @Environment(WorkspaceStore.self) private var store
    let status: IssueStatus
    let project: Project
    @State private var isEditing = false
    @State private var title = ""
    @FocusState private var isFocused: Bool

    var body: some View {
        if isEditing {
            VStack(alignment: .leading, spacing: 6) {
                TextField("What needs to be done?", text: $title)
                    .textFieldStyle(.plain)
                    .font(.system(size: 12.5))
                    .focused($isFocused)
                    .onSubmit(create)
                HStack {
                    Button("Create", action: create)
                        .buttonStyle(.borderedProminent)
                        .tint(LyraColor.accent)
                        .controlSize(.small)
                        .disabled(title.isEmpty)
                    Button("Cancel") { isEditing = false; title = "" }
                        .buttonStyle(.plain)
                        .controlSize(.small)
                }
            }
            .padding(10)
            .lyraCardBackground()
            .onAppear { isFocused = true }
        } else {
            Button {
                isEditing = true
            } label: {
                Label("Create", systemImage: "plus")
                    .font(.system(size: 12))
                    .foregroundStyle(.secondary)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
            .buttonStyle(.plain)
            .padding(.horizontal, 4)
            .padding(.top, 2)
        }
    }

    private func create() {
        guard !title.isEmpty else { return }
        store.createIssue(title: title, type: .task, priority: .medium, status: status, assigneeID: nil, projectID: project.id)
        title = ""
        isEditing = false
    }
}

private struct BoardCard: View {
    @Environment(WorkspaceStore.self) private var store
    let issue: Issue

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            if let epic = issue.epicName {
                Text(epic)
                    .font(.system(size: 10, weight: .medium))
                    .foregroundStyle(LyraColor.accent)
                    .lineLimit(1)
            }

            Text(issue.title)
                .font(.system(size: 12.5))
                .lineLimit(3)
                .fixedSize(horizontal: false, vertical: true)

            if agentIsRunning {
                Label("Agent running", systemImage: "cpu")
                    .font(.system(size: 10))
                    .foregroundStyle(.orange)
            }

            HStack(spacing: 6) {
                Image(systemName: issue.type.symbolName)
                    .font(.system(size: 10))
                    .foregroundStyle(LyraColor.type(issue.type))
                Text(issue.identifier.description)
                    .font(.system(size: 10.5, design: .monospaced))
                    .foregroundStyle(.tertiary)

                if issue.priority != .none {
                    Image(systemName: issue.priority.symbolName)
                        .font(.system(size: 9.5))
                        .foregroundStyle(LyraColor.priority(issue.priority))
                }

                Spacer()

                if let estimate = issue.estimate {
                    Text("\(estimate)")
                        .font(.system(size: 10, weight: .medium))
                        .foregroundStyle(.secondary)
                        .frame(width: 16, height: 16)
                        .background(Circle().stroke(.secondary.opacity(0.3)))
                }

                if let assignee = store.user(issue.assigneeID) {
                    AvatarView(user: assignee, size: 18)
                } else {
                    Circle()
                        .strokeBorder(.secondary.opacity(0.25), style: StrokeStyle(lineWidth: 1, dash: [2]))
                        .frame(width: 18, height: 18)
                }
            }
        }
        .padding(12)
        .frame(maxWidth: .infinity, alignment: .leading)
        .lyraCardBackground()
        .contentShape(Rectangle())
        .onTapGesture { store.openIssueDetail(issue.id) }
        .contextMenu {
            Menu("Move To") {
                ForEach([IssueStatus.todo, .inProgress, .inReview, .done], id: \.self) { status in
                    Button(status.displayName) { store.moveIssue(issue.id, to: status) }
                }
            }
            Menu("Assignee") {
                Button("Unassigned") { store.assignIssue(issue.id, to: nil) }
                ForEach(store.users) { user in
                    Button(user.name) { store.assignIssue(issue.id, to: user.id) }
                }
            }
            Menu("Priority") {
                ForEach(IssuePriority.allCases) { priority in
                    Button(priority.displayName) { store.setPriority(issue.id, priority: priority) }
                }
            }
            Divider()
            Button("Open Issue") { store.openIssueDetail(issue.id) }
        }
    }

    private var agentIsRunning: Bool {
        store.isAgentPanelPresented && store.agentChatIssueID == issue.id
    }
}
