import SwiftUI
import AppKit

/// Configures the hosting `NSWindow` so Lyra's glass chrome can show the
/// desktop behind it: a transparent titlebar merged into a unified toolbar,
/// and a non-opaque window background. Primary content still reads as solid
/// because it explicitly opts into `lyraCanvasBackground()`.
struct WindowAccessor: NSViewRepresentable {
    func makeNSView(context: Context) -> NSView {
        let view = NSView()
        DispatchQueue.main.async {
            configure(view.window)
        }
        return view
    }

    func updateNSView(_ nsView: NSView, context: Context) {
        DispatchQueue.main.async {
            configure(nsView.window)
        }
    }

    private func configure(_ window: NSWindow?) {
        guard let window else { return }
        window.titlebarAppearsTransparent = true
        window.titleVisibility = .hidden
        window.isOpaque = false
        window.backgroundColor = .clear
        window.toolbarStyle = .unified
    }
}

extension View {
    func lyraWindowChrome() -> some View {
        background(WindowAccessor())
    }
}
