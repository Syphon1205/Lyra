import SwiftUI

/// A single chat message. User messages get a subtle material background;
/// agent responses sit directly on the panel surface — no chat bubbles.
struct AgentChatBubble: View {
    let message: AgentChatMessage
    var onViewDiff: () -> Void = {}
    var onApply: () -> Void = {}

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            if message.role == .agent, let name = message.agentName {
                Text(name.uppercased())
                    .font(.system(size: 10, weight: .semibold))
                    .tracking(0.4)
                    .foregroundStyle(.tertiary)
            }

            Text(message.text)
                .font(.system(size: 12.5))
                .foregroundStyle(.primary)
                .textSelection(.enabled)
                .padding(message.role == .user ? 10 : 0)
                .background {
                    if message.role == .user {
                        RoundedRectangle(cornerRadius: 10, style: .continuous)
                            .fill(.primary.opacity(0.06))
                    }
                }

            if message.isStreaming {
                StreamingIndicator()
            }

            if let activity = message.activity {
                ActivityCard(activity: activity)
            }

            if let diff = message.diff {
                HStack(spacing: 8) {
                    Button("View Diff", action: onViewDiff)
                        .buttonStyle(.bordered)
                        .controlSize(.small)
                    Button("Apply", action: onApply)
                        .buttonStyle(.borderedProminent)
                        .tint(LyraColor.accent)
                        .controlSize(.small)
                    Spacer()
                }
                .id(diff.id)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

private struct StreamingIndicator: View {
    @State private var phase = 0

    var body: some View {
        HStack(spacing: 3) {
            ForEach(0..<3) { index in
                Circle()
                    .fill(.secondary)
                    .frame(width: 4, height: 4)
                    .opacity(phase == index ? 1 : 0.3)
            }
        }
        .task {
            while !Task.isCancelled {
                try? await Task.sleep(for: .milliseconds(320))
                phase = (phase + 1) % 3
            }
        }
    }
}

struct ActivityCard: View {
    let activity: AgentActivityItem

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack(spacing: 6) {
                Image(systemName: symbolName)
                    .font(.system(size: 10))
                    .foregroundStyle(activity.succeeded ? LyraColor.accent : .red)
                Text(activity.title)
                    .font(.system(size: 11.5, weight: .medium))
            }

            if !activity.files.isEmpty {
                VStack(alignment: .leading, spacing: 3) {
                    ForEach(activity.files) { file in
                        HStack(spacing: 8) {
                            Text(file.path)
                                .font(.system(size: 11, design: .monospaced))
                                .foregroundStyle(.secondary)
                            Spacer()
                            Text("+\(file.additions)")
                                .foregroundStyle(.green)
                            Text("-\(file.deletions)")
                                .foregroundStyle(.red)
                        }
                        .font(.system(size: 10.5, design: .monospaced))
                    }
                }
                .padding(.leading, 16)
            }

            if let detail = activity.detail {
                Text(detail)
                    .font(.system(size: 11))
                    .foregroundStyle(.secondary)
                    .padding(.leading, 16)
            }
        }
        .padding(10)
        .overlay(alignment: .leading) {
            Rectangle()
                .fill(.primary.opacity(0.1))
                .frame(width: 2)
        }
        .padding(.leading, 2)
    }

    private var symbolName: String {
        switch activity.kind {
        case .filesChanged: "doc.badge.gearshape"
        case .testsRun: "checkmark.circle"
        case .buildRan: "hammer"
        case .permissionRequested: "hand.raised"
        }
    }
}
