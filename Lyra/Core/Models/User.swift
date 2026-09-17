import Foundation

struct User: Identifiable, Hashable, Codable {
    let id: UserID
    var name: String
    var email: String
    var initials: String
    var colorSeed: Int

    init(id: UserID = UUID(), name: String, email: String, colorSeed: Int = 0) {
        self.id = id
        self.name = name
        self.email = email
        self.colorSeed = colorSeed
        let parts = name.split(separator: " ")
        self.initials = parts.prefix(2).compactMap { $0.first }.map(String.init).joined().uppercased()
    }
}

struct Team: Identifiable, Hashable, Codable {
    let id: TeamID
    var name: String
    var abbreviation: String
    var memberIDs: [UserID]
}

/// Distinguishes who performed an action for activity/audit purposes.
enum ActorKind: String, Codable, Hashable {
    case human
    case agent
    case system
}

struct Actor: Hashable, Codable {
    var kind: ActorKind
    var userID: UserID?
    var agentName: String?

    static func human(_ id: UserID) -> Actor { Actor(kind: .human, userID: id, agentName: nil) }
    static func agent(_ name: String) -> Actor { Actor(kind: .agent, userID: nil, agentName: name) }
    static let system = Actor(kind: .system, userID: nil, agentName: nil)
}
