import SwiftUI

struct IssueRowView: View {
    @Environment(WorkspaceStore.self) private var store
    let issue: Issue
    @State private var isHovering = false

    var body: some View {
        HStack(spacing: 0) {
            Image(systemName: issue.status.symbolName)
                .font(.system(size: 11))
                .foregroundStyle(LyraColor.status(issue.status))
                .frame(width: 20, alignment: .leading)

            Text(issue.identifier.description)
                .font(.system(size: 12, design: .monospaced))
                .foregroundStyle(.tertiary)
                .frame(width: 62, alignment: .leading)

            Text(issue.title)
                .font(.system(size: 13))
                .lineLimit(1)
                .frame(maxWidth: .infinity, alignment: .leading)

            if isHovering {
                HStack(spacing: 6) {
                    ForEach(store.labels(for: issue)) { label in
                        Circle()
                            .fill(LyraColor.swatch(seed: label.colorSeed))
                            .frame(width: 5, height: 5)
                    }
                }
                .transition(.opacity)
            }

            Spacer(minLength: 12)

            Text(issue.status.displayName)
                .font(.system(size: 11.5))
                .foregroundStyle(.secondary)
                .frame(width: 88, alignment: .leading)

            if issue.priority != .none {
                Image(systemName: issue.priority.symbolName)
                    .font(.system(size: 10))
                    .foregroundStyle(LyraColor.priority(issue.priority))
                    .frame(width: 16)
            } else {
                Color.clear.frame(width: 16)
            }

            Group {
                if let assignee = store.user(issue.assigneeID) {
                    AvatarView(user: assignee, size: 18)
                } else {
                    Circle()
                        .strokeBorder(.secondary.opacity(0.25), style: StrokeStyle(lineWidth: 1, dash: [2]))
                        .frame(width: 18, height: 18)
                }
            }
            .frame(width: 30, alignment: .trailing)
        }
        .padding(.vertical, 6)
        .padding(.horizontal, 4)
        .contentShape(Rectangle())
        .background {
            if isHovering {
                RoundedRectangle(cornerRadius: 6, style: .continuous)
                    .fill(.primary.opacity(0.045))
            }
        }
        .onHover { hovering in
            withAnimation(.easeOut(duration: 0.12)) { isHovering = hovering }
        }
    }
}
