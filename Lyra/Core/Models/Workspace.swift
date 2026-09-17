import Foundation

struct Workspace: Identifiable, Hashable, Codable {
    let id: WorkspaceID
    var name: String
    var slug: String
}

struct Comment: Identifiable, Hashable, Codable {
    let id: CommentID
    var issueID: IssueID
    var author: Actor
    var body: String
    var createdAt: Date
}

struct ActivityEvent: Identifiable, Hashable, Codable {
    enum Kind: String, Codable, Hashable {
        case statusChanged, priorityChanged, assigneeChanged, commentAdded
        case commitLinked, branchCreated, pullRequestOpened
        case agentSessionStarted, agentSessionCompleted, issueCreated
    }

    let id: ActivityID
    var issueID: IssueID
    var actor: Actor
    var kind: Kind
    var detail: String
    var createdAt: Date
}

struct Repository: Identifiable, Hashable, Codable {
    let id: RepositoryID
    var name: String
    var localPath: String
    var currentBranch: String
    var remoteURL: URL?
}
