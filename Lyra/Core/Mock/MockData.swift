import Foundation

/// Realistic sample data used until persistence (Phase 2) lands.
enum MockData {
    static let workspace = Workspace(id: UUID(), name: "Ambient", slug: "ambient")

    static let users: [User] = [
        User(name: "Tanner Davidson", email: "mybraincellshurt@gmail.com", colorSeed: 1),
        User(name: "Priya Shah", email: "priya@ambient.dev", colorSeed: 2),
        User(name: "Marcus Lee", email: "marcus@ambient.dev", colorSeed: 3),
        User(name: "Elena Fischer", email: "elena@ambient.dev", colorSeed: 4),
    ]

    static var currentUser: User { users[0] }

    static let team = Team(id: UUID(), name: "Core", abbreviation: "COR", memberIDs: users.map(\.id))

    static let repository = Repository(
        id: UUID(),
        name: "Lyra",
        localPath: "~/Developer/Lyra",
        currentBranch: "main",
        remoteURL: URL(string: "https://github.com/ambient/lyra")
    )

    static let labels: [IssueLabel] = [
        IssueLabel(id: UUID(), name: "bug", colorSeed: 0),
        IssueLabel(id: UUID(), name: "design", colorSeed: 4),
        IssueLabel(id: UUID(), name: "agents", colorSeed: 5),
        IssueLabel(id: UUID(), name: "performance", colorSeed: 2),
        IssueLabel(id: UUID(), name: "sidebar", colorSeed: 6),
    ]

    static let project = Project(
        id: UUID(),
        name: "Lyra Engineering",
        summary: "Native project management for humans and agents.",
        status: .active,
        iconSymbol: "square.on.square",
        teamID: team.id,
        memberIDs: users.map(\.id),
        repositoryID: repository.id,
        activeCycleID: nil,
        targetDate: Calendar.current.date(byAdding: .day, value: 21, to: .now),
        createdAt: Calendar.current.date(byAdding: .day, value: -30, to: .now) ?? .now,
        progress: 0.42
    )

    static let sandboxProject = Project(
        id: UUID(),
        name: "Sandbox",
        summary: "Scratch space for experiments.",
        status: .active,
        iconSymbol: "shippingbox",
        teamID: team.id,
        memberIDs: [users[0].id],
        repositoryID: nil,
        activeCycleID: nil,
        targetDate: nil,
        createdAt: Calendar.current.date(byAdding: .day, value: -10, to: .now) ?? .now,
        progress: 0
    )

    static let projects: [Project] = [project, sandboxProject]

    static let activeCycle = Cycle(
        id: UUID(),
        name: "Sprint 7",
        number: 7,
        projectID: project.id,
        startDate: Calendar.current.date(byAdding: .day, value: -4, to: .now) ?? .now,
        endDate: Calendar.current.date(byAdding: .day, value: 10, to: .now) ?? .now
    )

    static let plannedCycle = Cycle(
        id: UUID(),
        name: "Sprint 8",
        number: 8,
        projectID: project.id,
        startDate: Calendar.current.date(byAdding: .day, value: 11, to: .now) ?? .now,
        endDate: Calendar.current.date(byAdding: .day, value: 25, to: .now) ?? .now
    )

    static let cycle = activeCycle
    static let cycles: [Cycle] = [activeCycle, plannedCycle]

    static let epics = ["Liquid Glass Shell", "Agent Collaboration", "Board & Backlog"]

    static let issues: [Issue] = {
        let entries: [(String, IssueStatus, IssuePriority, IssueType, String?, CycleID?, Int?)] = [
            ("Fix sidebar layout regression on window resize", .inProgress, .high, .bug, epics[0], activeCycle.id, 3),
            ("Command palette should close on outside click", .todo, .medium, .bug, epics[0], activeCycle.id, 1),
            ("Fix sidebar transition", .inProgress, .high, .bug, epics[0], activeCycle.id, 2),
            ("Issue detail inspector: Markdown preview flicker", .backlog, .low, .bug, epics[0], nil, 1),
            ("Board view: drag between columns drops selection", .todo, .high, .bug, epics[2], activeCycle.id, 5),
            ("Agent session view: show elapsed time ticking", .inProgress, .medium, .task, epics[1], activeCycle.id, 2),
            ("Timeline view milestone markers overlap at small widths", .backlog, .low, .bug, epics[2], nil, 1),
            ("Keyboard: ⌘K should trap focus while open", .done, .urgent, .bug, epics[0], activeCycle.id, 2),
            ("Worktree cleanup after agent session cancellation", .todo, .high, .task, epics[1], activeCycle.id, 3),
            ("Dark mode: divider contrast too low in sidebar", .done, .medium, .bug, epics[0], activeCycle.id, 1),
            ("Support dependency graph rendering in inspector", .backlog, .none, .story, epics[2], nil, 8),
            ("Reduce Transparency fallback looks flat", .canceled, .low, .bug, epics[0], nil, 1),
            ("Design board column overflow menu", .todo, .medium, .story, epics[2], plannedCycle.id, 3),
            ("Implement backlog sprint grouping", .todo, .high, .story, epics[2], plannedCycle.id, 5),
            ("Real CLI agent adapter reference implementation", .backlog, .high, .epic, epics[1], nil, 13),
        ]

        return entries.enumerated().map { index, entry in
            let (title, status, priority, type, epic, cycleID, estimate) = entry
            let createdOffset = -Double(30 - index)
            return Issue(
                id: UUID(),
                identifier: IssueIdentifier(prefix: "LYR", number: 140 + index),
                title: title,
                body: "Details for \(title.lowercased()).",
                type: type,
                status: status,
                priority: priority,
                estimate: estimate,
                epicName: epic,
                assigneeID: index % 5 == 0 ? nil : users[index % users.count].id,
                creatorID: users[(index + 1) % users.count].id,
                labelIDs: [labels[index % labels.count].id],
                projectID: project.id,
                cycleID: cycleID,
                milestoneID: nil,
                dueDate: index % 3 == 0 ? Calendar.current.date(byAdding: .day, value: 5, to: .now) : nil,
                createdAt: Calendar.current.date(byAdding: .day, value: Int(createdOffset), to: .now) ?? .now,
                updatedAt: Calendar.current.date(byAdding: .hour, value: -index, to: .now) ?? .now,
                dependencies: [],
                parentIssueID: nil,
                linkedBranch: status == .inProgress ? "lyra/\(140 + index)-fix" : nil,
                linkedPullRequestURL: nil,
                commentCount: index % 4
            )
        }
    }()

    static func user(_ id: UserID?) -> User? {
        guard let id else { return nil }
        return users.first { $0.id == id }
    }

    static func label(_ id: LabelID) -> IssueLabel? {
        labels.first { $0.id == id }
    }

    @MainActor
    static func activity(for issue: Issue, in store: WorkspaceStore) -> [ActivityEvent] {
        var events: [ActivityEvent] = [
            ActivityEvent(
                id: UUID(),
                issueID: issue.id,
                actor: .human(issue.creatorID),
                kind: .issueCreated,
                detail: "created this issue",
                createdAt: issue.createdAt
            ),
        ]
        if issue.status == .inProgress || issue.status == .inReview || issue.status == .done {
            events.append(
                ActivityEvent(
                    id: UUID(),
                    issueID: issue.id,
                    actor: .agent("Codex"),
                    kind: .branchCreated,
                    detail: "created branch \(issue.linkedBranch ?? "lyr-\(issue.identifier.number)-fix")",
                    createdAt: issue.updatedAt.addingTimeInterval(-1800)
                )
            )
            events.append(
                ActivityEvent(
                    id: UUID(),
                    issueID: issue.id,
                    actor: .agent("Codex"),
                    kind: .commitLinked,
                    detail: "changed SidebarView.swift",
                    createdAt: issue.updatedAt.addingTimeInterval(-900)
                )
            )
            events.append(
                ActivityEvent(
                    id: UUID(),
                    issueID: issue.id,
                    actor: .system,
                    kind: .agentSessionCompleted,
                    detail: "Build passed",
                    createdAt: issue.updatedAt.addingTimeInterval(-300)
                )
            )
        }
        return events
    }

    @MainActor
    static func seedChat(for issueID: IssueID, in store: WorkspaceStore) -> [AgentChatMessage] {
        guard let issue = store.issue(issueID), issue.identifier.number == 142 else { return [] }
        return [
            AgentChatMessage(
                role: .user,
                text: "Can you investigate why the sidebar animation jumps when the inspector opens?"
            ),
            AgentChatMessage(
                role: .agent,
                agentName: "Codex",
                text: "I found the transition being applied at two different levels of the view hierarchy. I'm going to inspect SidebarContainer.swift and WorkspaceView.swift."
            ),
        ]
    }
}
