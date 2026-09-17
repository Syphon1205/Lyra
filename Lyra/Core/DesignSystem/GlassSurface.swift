import SwiftUI

/// The depth level of a surface in Lyra's window. Higher levels sit visually
/// closer to the user and use progressively stronger glass so the window
/// reads as layered surfaces floating above the desktop rather than a flat
/// opaque rectangle.
enum LyraDepth {
    /// Sidebar, inspectors, the agent panel — the desktop should be faintly
    /// perceptible through these.
    case chrome
    /// Toolbar and floating controls — slightly stronger than chrome.
    case toolbar
    /// Transient overlays — command palette, popovers, the issue composer.
    case transient
}

/// A single place that governs where Liquid Glass is used, built on the real
/// macOS 26+ `glassEffect` API rather than layered materials. Glass is
/// reserved for navigation, toolbars, transient surfaces and inspectors —
/// never for primary content, per Lyra's design philosophy.
///
/// When "Reduce Transparency" is enabled system-wide, this falls back to an
/// opaque, solid surface rather than a faux-glass gradient.
struct GlassSurface: ViewModifier {
    @Environment(\.accessibilityReduceTransparency) private var reduceTransparency
    var depth: LyraDepth
    var cornerRadius: CGFloat
    var tint: Color?

    func body(content: Content) -> some View {
        let shape = RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
        if reduceTransparency {
            content.background(shape.fill(.background))
        } else {
            content.glassEffect(glass, in: shape)
        }
    }

    private var glass: Glass {
        var g: Glass = .regular
        if let tint { g = g.tint(tint) }
        switch depth {
        case .chrome: return g
        case .toolbar: return g.interactive()
        case .transient: return g.interactive()
        }
    }
}

extension View {
    /// Applies Lyra's standard glass treatment for chrome and transient surfaces.
    func lyraGlass(_ depth: LyraDepth = .chrome, cornerRadius: CGFloat = 16, tint: Color? = nil) -> some View {
        modifier(GlassSurface(depth: depth, cornerRadius: cornerRadius, tint: tint))
    }

    /// The near-opaque, legible backing used for primary content (Level 3):
    /// content should mostly read as solid even though the chrome around it
    /// is translucent.
    func lyraCanvasBackground() -> some View {
        background(LyraColor.canvas)
    }

    /// The opaque card/row surface sitting on top of `lyraCanvasBackground()`.
    func lyraCardBackground(cornerRadius: CGFloat = 8) -> some View {
        background(RoundedRectangle(cornerRadius: cornerRadius, style: .continuous).fill(LyraColor.card))
    }
}
