import SwiftUI

struct PaletteAction: Identifiable {
    let id = UUID()
    let title: String
    let symbolName: String
    let subtitle: String?
    let perform: () -> Void

    init(_ title: String, symbolName: String, subtitle: String? = nil, perform: @escaping () -> Void) {
        self.title = title
        self.symbolName = symbolName
        self.subtitle = subtitle
        self.perform = perform
    }
}

struct CommandPaletteView: View {
    @Environment(WorkspaceStore.self) private var store
    @Binding var isPresented: Bool
    @State private var query = ""
    @State private var highlightedIndex = 0
    @FocusState private var isFieldFocused: Bool

    private var actions: [PaletteAction] {
        let base: [PaletteAction] = [
            PaletteAction("Create Issue", symbolName: "plus.circle") {
                isPresented = false
                store.isIssueComposerPresented = true
            },
            PaletteAction("Ask Agent", symbolName: "cpu") {
                isPresented = false
                store.toggleAgentChat()
            },
            PaletteAction("Search Issues", symbolName: "magnifyingglass") { isPresented = false },
            PaletteAction("Go to For You", symbolName: "person.crop.circle") {
                store.selection = .forYou
                isPresented = false
            },
            PaletteAction("Go to Recent", symbolName: "clock") {
                store.selection = .recent
                isPresented = false
            },
            PaletteAction("Go to Agents", symbolName: "cpu") {
                store.selection = .agents
                isPresented = false
            },
            PaletteAction("Open Settings", symbolName: "gearshape") { isPresented = false },
        ]

        let projectActions = store.projects.map { project in
            PaletteAction("Open \(project.name)", symbolName: project.iconSymbol) {
                store.selection = .project(project.id)
                isPresented = false
            }
        }

        let all = base + projectActions
        guard !query.isEmpty else { return all }
        return all.filter { $0.title.localizedCaseInsensitiveContains(query) }
    }

    var body: some View {
        ZStack {
            Color.black.opacity(0.001)
                .onTapGesture { isPresented = false }
                .ignoresSafeArea()

            VStack(spacing: 0) {
                HStack(spacing: 8) {
                    Image(systemName: "magnifyingglass")
                        .foregroundStyle(.secondary)
                    TextField("Type a command or search…", text: $query)
                        .textFieldStyle(.plain)
                        .font(.title3)
                        .focused($isFieldFocused)
                        .onSubmit { runHighlighted() }
                }
                .padding(14)

                if !actions.isEmpty {
                    Divider()
                    ScrollView {
                        VStack(spacing: 2) {
                            ForEach(Array(actions.enumerated()), id: \.element.id) { index, action in
                                PaletteRow(action: action, isHighlighted: index == highlightedIndex)
                                    .onTapGesture { action.perform() }
                            }
                        }
                        .padding(6)
                    }
                    .frame(maxHeight: 320)
                }
            }
            .frame(width: 560)
            .lyraGlass(.transient, cornerRadius: 16)
            .shadow(color: .black.opacity(0.3), radius: 30, y: 10)
            .padding(.top, 100)
            .frame(maxHeight: .infinity, alignment: .top)
            .onKeyPress(.escape) { isPresented = false; return .handled }
            .onKeyPress(.downArrow) {
                highlightedIndex = min(highlightedIndex + 1, max(actions.count - 1, 0))
                return .handled
            }
            .onKeyPress(.upArrow) {
                highlightedIndex = max(highlightedIndex - 1, 0)
                return .handled
            }
        }
        .onAppear { isFieldFocused = true }
        .onChange(of: query) { highlightedIndex = 0 }
        .transition(.opacity.combined(with: .scale(scale: 0.98)))
        .animation(.spring(duration: 0.18), value: isPresented)
    }

    private func runHighlighted() {
        guard actions.indices.contains(highlightedIndex) else { return }
        actions[highlightedIndex].perform()
    }
}

private struct PaletteRow: View {
    let action: PaletteAction
    let isHighlighted: Bool

    var body: some View {
        HStack(spacing: 10) {
            Image(systemName: action.symbolName)
                .frame(width: 18)
                .foregroundStyle(isHighlighted ? .white : .secondary)
            Text(action.title)
                .foregroundStyle(isHighlighted ? .white : .primary)
            Spacer()
            if let subtitle = action.subtitle {
                Text(subtitle)
                    .font(.caption)
                    .foregroundStyle(isHighlighted ? .white.opacity(0.7) : .secondary)
            }
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 8)
        .background {
            if isHighlighted {
                RoundedRectangle(cornerRadius: 8, style: .continuous)
                    .fill(LyraColor.accent)
            }
        }
        .contentShape(Rectangle())
    }
}
