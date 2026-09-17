import SwiftUI

struct SettingsView: View {
    var body: some View {
        TabView {
            GeneralSettingsView()
                .tabItem { Label("General", systemImage: "gearshape") }
            AgentSettingsView()
                .tabItem { Label("Agents", systemImage: "cpu") }
        }
        .frame(width: 460, height: 320)
    }
}

private struct GeneralSettingsView: View {
    @Environment(WorkspaceStore.self) private var store

    var body: some View {
        @Bindable var store = store

        Form {
            Section("Workspace") {
                LabeledContent("Name", value: store.workspace.name)
                LabeledContent("Slug", value: store.workspace.slug)
            }
            Section("Appearance") {
                Picker("Appearance", selection: $store.appearanceMode) {
                    ForEach(AppearanceMode.allCases) { mode in
                        Text(mode.rawValue).tag(mode)
                    }
                }
                .pickerStyle(.segmented)
                .labelsHidden()
            }
        }
        .formStyle(.grouped)
    }
}

private struct AgentSettingsView: View {
    var body: some View {
        Form {
            Section("CLI Agents") {
                Text("No agent adapters detected yet.")
                    .foregroundStyle(.secondary)
            }
        }
        .formStyle(.grouped)
    }
}
