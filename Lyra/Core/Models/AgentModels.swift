import Foundation

/// A capability an agent adapter may exercise. Kept coarse-grained and explicit so
/// permission boundaries in the UI stay legible.
enum AgentScope: String, Codable, CaseIterable, Identifiable, Hashable {
    case readRepository
    case modifyRepository
    case runBuild
    case runTests
    case createBranch
    case commitChanges
    case updateIssue
    case commentOnIssue

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .readRepository: "Read Repository"
        case .modifyRepository: "Modify Repository"
        case .runBuild: "Run Build"
        case .runTests: "Run Tests"
        case .createBranch: "Create Branch"
        case .commitChanges: "Commit Changes"
        case .updateIssue: "Update Issue"
        case .commentOnIssue: "Comment on Issue"
        }
    }

    var isDestructive: Bool {
        switch self {
        case .modifyRepository, .commitChanges: true
        default: false
        }
    }
}

enum AgentSessionState: String, Codable, Hashable {
    case idle, starting, running, waitingForPermission, completed, failed, canceled
}

struct AgentConfiguration: Identifiable, Hashable, Codable {
    let id: UUID
    var adapterID: String
    var displayName: String
    var grantedScopes: [AgentScope]
}

struct AgentSession: Identifiable, Hashable, Codable {
    let id: AgentSessionID
    var issueID: IssueID
    var adapterID: String
    var repositoryID: RepositoryID?
    var branchName: String?
    var worktreePath: String?
    var state: AgentSessionState
    var startedAt: Date
    var updatedAt: Date
    var modelName: String?
    var elapsedSeconds: Int
}
