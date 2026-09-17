import SwiftUI

struct AgentsView: View {
    @Environment(WorkspaceStore.self) private var store

    private var activeIssue: Issue? {
        store.issues.first { $0.identifier.number == 142 }
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                if let activeIssue {
                    sectionHeader("Active")
                    AgentSessionRow(
                        agentName: "Codex",
                        title: activeIssue.title,
                        subtitle: activeIssue.identifier.description,
                        status: "Working…",
                        statusColor: .orange
                    ) {
                        store.runAgent(on: activeIssue.id)
                    }
                }

                sectionHeader("Recent")
                AgentSessionRow(
                    agentName: "Claude",
                    title: "Investigate sync failure",
                    subtitle: nil,
                    status: "Completed 12m ago",
                    statusColor: .secondary
                ) {}
            }
            .padding(20)
        }
        .lyraCanvasBackground()
        .navigationTitle("Agents")
    }

    private func sectionHeader(_ text: String) -> some View {
        Text(text.uppercased())
            .font(.system(size: 11, weight: .semibold))
            .tracking(0.6)
            .foregroundStyle(.tertiary)
    }
}

private struct AgentSessionRow: View {
    let agentName: String
    let title: String
    let subtitle: String?
    let status: String
    let statusColor: Color
    var action: () -> Void
    @State private var isHovering = false

    var body: some View {
        Button(action: action) {
            HStack(spacing: 12) {
                Image(systemName: "cpu")
                    .font(.system(size: 13))
                    .foregroundStyle(LyraColor.accent)
                    .frame(width: 22)

                VStack(alignment: .leading, spacing: 2) {
                    HStack(spacing: 6) {
                        Text(agentName)
                            .font(.system(size: 12.5, weight: .semibold))
                        if let subtitle {
                            Text(subtitle)
                                .font(.system(size: 11, design: .monospaced))
                                .foregroundStyle(.tertiary)
                        }
                    }
                    Text(title)
                        .font(.system(size: 12))
                        .foregroundStyle(.secondary)
                }

                Spacer()

                Text(status)
                    .font(.system(size: 11))
                    .foregroundStyle(statusColor)
            }
            .padding(10)
            .background {
                if isHovering {
                    RoundedRectangle(cornerRadius: 8, style: .continuous)
                        .fill(.primary.opacity(0.045))
                }
            }
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .onHover { isHovering = $0 }
    }
}
