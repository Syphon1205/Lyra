import SwiftUI

/// The center canvas switches into this "agent workspace" surface when the
/// user asks to view a proposed change. Lyra supervises agent work — this is
/// a review surface, not a code editor.
struct DiffCanvasView: View {
    @Environment(WorkspaceStore.self) private var store
    let diff: MockDiff

    var body: some View {
        VStack(spacing: 0) {
            HStack(spacing: 10) {
                Button {
                    withAnimation(.spring(duration: 0.28, bounce: 0.12)) {
                        store.agentDiffPreview = nil
                    }
                } label: {
                    Image(systemName: "chevron.left")
                }
                .buttonStyle(.borderless)

                Image(systemName: "doc.text")
                    .font(.system(size: 11))
                    .foregroundStyle(.secondary)
                Text(diff.fileName)
                    .font(.system(size: 12.5, design: .monospaced))
                Spacer()

                Button {
                    if let issueID = store.agentChatIssueID {
                        store.chatSession(for: issueID).approveDiff()
                    }
                    withAnimation(.spring(duration: 0.28, bounce: 0.12)) {
                        store.agentDiffPreview = nil
                    }
                } label: {
                    Text("Approve")
                }
                .buttonStyle(.borderedProminent)
                .tint(LyraColor.accent)
                .controlSize(.small)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 12)

            Divider().opacity(0.5)

            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    ForEach(diff.lines) { line in
                        DiffLineRow(line: line)
                    }
                }
                .padding(.vertical, 8)
            }
        }
        .lyraCanvasBackground()
        .transition(.asymmetric(
            insertion: .move(edge: .trailing).combined(with: .opacity),
            removal: .opacity
        ))
    }
}

private struct DiffLineRow: View {
    let line: MockDiffLine

    var body: some View {
        HStack(spacing: 0) {
            Text(marker)
                .font(.system(size: 11.5, design: .monospaced))
                .foregroundStyle(markerColor)
                .frame(width: 24, alignment: .center)
            Text(line.text)
                .font(.system(size: 11.5, design: .monospaced))
                .foregroundStyle(textColor)
            Spacer(minLength: 0)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 2)
        .background(backgroundColor)
    }

    private var marker: String {
        switch line.kind {
        case .context: " "
        case .addition: "+"
        case .deletion: "−"
        }
    }

    private var markerColor: Color {
        switch line.kind {
        case .context: .clear
        case .addition: .green
        case .deletion: .red
        }
    }

    private var textColor: Color {
        line.kind == .context ? .secondary : .primary
    }

    private var backgroundColor: Color {
        switch line.kind {
        case .context: .clear
        case .addition: .green.opacity(0.1)
        case .deletion: .red.opacity(0.1)
        }
    }
}
