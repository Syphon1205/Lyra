import SwiftUI

/// A reusable issue list grouped by status, with an inline inspector for the
/// selected issue. Rows read like a compact document table rather than a
/// grid of cards. Used by For You, Recent, and saved-filter destinations.
struct IssueListView: View {
    @Environment(WorkspaceStore.self) private var store
    let issues: [Issue]
    var title: String?
    var emptyTitle: String = "No Issues"
    var emptySubtitle: String = "Enjoy the silence."

    private var grouped: [(IssueStatus, [Issue])] {
        IssueStatus.allCases.compactMap { status in
            let matches = issues.filter { $0.status == status }
            return matches.isEmpty ? nil : (status, matches)
        }
    }

    var body: some View {
        Group {
            if issues.isEmpty {
                LyraEmptyState(title: emptyTitle, subtitle: emptySubtitle, actionTitle: "Create Issue") {
                    store.isIssueComposerPresented = true
                }
            } else {
                ScrollView {
                    LazyVStack(alignment: .leading, spacing: 0, pinnedViews: [.sectionHeaders]) {
                        if let title {
                            Text(title.uppercased())
                                .font(.system(size: 11, weight: .semibold))
                                .tracking(0.6)
                                .foregroundStyle(.tertiary)
                                .padding(.horizontal, 20)
                                .padding(.top, 18)
                                .padding(.bottom, 6)
                        }

                        ForEach(grouped, id: \.0) { status, groupIssues in
                            Section {
                                ForEach(groupIssues) { issue in
                                    Button {
                                        store.openIssueDetail(issue.id)
                                    } label: {
                                        IssueRowView(issue: issue)
                                    }
                                    .buttonStyle(.plain)
                                    .padding(.horizontal, 16)
                                }
                            } header: {
                                HStack(spacing: 6) {
                                    Image(systemName: status.symbolName)
                                        .font(.system(size: 10))
                                    Text(status.displayName)
                                    Text("\(groupIssues.count)")
                                        .foregroundStyle(.quaternary)
                                }
                                .font(.system(size: 11, weight: .semibold))
                                .foregroundStyle(.secondary)
                                .padding(.horizontal, 20)
                                .padding(.vertical, 8)
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .background(LyraColor.canvas)
                            }
                        }
                    }
                    .padding(.bottom, 24)
                }
            }
        }
    }
}

struct LyraEmptyState: View {
    var title: String
    var subtitle: String
    var actionTitle: String
    var action: () -> Void

    var body: some View {
        VStack(spacing: 14) {
            LyraMark(size: 30)
                .opacity(0.5)
            VStack(spacing: 4) {
                Text(title)
                    .font(.system(size: 15, weight: .medium))
                if !subtitle.isEmpty {
                    Text(subtitle)
                        .font(.system(size: 12.5))
                        .foregroundStyle(.secondary)
                }
            }
            Button(action: action) {
                Text(actionTitle)
            }
            .buttonStyle(.borderedProminent)
            .tint(LyraColor.accent)
            .controlSize(.regular)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}
