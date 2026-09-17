import Foundation

enum IssueStatus: String, Codable, CaseIterable, Identifiable, Hashable {
    case backlog, todo, inProgress, inReview, done, canceled

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .backlog: "Backlog"
        case .todo: "Todo"
        case .inProgress: "In Progress"
        case .inReview: "In Review"
        case .done: "Done"
        case .canceled: "Canceled"
        }
    }

    var symbolName: String {
        switch self {
        case .backlog: "circle.dotted"
        case .todo: "circle"
        case .inProgress: "circle.lefthalf.filled"
        case .inReview: "circle.dashed.inset.filled"
        case .done: "checkmark.circle.fill"
        case .canceled: "xmark.circle.fill"
        }
    }
}

enum IssuePriority: Int, Codable, CaseIterable, Identifiable, Comparable, Hashable {
    case none = 0, low, medium, high, urgent

    var id: Int { rawValue }

    var displayName: String {
        switch self {
        case .none: "No Priority"
        case .low: "Low"
        case .medium: "Medium"
        case .high: "High"
        case .urgent: "Urgent"
        }
    }

    var symbolName: String {
        switch self {
        case .none: "minus"
        case .low: "chart.bar.fill"
        case .medium: "chart.bar.fill"
        case .high: "chart.bar.fill"
        case .urgent: "exclamationmark.triangle.fill"
        }
    }

    static func < (lhs: IssuePriority, rhs: IssuePriority) -> Bool { lhs.rawValue < rhs.rawValue }
}

enum IssueType: String, Codable, CaseIterable, Identifiable, Hashable {
    case task, bug, story, epic

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .task: "Task"
        case .bug: "Bug"
        case .story: "Story"
        case .epic: "Epic"
        }
    }

    var symbolName: String {
        switch self {
        case .task: "checkmark.square"
        case .bug: "ladybug.fill"
        case .story: "bookmark.fill"
        case .epic: "bolt.fill"
        }
    }
}

struct IssueLabel: Identifiable, Hashable, Codable {
    let id: LabelID
    var name: String
    var colorSeed: Int
}

struct IssueDependency: Hashable, Codable {
    enum Kind: String, Codable, Hashable { case blocks, blockedBy, relatesTo, subtaskOf }
    var kind: Kind
    var issueID: IssueID
}

struct Issue: Identifiable, Hashable, Codable {
    let id: IssueID
    var identifier: IssueIdentifier
    var title: String
    var body: String
    var type: IssueType
    var status: IssueStatus
    var priority: IssuePriority
    var estimate: Int?
    var epicName: String?
    var assigneeID: UserID?
    var creatorID: UserID
    var labelIDs: [LabelID]
    var projectID: ProjectID?
    var cycleID: CycleID?
    var milestoneID: MilestoneID?
    var dueDate: Date?
    var createdAt: Date
    var updatedAt: Date
    var dependencies: [IssueDependency]
    var parentIssueID: IssueID?
    var linkedBranch: String?
    var linkedPullRequestURL: URL?
    var commentCount: Int
}
