import SwiftUI

struct SavedViewsView: View {
    var body: some View {
        ContentUnavailableView(
            "No Saved Views",
            systemImage: "square.stack",
            description: Text("Save a filtered issue list to see it here.")
        )
        .navigationTitle("Views")
    }
}
