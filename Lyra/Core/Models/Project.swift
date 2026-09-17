import Foundation

enum ProjectStatus: String, Codable, CaseIterable, Identifiable, Hashable {
    case planned, active, paused, completed, canceled

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .planned: "Planned"
        case .active: "Active"
        case .paused: "Paused"
        case .completed: "Completed"
        case .canceled: "Canceled"
        }
    }
}

struct Project: Identifiable, Hashable, Codable {
    let id: ProjectID
    var name: String
    var summary: String
    var status: ProjectStatus
    var iconSymbol: String
    var teamID: TeamID?
    var memberIDs: [UserID]
    var repositoryID: RepositoryID?
    var activeCycleID: CycleID?
    var targetDate: Date?
    var createdAt: Date

    /// Fraction of issues completed, 0...1. Computed by the store from live issues in practice;
    /// stored here for mock/demo purposes.
    var progress: Double
}

struct Cycle: Identifiable, Hashable, Codable {
    let id: CycleID
    var name: String
    var number: Int
    var projectID: ProjectID
    var startDate: Date
    var endDate: Date

    var isActive: Bool {
        let now = Date()
        return startDate <= now && now <= endDate
    }
}

struct Milestone: Identifiable, Hashable, Codable {
    let id: MilestoneID
    var name: String
    var projectID: ProjectID
    var targetDate: Date?
}
