import Foundation
import Observation
import SwiftUI

/// Sidebar navigation destinations. Kept flat and explicit rather than a generic
/// "selection" enum so each destination can carry the identifiers it needs.
enum SidebarSelection: Hashable {
    case forYou
    case recent
    case starred
    case project(ProjectID)
    case filters
    case team(TeamID)
    case agents
    case runs
}

/// A project opens on one of these horizontal tabs; switching tabs must not
/// lose the project header or the current filters.
enum ProjectTab: String, CaseIterable, Identifiable {
    case backlog = "Backlog"
    case board = "Board"
    case list = "List"
    case agents = "Agents"

    var id: String { rawValue }
}

/// What occupies the single trailing companion region. Issue details and
/// agent chat never stack — opening one replaces the other.
enum CompanionPanel: Hashable {
    case none
    case issueDetail(IssueID)
    case agentChat
}

enum AppearanceMode: String, CaseIterable, Identifiable {
    case system = "Follow System"
    case light = "Light"
    case dark = "Dark"

    var id: String { rawValue }

    var colorScheme: ColorScheme? {
        switch self {
        case .system: nil
        case .light: .light
        case .dark: .dark
        }
    }
}

/// The in-memory source of truth for Phase 1. Backed by mock data today;
/// the persistence layer (Phase 2) will replace the storage underneath
/// this store without changing its public surface.
@MainActor
@Observable
final class WorkspaceStore {
    var workspace: Workspace
    var currentUser: User
    var users: [User]
    var teams: [Team]
    var projects: [Project]
    var cycles: [Cycle]
    var labels: [IssueLabel]
    var issues: [Issue]
    var repositories: [Repository]

    var selection: SidebarSelection = .project(MockData.project.id)
    var projectTab: ProjectTab = .board
    var companionPanel: CompanionPanel = .none
    var isIssueComposerPresented = false
    var agentDiffPreview: MockDiff?
    var appearanceMode: AppearanceMode = .system

    // Board / backlog filters — shared so switching views keeps the same filter.
    var searchText: String = ""
    var assigneeFilter: UserID?
    var epicFilter: String?

    var starredProjectIDs: Set<ProjectID> = []
    var recentIssueIDs: [IssueID] = []

    private var chatSessions: [IssueID: AgentChatSession] = [:]
    private var undoStack: [(issueID: IssueID, previous: Issue)] = []
    var lastUndoDescription: String?

    init() {
        workspace = MockData.workspace
        currentUser = MockData.currentUser
        users = MockData.users
        teams = [MockData.team]
        projects = MockData.projects
        cycles = MockData.cycles
        labels = MockData.labels
        issues = MockData.issues
        repositories = [MockData.repository]
        starredProjectIDs = [MockData.project.id]
    }

    // MARK: - Lookups

    func user(_ id: UserID?) -> User? {
        guard let id else { return nil }
        return users.first { $0.id == id }
    }

    func project(_ id: ProjectID?) -> Project? {
        guard let id else { return nil }
        return projects.first { $0.id == id }
    }

    func cycle(_ id: CycleID?) -> Cycle? {
        guard let id else { return nil }
        return cycles.first { $0.id == id }
    }

    func cycles(in project: ProjectID) -> [Cycle] {
        cycles.filter { $0.projectID == project }
    }

    func labels(for issue: Issue) -> [IssueLabel] {
        issue.labelIDs.compactMap { id in labels.first { $0.id == id } }
    }

    func issues(in project: ProjectID) -> [Issue] {
        issues.filter { $0.projectID == project }
    }

    func issues(assignedTo user: UserID) -> [Issue] {
        issues.filter { $0.assigneeID == user }
    }

    func issue(_ id: IssueID?) -> Issue? {
        guard let id else { return nil }
        return issues.first { $0.id == id }
    }

    /// Epics referenced by issues in a project, in first-seen order — used to
    /// populate the epic filter without a separate Epic model.
    func epics(in project: ProjectID) -> [String] {
        var seen: [String] = []
        for issue in issues(in: project) where issue.projectID == project {
            if let epic = issue.epicName, !seen.contains(epic) { seen.append(epic) }
        }
        return seen
    }

    /// Applies the shared search/assignee/epic filters to a set of issues,
    /// preserving the caller's ordering.
    func applyFilters(_ source: [Issue]) -> [Issue] {
        source.filter { issue in
            if let assigneeFilter, issue.assigneeID != assigneeFilter { return false }
            if let epicFilter, issue.epicName != epicFilter { return false }
            if !searchText.isEmpty {
                let q = searchText.lowercased()
                if !issue.title.lowercased().contains(q) && !issue.identifier.description.lowercased().contains(q) {
                    return false
                }
            }
            return true
        }
    }

    func clearFilters() {
        searchText = ""
        assigneeFilter = nil
        epicFilter = nil
    }

    var hasActiveFilters: Bool {
        !searchText.isEmpty || assigneeFilter != nil || epicFilter != nil
    }

    // MARK: - Mutations

    func updateIssue(_ issue: Issue, recordUndo: Bool = true, undoDescription: String? = nil) {
        guard let index = issues.firstIndex(where: { $0.id == issue.id }) else { return }
        if recordUndo {
            undoStack.append((issue.id, issues[index]))
            lastUndoDescription = undoDescription
        }
        var updated = issue
        updated.updatedAt = .now
        issues[index] = updated
    }

    func moveIssue(_ issueID: IssueID, to status: IssueStatus) {
        guard var issue = issue(issueID), issue.status != status else { return }
        let fromStatus = issue.status
        issue.status = status
        updateIssue(issue, undoDescription: "Move \(issue.identifier) to \(status.displayName)")
        _ = fromStatus
    }

    func assignIssue(_ issueID: IssueID, to userID: UserID?) {
        guard var issue = issue(issueID) else { return }
        issue.assigneeID = userID
        updateIssue(issue, undoDescription: "Change assignee on \(issue.identifier)")
    }

    func setPriority(_ issueID: IssueID, priority: IssuePriority) {
        guard var issue = issue(issueID) else { return }
        issue.priority = priority
        updateIssue(issue, undoDescription: "Change priority on \(issue.identifier)")
    }

    func setCycle(_ issueID: IssueID, cycleID: CycleID?) {
        guard var issue = issue(issueID) else { return }
        issue.cycleID = cycleID
        updateIssue(issue, undoDescription: "Move \(issue.identifier) to sprint")
    }

    func undoLastChange() {
        guard let last = undoStack.popLast() else { return }
        guard let index = issues.firstIndex(where: { $0.id == last.issueID }) else { return }
        issues[index] = last.previous
        lastUndoDescription = nil
    }

    var canUndo: Bool { !undoStack.isEmpty }

    func toggleStar(_ projectID: ProjectID) {
        if starredProjectIDs.contains(projectID) {
            starredProjectIDs.remove(projectID)
        } else {
            starredProjectIDs.insert(projectID)
        }
    }

    func recordRecent(_ issueID: IssueID) {
        recentIssueIDs.removeAll { $0 == issueID }
        recentIssueIDs.insert(issueID, at: 0)
        if recentIssueIDs.count > 10 { recentIssueIDs.removeLast() }
    }

    // MARK: - Companion panel

    func openIssueDetail(_ issueID: IssueID) {
        recordRecent(issueID)
        companionPanel = .issueDetail(issueID)
    }

    func closeCompanionPanel() {
        withAnimation(.spring(duration: 0.28, bounce: 0.12)) {
            companionPanel = .none
        }
    }

    var selectedIssueID: IssueID? {
        if case .issueDetail(let id) = companionPanel { return id }
        return nil
    }

    var isAgentPanelPresented: Bool {
        if case .agentChat = companionPanel { return true }
        return false
    }

    func chatSession(for issueID: IssueID) -> AgentChatSession {
        if let existing = chatSessions[issueID] { return existing }
        let session = AgentChatSession(issueID: issueID, messages: MockData.seedChat(for: issueID, in: self))
        chatSessions[issueID] = session
        return session
    }

    /// The issue currently attached to the agent chat context, if any.
    var agentChatIssueID: IssueID?

    func runAgent(on issueID: IssueID) {
        recordRecent(issueID)
        agentChatIssueID = issueID
        withAnimation(.spring(duration: 0.32, bounce: 0.15)) {
            companionPanel = .agentChat
        }
    }

    func toggleAgentChat() {
        withAnimation(.spring(duration: 0.32, bounce: 0.15)) {
            if isAgentPanelPresented {
                companionPanel = .none
            } else {
                if agentChatIssueID == nil { agentChatIssueID = selectedIssueID }
                companionPanel = .agentChat
            }
        }
    }

    func createIssue(title: String, type: IssueType, priority: IssuePriority, status: IssueStatus, assigneeID: UserID?, projectID: ProjectID?) {
        let number = (issues.map(\.identifier.number).max() ?? 139) + 1
        let issue = Issue(
            id: UUID(),
            identifier: IssueIdentifier(prefix: "LYR", number: number),
            title: title,
            body: "",
            type: type,
            status: status,
            priority: priority,
            estimate: nil,
            epicName: nil,
            assigneeID: assigneeID,
            creatorID: currentUser.id,
            labelIDs: [],
            projectID: projectID ?? projects.first?.id,
            cycleID: nil,
            milestoneID: nil,
            dueDate: nil,
            createdAt: .now,
            updatedAt: .now,
            dependencies: [],
            parentIssueID: nil,
            linkedBranch: nil,
            linkedPullRequestURL: nil,
            commentCount: 0
        )
        issues.insert(issue, at: 0)
        openIssueDetail(issue.id)
    }
}
