import SwiftUI

/// A real sprint-planning surface: collapsible sprint groups over the same
/// issue data the board and list views use.
struct BacklogView: View {
    @Environment(WorkspaceStore.self) private var store
    let project: Project

    @State private var collapsedGroups: Set<CycleID?> = []

    private var projectIssues: [Issue] {
        store.applyFilters(store.issues(in: project.id))
    }

    private var activeSprints: [Cycle] {
        store.cycles(in: project.id).filter(\.isActive)
    }

    private var plannedSprints: [Cycle] {
        store.cycles(in: project.id).filter { !$0.isActive }
    }

    private var unscheduled: [Issue] {
        projectIssues.filter { $0.cycleID == nil }
    }

    var body: some View {
        VStack(spacing: 0) {
            FilterStripView(project: project)
            Divider().opacity(0.5)

            ScrollView {
                LazyVStack(alignment: .leading, spacing: 4, pinnedViews: [.sectionHeaders]) {
                    ForEach(activeSprints) { sprint in
                        sprintGroup(sprint, issues: projectIssues.filter { $0.cycleID == sprint.id })
                    }
                    ForEach(plannedSprints) { sprint in
                        sprintGroup(sprint, issues: projectIssues.filter { $0.cycleID == sprint.id })
                    }
                    sprintGroup(nil, issues: unscheduled, name: "Backlog")
                }
                .padding(.bottom, 24)
            }
        }
    }

    private func sprintGroup(_ sprint: Cycle?, issues: [Issue], name: String? = nil) -> some View {
        Section {
            if !collapsedGroups.contains(sprint?.id) {
                ForEach(issues) { issue in
                    BacklogRow(issue: issue, sprints: store.cycles(in: project.id))
                }
                if issues.isEmpty {
                    Text("No issues.")
                        .font(.system(size: 11.5))
                        .foregroundStyle(.tertiary)
                        .padding(.horizontal, 20)
                        .padding(.vertical, 6)
                }
            }
        } header: {
            SprintHeader(
                title: name ?? sprint?.name ?? "Backlog",
                dateRange: sprint.map { dateRangeText($0) },
                issueCount: issues.count,
                totalEstimate: issues.compactMap(\.estimate).reduce(0, +),
                isCollapsed: collapsedGroups.contains(sprint?.id)
            ) {
                if collapsedGroups.contains(sprint?.id) {
                    collapsedGroups.remove(sprint?.id)
                } else {
                    collapsedGroups.insert(sprint?.id)
                }
            }
        }
    }

    private func dateRangeText(_ cycle: Cycle) -> String {
        "\(cycle.startDate.formatted(date: .abbreviated, time: .omitted)) – \(cycle.endDate.formatted(date: .abbreviated, time: .omitted))"
    }
}

private struct SprintHeader: View {
    let title: String
    let dateRange: String?
    let issueCount: Int
    let totalEstimate: Int
    let isCollapsed: Bool
    var toggle: () -> Void

    var body: some View {
        Button(action: toggle) {
            HStack(spacing: 8) {
                Image(systemName: isCollapsed ? "chevron.right" : "chevron.down")
                    .font(.system(size: 9, weight: .semibold))
                    .foregroundStyle(.secondary)
                Text(title)
                    .font(.system(size: 12.5, weight: .semibold))
                if let dateRange {
                    Text(dateRange)
                        .font(.system(size: 11))
                        .foregroundStyle(.secondary)
                }
                Text("\(issueCount) issues")
                    .font(.system(size: 11))
                    .foregroundStyle(.tertiary)
                if totalEstimate > 0 {
                    Text("· \(totalEstimate) pts")
                        .font(.system(size: 11))
                        .foregroundStyle(.tertiary)
                }
                Spacer()
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 8)
            .background(LyraColor.canvas)
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
    }
}

private struct BacklogRow: View {
    @Environment(WorkspaceStore.self) private var store
    let issue: Issue
    let sprints: [Cycle]
    @State private var isHovering = false

    var body: some View {
        HStack(spacing: 10) {
            Image(systemName: issue.type.symbolName)
                .font(.system(size: 11))
                .foregroundStyle(LyraColor.type(issue.type))
                .frame(width: 16)

            Text(issue.identifier.description)
                .font(.system(size: 11.5, design: .monospaced))
                .foregroundStyle(.tertiary)
                .frame(width: 64, alignment: .leading)

            Text(issue.title)
                .font(.system(size: 12.5))
                .lineLimit(1)
                .frame(maxWidth: .infinity, alignment: .leading)

            if let epic = issue.epicName {
                Text(epic)
                    .font(.system(size: 10.5, weight: .medium))
                    .foregroundStyle(LyraColor.accent)
                    .lineLimit(1)
                    .frame(width: 120, alignment: .leading)
            }

            Text(issue.status.displayName)
                .font(.system(size: 11))
                .foregroundStyle(.secondary)
                .frame(width: 84, alignment: .leading)

            if let estimate = issue.estimate {
                Text("\(estimate)")
                    .font(.system(size: 10.5, weight: .medium))
                    .frame(width: 18, height: 18)
                    .background(Circle().stroke(.secondary.opacity(0.3)))
            } else {
                Color.clear.frame(width: 18)
            }

            Group {
                if let assignee = store.user(issue.assigneeID) {
                    AvatarView(user: assignee, size: 18)
                } else {
                    Circle()
                        .strokeBorder(.secondary.opacity(0.25), style: StrokeStyle(lineWidth: 1, dash: [2]))
                        .frame(width: 18, height: 18)
                }
            }
            .frame(width: 26)
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 6)
        .background(isHovering ? Color.primary.opacity(0.04) : Color.clear)
        .contentShape(Rectangle())
        .onHover { isHovering = $0 }
        .onTapGesture { store.openIssueDetail(issue.id) }
        .contextMenu {
            Menu("Move to Sprint") {
                Button("Backlog") { store.setCycle(issue.id, cycleID: nil) }
                ForEach(sprints) { sprint in
                    Button(sprint.name) { store.setCycle(issue.id, cycleID: sprint.id) }
                }
            }
            Menu("Assignee") {
                Button("Unassigned") { store.assignIssue(issue.id, to: nil) }
                ForEach(store.users) { user in
                    Button(user.name) { store.assignIssue(issue.id, to: user.id) }
                }
            }
        }
    }
}
