import SwiftUI

struct RootView: View {
    @Environment(WorkspaceStore.self) private var store
    @State private var isCommandPalettePresented = false
    @State private var columnVisibility: NavigationSplitViewVisibility = .all

    var body: some View {
        @Bindable var store = store

        NavigationSplitView(columnVisibility: $columnVisibility) {
            SidebarView()
        } detail: {
            HStack(spacing: 0) {
                ZStack {
                    if let diff = store.agentDiffPreview {
                        DiffCanvasView(diff: diff)
                    } else {
                        DetailContainerView()
                    }
                }
                .frame(maxWidth: .infinity)
                .toolbar { toolbarContent }

                CompanionPanelView()
            }
        }
        .navigationSplitViewStyle(.balanced)
        .toolbar(removing: .sidebarToggle)
        .overlay {
            if isCommandPalettePresented {
                CommandPaletteView(isPresented: $isCommandPalettePresented)
            }
        }
        .overlay {
            if store.isIssueComposerPresented {
                IssueComposerView(isPresented: $store.isIssueComposerPresented)
            }
        }
        .animation(.spring(duration: 0.28, bounce: 0.12), value: store.companionPanel)
        .preferredColorScheme(store.appearanceMode.colorScheme)
        .onReceive(NotificationCenter.default.publisher(for: .lyraCommandPaletteRequested)) { _ in
            isCommandPalettePresented = true
        }
        .onReceive(NotificationCenter.default.publisher(for: .lyraNewIssueRequested)) { _ in
            store.isIssueComposerPresented = true
        }
        .onReceive(NotificationCenter.default.publisher(for: .lyraToggleAgentPanel)) { _ in
            store.toggleAgentChat()
        }
        .onReceive(NotificationCenter.default.publisher(for: .lyraUndoRequested)) { _ in
            store.undoLastChange()
        }
        .lyraWindowChrome()
    }

    private var breadcrumb: String {
        "\(store.workspace.name) / \(selectionLabel)"
    }

    private var selectionLabel: String {
        switch store.selection {
        case .forYou: "For You"
        case .recent: "Recent"
        case .starred: "Starred"
        case .project(let id): store.project(id)?.name ?? "Project"
        case .filters: "Filters"
        case .team: "Team"
        case .agents: "Agents"
        case .runs: "Runs"
        }
    }

    @ToolbarContentBuilder
    private var toolbarContent: some ToolbarContent {
        ToolbarItem(placement: .navigation) {
            Button {
                withAnimation(.spring(duration: 0.26, bounce: 0.1)) {
                    columnVisibility = columnVisibility == .all ? .detailOnly : .all
                }
            } label: {
                Image(systemName: "sidebar.leading")
            }
        }

        ToolbarItem(placement: .principal) {
            Text(breadcrumb)
                .font(.system(size: 12.5, weight: .medium))
                .foregroundStyle(.secondary)
        }

        ToolbarItemGroup(placement: .primaryAction) {
            Button {
                isCommandPalettePresented = true
            } label: {
                Image(systemName: "magnifyingglass")
            }

            Button {
                store.toggleAgentChat()
            } label: {
                Image(systemName: "cpu")
            }

            Button {
                store.isIssueComposerPresented = true
            } label: {
                Label("Create", systemImage: "plus")
            }
            .buttonStyle(.borderedProminent)
            .tint(LyraColor.accent)
        }
    }
}

extension Notification.Name {
    static let lyraToggleAgentPanel = Notification.Name("lyraToggleAgentPanel")
    static let lyraUndoRequested = Notification.Name("lyraUndoRequested")
}
