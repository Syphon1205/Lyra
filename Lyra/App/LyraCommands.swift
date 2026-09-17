import SwiftUI

struct LyraCommands: Commands {
    var store: WorkspaceStore

    var body: some Commands {
        CommandGroup(replacing: .newItem) {
            Button("New Issue") {
                NotificationCenter.default.post(name: .lyraNewIssueRequested, object: nil)
            }
            .keyboardShortcut("n", modifiers: .command)
        }

        CommandGroup(replacing: .undoRedo) {
            Button("Undo") {
                NotificationCenter.default.post(name: .lyraUndoRequested, object: nil)
            }
            .keyboardShortcut("z", modifiers: .command)
            .disabled(!store.canUndo)
        }

        CommandMenu("Go") {
            Button("Command Palette…") {
                NotificationCenter.default.post(name: .lyraCommandPaletteRequested, object: nil)
            }
            .keyboardShortcut("k", modifiers: .command)

            Button("Toggle Agent Chat") {
                NotificationCenter.default.post(name: .lyraToggleAgentPanel, object: nil)
            }
            .keyboardShortcut("a", modifiers: [.command, .shift])

            Divider()

            Button("For You") { store.selection = .forYou }
                .keyboardShortcut("1", modifiers: .command)
            Button("Recent") { store.selection = .recent }
                .keyboardShortcut("2", modifiers: .command)
        }
    }
}

extension Notification.Name {
    static let lyraCommandPaletteRequested = Notification.Name("lyraCommandPaletteRequested")
    static let lyraNewIssueRequested = Notification.Name("lyraNewIssueRequested")
}
