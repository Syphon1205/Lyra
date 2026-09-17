import SwiftUI

struct CyclesView: View {
    @Environment(WorkspaceStore.self) private var store

    var body: some View {
        List(store.cycles) { cycle in
            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text(cycle.name)
                        .font(.headline)
                    if cycle.isActive {
                        Text("Active")
                            .font(.caption.weight(.medium))
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(LyraColor.accent.opacity(0.2), in: Capsule())
                            .foregroundStyle(LyraColor.accent)
                    }
                }
                Text("\(cycle.startDate.formatted(date: .abbreviated, time: .omitted)) – \(cycle.endDate.formatted(date: .abbreviated, time: .omitted))")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            .padding(.vertical, 4)
        }
        .navigationTitle("Cycles")
    }
}
