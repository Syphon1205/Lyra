import SwiftUI

struct SidebarView: View {
    @Environment(WorkspaceStore.self) private var store
    @State private var expandedProjectIDs: Set<ProjectID> = []

    var body: some View {
        @Bindable var store = store

        VStack(spacing: 0) {
            WorkspaceSwitcherView()
                .padding(.horizontal, 14)
                .padding(.top, 14)
                .padding(.bottom, 6)

            List(selection: $store.selection) {
                Section {
                    sidebarRow("For You", symbol: "person.crop.circle", tag: .forYou)
                    sidebarRow("Recent", symbol: "clock", tag: .recent)
                    sidebarRow("Starred", symbol: "star", tag: .starred)
                }

                Section("Projects") {
                    ForEach(store.projects) { project in
                        DisclosureGroup(isExpanded: isExpanded(project.id)) {
                            sidebarRow("Board", symbol: "square.grid.2x2", tag: .project(project.id), indent: true)
                        } label: {
                            projectLabel(project)
                                .tag(SidebarSelection.project(project.id))
                        }
                        .contextMenu {
                            Button(store.starredProjectIDs.contains(project.id) ? "Unstar" : "Star") {
                                store.toggleStar(project.id)
                            }
                        }
                    }
                }

                Section {
                    sidebarRow("Filters", symbol: "line.3.horizontal.decrease.circle", tag: .filters)
                }

                Section("Automation") {
                    sidebarRow("Agents", symbol: "cpu", tag: .agents, badge: activeAgentCount)
                    sidebarRow("Runs", symbol: "bolt", tag: .runs)
                }
            }
            .listStyle(.sidebar)
            .scrollContentBackground(.hidden)

            SidebarFooterView()
        }
        .background(.clear)
    }

    private var activeAgentCount: Int? { 1 }

    private func isExpanded(_ id: ProjectID) -> Binding<Bool> {
        Binding(
            get: { expandedProjectIDs.contains(id) },
            set: { isOn in
                if isOn { expandedProjectIDs.insert(id) } else { expandedProjectIDs.remove(id) }
            }
        )
    }

    private func projectLabel(_ project: Project) -> some View {
        HStack(spacing: 6) {
            Image(systemName: project.iconSymbol)
                .foregroundStyle(.secondary)
                .imageScale(.small)
            Text(project.name)
            Spacer()
            if store.starredProjectIDs.contains(project.id) {
                Image(systemName: "star.fill")
                    .font(.system(size: 9))
                    .foregroundStyle(.yellow)
            }
        }
        .font(.system(size: 12.5))
    }

    private func sidebarRow(_ title: String, symbol: String, tag: SidebarSelection, badge: Int? = nil, indent: Bool = false) -> some View {
        Label {
            HStack {
                Text(title)
                Spacer()
                if let badge {
                    Text("\(badge)")
                        .font(.caption2.weight(.semibold))
                        .foregroundStyle(.white)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 1)
                        .background(LyraColor.accent, in: Capsule())
                }
            }
        } icon: {
            Image(systemName: symbol)
                .foregroundStyle(.secondary)
                .imageScale(.small)
        }
        .tag(tag)
        .font(.system(size: 12.5))
        .padding(.leading, indent ? 14 : 0)
    }
}

private struct WorkspaceSwitcherView: View {
    @Environment(WorkspaceStore.self) private var store

    var body: some View {
        HStack(spacing: 8) {
            LyraMark(size: 20)

            VStack(alignment: .leading, spacing: 0) {
                Text(store.workspace.name)
                    .font(.system(size: 13, weight: .semibold))
                Text("Workspace")
                    .font(.system(size: 10))
                    .foregroundStyle(.tertiary)
            }

            Spacer()

            Image(systemName: "chevron.up.chevron.down")
                .font(.system(size: 10, weight: .semibold))
                .foregroundStyle(.tertiary)
        }
        .contentShape(Rectangle())
    }
}

private struct SidebarFooterView: View {
    @Environment(WorkspaceStore.self) private var store
    @Environment(\.openSettings) private var openSettings

    var body: some View {
        VStack(spacing: 0) {
            Divider().opacity(0.5)
            HStack(spacing: 14) {
                Button {} label: {
                    Image(systemName: "magnifyingglass")
                }
                .buttonStyle(.borderless)
                .help("Search")

                Spacer()

                AvatarView(user: store.currentUser, size: 20)

                Button {
                    openSettings()
                } label: {
                    Image(systemName: "gearshape")
                }
                .buttonStyle(.borderless)
                .keyboardShortcut(",", modifiers: .command)
                .help("Settings")
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 10)
            .foregroundStyle(.secondary)
        }
    }
}

/// The Lyra mark: a flowing geometric "L" with a periwinkle accent square,
/// rendered as vector shapes so it stays crisp at any size and tints
/// correctly in light, dark, and tinted appearances.
struct LyraMark: View {
    var size: CGFloat = 20

    var body: some View {
        ZStack(alignment: .bottomTrailing) {
            LyraMarkShape()
                .fill(LinearGradient(
                    colors: [Color.primary, Color.primary.opacity(0.75)],
                    startPoint: .top,
                    endPoint: .bottom
                ))
            RoundedRectangle(cornerRadius: size * 0.09, style: .continuous)
                .fill(LyraColor.accent)
                .frame(width: size * 0.28, height: size * 0.28)
                .offset(x: size * 0.02, y: size * 0.02)
        }
        .frame(width: size, height: size)
    }
}

private struct LyraMarkShape: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()
        let w = rect.width
        let h = rect.height
        let stroke = w * 0.26
        path.move(to: CGPoint(x: 0, y: 0))
        path.addLine(to: CGPoint(x: stroke, y: 0))
        path.addLine(to: CGPoint(x: stroke, y: h - stroke))
        path.addLine(to: CGPoint(x: w, y: h - stroke))
        path.addLine(to: CGPoint(x: w, y: h))
        path.addLine(to: CGPoint(x: 0, y: h))
        path.closeSubpath()
        return path
    }
}

struct AvatarView: View {
    let user: User
    var size: CGFloat = 24

    var body: some View {
        Circle()
            .fill(LyraColor.swatch(seed: user.colorSeed).gradient)
            .frame(width: size, height: size)
            .overlay {
                Text(user.initials)
                    .font(.system(size: size * 0.4, weight: .semibold))
                    .foregroundStyle(.white)
            }
    }
}
