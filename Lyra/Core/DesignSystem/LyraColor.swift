import SwiftUI
import AppKit

/// Lyra's neutral, near-black palette with a single periwinkle accent.
/// Colors are defined in code (rather than only in the asset catalog) so
/// design-system values are discoverable and reviewable in diffs.
///
/// `canvas`/`card` are semantic tokens with explicit light/dark starting
/// values (a professional-tool-legible palette) rather than raw materials,
/// per the requirement that issue cards, dense rows, descriptions, code
/// blocks, diffs, and chat transcripts stay stable and highly legible even
/// though the surrounding chrome is glass.
enum LyraColor {
    /// The periwinkle square from the Lyra mark.
    static let accent = adaptive(light: "#6F7BFF", dark: "#7C87FF")

    /// The window/board background — a near-white in light mode, near-black in dark mode.
    static let canvas = adaptive(light: "#F7F8FA", dark: "#15171B")
    /// Opaque card/row background sitting on top of `canvas`.
    static let card = adaptive(light: "#FFFFFF", dark: "#202329")

    static let graphite = Color(red: 0.09, green: 0.09, blue: 0.11)
    static let graphiteElevated = Color(red: 0.13, green: 0.13, blue: 0.15)

    static let textPrimary = Color.primary
    static let textSecondary = Color.secondary
    static let textTertiary = Color.secondary.opacity(0.6)

    static let divider = Color.primary.opacity(0.08)

    /// Builds a `Color` that switches between a light- and dark-appearance
    /// hex value at draw time, following the window's effective appearance.
    private static func adaptive(light: String, dark: String) -> Color {
        Color(nsColor: NSColor(name: nil) { appearance in
            let isDark = appearance.bestMatch(from: [.aqua, .darkAqua]) == .darkAqua
            return NSColor(hex: isDark ? dark : light) ?? .black
        })
    }

    static func type(_ type: IssueType) -> Color {
        switch type {
        case .task: .blue
        case .bug: .red
        case .story: .green
        case .epic: .purple
        }
    }

    static func priority(_ priority: IssuePriority) -> Color {
        switch priority {
        case .none: .secondary
        case .low: .blue
        case .medium: .yellow
        case .high: .orange
        case .urgent: .red
        }
    }

    static func status(_ status: IssueStatus) -> Color {
        switch status {
        case .backlog: .secondary
        case .todo: .secondary
        case .inProgress: accent
        case .inReview: .yellow
        case .done: .green
        case .canceled: .secondary.opacity(0.6)
        }
    }

    /// A stable, muted color derived from a seed, used for label swatches and avatars.
    static func swatch(seed: Int) -> Color {
        let hues: [Double] = [0.62, 0.0, 0.09, 0.14, 0.33, 0.5, 0.78, 0.86]
        let hue = hues[abs(seed) % hues.count]
        return Color(hue: hue, saturation: 0.55, brightness: 0.78)
    }
}

private extension NSColor {
    convenience init?(hex: String) {
        var s = hex.trimmingCharacters(in: .whitespacesAndNewlines)
        s.removeAll { $0 == "#" }
        guard s.count == 6, let value = UInt32(s, radix: 16) else { return nil }
        let r = CGFloat((value >> 16) & 0xFF) / 255
        let g = CGFloat((value >> 8) & 0xFF) / 255
        let b = CGFloat(value & 0xFF) / 255
        self.init(srgbRed: r, green: g, blue: b, alpha: 1)
    }
}
