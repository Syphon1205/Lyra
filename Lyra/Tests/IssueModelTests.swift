import Testing
@testable import Lyra

struct IssueModelTests {
    @Test func issueIdentifierDescribesAsPrefixNumber() {
        let identifier = IssueIdentifier(prefix: "LYR", number: 142)
        #expect(identifier.description == "LYR-142")
    }

    @Test func priorityOrdersLowToUrgent() {
        #expect(IssuePriority.low < IssuePriority.urgent)
        #expect(IssuePriority.none < IssuePriority.low)
    }
}
