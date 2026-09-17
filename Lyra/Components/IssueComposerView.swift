import SwiftUI

/// The ⌘N floating issue composer — a lightweight overlay, not a modal form.
struct IssueComposerView: View {
    @Environment(WorkspaceStore.self) private var store
    @Binding var isPresented: Bool

    @State private var title = ""
    @State private var description = ""
    @State private var type: IssueType = .task
    @State private var status: IssueStatus = .todo
    @State private var priority: IssuePriority = .medium
    @State private var assigneeID: UserID?
    @State private var projectID: ProjectID?
    @FocusState private var isTitleFocused: Bool

    var body: some View {
        ZStack {
            Color.black.opacity(0.001)
                .onTapGesture { isPresented = false }
                .ignoresSafeArea()

            VStack(alignment: .leading, spacing: 14) {
                Text("Create Issue")
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundStyle(.secondary)

                TextField("What needs to be done?", text: $title)
                    .textFieldStyle(.plain)
                    .font(.system(size: 17, weight: .medium))
                    .focused($isTitleFocused)

                TextField("Description…", text: $description, axis: .vertical)
                    .textFieldStyle(.plain)
                    .font(.system(size: 12.5))
                    .foregroundStyle(.secondary)
                    .lineLimit(1...4)

                Divider().opacity(0.5)

                HStack(spacing: 14) {
                    Menu {
                        ForEach(store.projects) { project in
                            Button(project.name) { projectID = project.id }
                        }
                    } label: {
                        Label(currentProject?.name ?? "Project", systemImage: currentProject?.iconSymbol ?? "square.on.square")
                    }
                    .menuStyle(.borderlessButton)
                    .fixedSize()

                    Menu {
                        ForEach(IssueType.allCases) { t in
                            Button(t.displayName) { type = t }
                        }
                    } label: {
                        Label(type.displayName, systemImage: type.symbolName)
                    }
                    .menuStyle(.borderlessButton)
                    .fixedSize()

                    Menu {
                        ForEach(IssueStatus.allCases) { s in
                            Button(s.displayName) { status = s }
                        }
                    } label: {
                        Label(status.displayName, systemImage: status.symbolName)
                    }
                    .menuStyle(.borderlessButton)
                    .fixedSize()

                    Menu {
                        ForEach(IssuePriority.allCases) { p in
                            Button(p.displayName) { priority = p }
                        }
                    } label: {
                        Label(priority.displayName, systemImage: priority.symbolName)
                    }
                    .menuStyle(.borderlessButton)
                    .fixedSize()

                    Menu {
                        Button("Unassigned") { assigneeID = nil }
                        ForEach(store.users) { user in
                            Button(user.name) { assigneeID = user.id }
                        }
                    } label: {
                        Label(store.user(assigneeID)?.name ?? "Assignee", systemImage: "person.crop.circle")
                    }
                    .menuStyle(.borderlessButton)
                    .fixedSize()
                }
                .font(.system(size: 11.5))
                .foregroundStyle(.secondary)

                HStack {
                    Spacer()
                    Button {
                        create()
                    } label: {
                        HStack(spacing: 6) {
                            Text("Create")
                            Text("⌘⏎")
                                .foregroundStyle(.white.opacity(0.7))
                        }
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(LyraColor.accent)
                    .disabled(title.isEmpty)
                    .keyboardShortcut(.return, modifiers: .command)
                }
            }
            .padding(20)
            .frame(width: 480)
            .lyraGlass(.transient, cornerRadius: 18)
            .shadow(color: .black.opacity(0.25), radius: 40, y: 16)
            .padding(.top, 120)
            .frame(maxHeight: .infinity, alignment: .top)
            .onKeyPress(.escape) { isPresented = false; return .handled }
        }
        .onAppear { isTitleFocused = true }
        .transition(.opacity.combined(with: .scale(scale: 0.98)))
    }

    private var currentProject: Project? {
        store.project(projectID) ?? store.projects.first
    }

    private func create() {
        guard !title.isEmpty else { return }
        store.createIssue(title: title, type: type, priority: priority, status: status, assigneeID: assigneeID, projectID: projectID ?? store.projects.first?.id)
        isPresented = false
    }
}
