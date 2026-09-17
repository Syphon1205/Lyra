import Foundation

/// A stable, human-readable issue identifier such as "LYR-142".
struct IssueIdentifier: Hashable, Codable, CustomStringConvertible, Comparable {
    let prefix: String
    let number: Int

    var description: String { "\(prefix)-\(number)" }

    static func < (lhs: IssueIdentifier, rhs: IssueIdentifier) -> Bool {
        lhs.number < rhs.number
    }
}

typealias WorkspaceID = UUID
typealias UserID = UUID
typealias TeamID = UUID
typealias ProjectID = UUID
typealias IssueID = UUID
typealias CycleID = UUID
typealias MilestoneID = UUID
typealias LabelID = UUID
typealias CommentID = UUID
typealias ActivityID = UUID
typealias RepositoryID = UUID
typealias AgentSessionID = UUID
