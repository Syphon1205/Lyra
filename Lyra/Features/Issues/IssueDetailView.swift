import SwiftUI

/// The issue "document" — opening an issue should feel like opening a file.
/// Used both as the trailing companion panel and inside a detached window
/// (`Open in New Window`), so it does not assume a particular host.
struct IssueDetailView: View {
    @Environment(WorkspaceStore.self) private var store
    @Environment(\.openWindow) private var openWindow
    let issue: Issue
    var showsCloseButton: Bool = true

    @State private var titleDraft: String = ""
    @State private var isEditingTitle = false
    @FocusState private var isTitleFocused: Bool

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                topBar
                titleField
                metadataRow
                Divider().opacity(0.5)
                description
                Divider().opacity(0.5)
                detailsSection
                Divider().opacity(0.5)
                activityFeed
                agentAction
            }
            .padding(20)
        }
        .lyraCanvasBackground()
        .navigationTitle(issue.identifier.description)
    }

    private var topBar: some View {
        HStack {
            Text(issue.identifier.description)
                .font(.system(size: 11.5, design: .monospaced))
                .foregroundStyle(.tertiary)
            Spacer()
            Button {
                openWindow(id: "issue-detail", value: issue.id)
            } label: {
                Image(systemName: "arrow.up.forward.app")
            }
            .buttonStyle(.borderless)
            .help("Open in New Window")

            if showsCloseButton {
                Button {
                    store.closeCompanionPanel()
                } label: {
                    Image(systemName: "xmark")
                }
                .buttonStyle(.borderless)
            }
        }
    }

    private var titleField: some View {
        TextField("Title", text: Binding(
            get: { isEditingTitle ? titleDraft : issue.title },
            set: { titleDraft = $0 }
        ), axis: .vertical)
            .textFieldStyle(.plain)
            .font(.system(size: 19, weight: .semibold))
            .focused($isTitleFocused)
            .onTapGesture {
                if !isEditingTitle {
                    titleDraft = issue.title
                    isEditingTitle = true
                    isTitleFocused = true
                }
            }
            .onSubmit(commitTitle)
            .onChange(of: isTitleFocused) { _, focused in
                if !focused { commitTitle() }
            }
    }

    private func commitTitle() {
        guard isEditingTitle, !titleDraft.isEmpty, titleDraft != issue.title else {
            isEditingTitle = false
            return
        }
        var updated = issue
        updated.title = titleDraft
        store.updateIssue(updated, undoDescription: "Rename \(issue.identifier)")
        isEditingTitle = false
    }

    private var metadataRow: some View {
        HStack(spacing: 14) {
            Menu {
                ForEach(IssueStatus.allCases) { status in
                    Button(status.displayName) { store.moveIssue(issue.id, to: status) }
                }
            } label: {
                metadataPill(issue.status.displayName, symbol: issue.status.symbolName, color: LyraColor.status(issue.status))
            }
            .menuStyle(.borderlessButton)
            .fixedSize()

            Menu {
                ForEach(IssuePriority.allCases) { priority in
                    Button(priority.displayName) { store.setPriority(issue.id, priority: priority) }
                }
            } label: {
                metadataPill(issue.priority.displayName, symbol: issue.priority.symbolName, color: LyraColor.priority(issue.priority))
            }
            .menuStyle(.borderlessButton)
            .fixedSize()

            Menu {
                Button("Unassigned") { store.assignIssue(issue.id, to: nil) }
                ForEach(store.users) { user in
                    Button(user.name) { store.assignIssue(issue.id, to: user.id) }
                }
            } label: {
                if let assignee = store.user(issue.assigneeID) {
                    HStack(spacing: 5) {
                        AvatarView(user: assignee, size: 14)
                        Text(assignee.name)
                    }
                } else {
                    Text("Unassigned")
                }
            }
            .menuStyle(.borderlessButton)
            .fixedSize()
            .font(.system(size: 11.5))
            .foregroundStyle(.secondary)

            Spacer()
        }
    }

    private func metadataPill(_ text: String, symbol: String, color: Color) -> some View {
        Label(text, systemImage: symbol)
            .font(.system(size: 11.5, weight: .medium))
            .foregroundStyle(color)
    }

    private var description: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Description")
                .font(.system(size: 11, weight: .semibold))
                .tracking(0.4)
                .foregroundStyle(.tertiary)
            Text(issue.body.isEmpty ? "No description." : issue.body)
                .font(.system(size: 13))
                .foregroundStyle(issue.body.isEmpty ? .tertiary : .primary)
                .textSelection(.enabled)
        }
    }

    private var detailsSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Details")
                .font(.system(size: 11, weight: .semibold))
                .tracking(0.4)
                .foregroundStyle(.tertiary)

            detailRow("Project", value: store.project(issue.projectID)?.name ?? "—")
            detailRow("Sprint", value: store.cycle(issue.cycleID)?.name ?? "Backlog")
            if let epic = issue.epicName {
                detailRow("Epic", value: epic)
            }
            if let estimate = issue.estimate {
                detailRow("Estimate", value: "\(estimate) pts")
            }
            if let due = issue.dueDate {
                detailRow("Due", value: due.formatted(date: .abbreviated, time: .omitted))
            }

            if !store.labels(for: issue).isEmpty {
                HStack(spacing: 6) {
                    ForEach(store.labels(for: issue)) { label in
                        LabelChip(label: label)
                    }
                }
            }

            if let branch = issue.linkedBranch {
                Label(branch, systemImage: "arrow.branch")
                    .font(.system(size: 11.5, design: .monospaced))
                    .foregroundStyle(.secondary)
            }
        }
    }

    private func detailRow(_ label: String, value: String) -> some View {
        HStack {
            Text(label)
                .font(.system(size: 11.5))
                .foregroundStyle(.secondary)
                .frame(width: 70, alignment: .leading)
            Text(value)
                .font(.system(size: 11.5))
            Spacer()
        }
    }

    private var activityFeed: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Activity")
                .font(.system(size: 11, weight: .semibold))
                .tracking(0.4)
                .foregroundStyle(.tertiary)

            VStack(alignment: .leading, spacing: 10) {
                ForEach(MockData.activity(for: issue, in: store)) { event in
                    ActivityRow(event: event)
                }
            }
        }
    }

    private var agentAction: some View {
        Button {
            store.runAgent(on: issue.id)
        } label: {
            Label("Run with Agent", systemImage: "cpu")
                .frame(maxWidth: .infinity)
        }
        .buttonStyle(.borderedProminent)
        .tint(LyraColor.accent)
        .controlSize(.large)
        .padding(.top, 4)
    }
}

private struct ActivityRow: View {
    let event: ActivityEvent

    var body: some View {
        HStack(alignment: .top, spacing: 8) {
            actorIcon
                .frame(width: 16)
            (Text(actorName).fontWeight(.medium) + Text(" " + event.detail))
                .font(.system(size: 12))
                .foregroundStyle(.secondary)
            Spacer()
            Text(event.createdAt, style: .relative)
                .font(.system(size: 10.5))
                .foregroundStyle(.quaternary)
        }
    }

    private var actorName: String {
        switch event.actor.kind {
        case .human: MockData.user(event.actor.userID)?.name ?? "Someone"
        case .agent: event.actor.agentName ?? "Agent"
        case .system: "Lyra"
        }
    }

    @ViewBuilder
    private var actorIcon: some View {
        switch event.actor.kind {
        case .human:
            Image(systemName: "person.fill")
                .font(.system(size: 9))
                .foregroundStyle(.secondary)
        case .agent:
            Image(systemName: "cpu")
                .font(.system(size: 9))
                .foregroundStyle(LyraColor.accent)
        case .system:
            Image(systemName: "checkmark.seal.fill")
                .font(.system(size: 9))
                .foregroundStyle(.green)
        }
    }
}

struct LabelChip: View {
    let label: IssueLabel

    var body: some View {
        HStack(spacing: 4) {
            Circle()
                .fill(LyraColor.swatch(seed: label.colorSeed))
                .frame(width: 6, height: 6)
            Text(label.name)
                .font(.system(size: 11))
        }
        .padding(.horizontal, 7)
        .padding(.vertical, 2)
        .background(.primary.opacity(0.06), in: Capsule())
    }
}
