# Contributing to Lyra

Thank you for your interest in contributing to Lyra! Lyra is a fast, calm project management cockpit built specifically for macOS, combining Jira-grade issue tracking and sprint planning with first-class coding agent integration.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Development Setup](#development-setup)
- [Architecture Overview](#architecture-overview)
- [Glass Material Contract](#glass-material-contract)
- [Running Tests](#running-tests)
- [Pull Request Workflow](#pull-request-workflow)
- [Reporting Issues](#reporting-issues)

---

## Code of Conduct

All contributors and maintainers are expected to follow the [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before participating.

---

## Development Setup

### Prerequisites

- **macOS** 14 (Sonoma), 15 (Sequoia), or later (Apple Silicon or Intel)
- **Node.js** 20.x or later (LTS recommended)
- **npm** 10.x or later
- *(Optional)* [Claude Code CLI](https://claude.ai/code) installed and available on `$PATH` for live agent execution

### Getting the Code

```bash
git clone https://github.com/Syphon1205/Lyra.git
cd Lyra/app
npm install
```

### Running in Development

```bash
# In Lyra/app:
npm run dev:electron
```

This compiles the main Electron process and preload scripts, starts the Vite development server for the React renderer, and launches the Electron application with Hot Module Replacement (HMR).

---

## Architecture Overview

Lyra is organized into three primary layers:

```
Lyra/
├── app/
│   ├── electron/        # Main process & background services
│   │   ├── main.ts      # Application window, lifecycle & IPC registration
│   │   ├── preload.ts   # Context bridge exposing safe lyraApi
│   │   └── services/    # SQLite persistence, Git runner, Claude Code adapter
│   ├── src/             # React 18 renderer application
│   │   ├── components/  # Board, Backlog, Issue Detail, Agents, Chat, Palette
│   │   ├── state/       # Zustand reactive store & sync
│   │   └── styles/      # Design system, glass tokens, typography
│   └── shared/          # Shared TypeScript interfaces & IPC definitions
├── docs/                # Architecture specifications and contracts
└── screenshots/         # High-resolution application screenshots
```

---

## Glass Material Contract

Lyra adheres to a strict design contract for macOS vibrancy, geometry, and paint boundaries.

> [!IMPORTANT]
> Any changes affecting the sidebar, top toolbar, agent chat panel, or window backgrounds **must** comply with [`docs/glass-material-contract.md`](docs/glass-material-contract.md).
>
> - **Sidebar & Chat**: Remain dark translucent surfaces even in light mode.
> - **Workspace Canvas**: Bright, cool-white solid surface (`--lyra-workspace: #F6F8FE`), strictly scoped so it does not paint under glass panels.
> - **Toolbar**: Pale translucent surface with sharp hairline borders.
> - **Material Modes**: Support `native-vibrancy` (Electron `vibrancy: "under-window"`), `css-preview` (dev mock), `solid-accessibility` (Reduce Transparency), and `solid-unsupported`.

---

## Running Tests

Before submitting any PR, ensure that the glass material contract tests and type checks pass:

```bash
cd app
npm test
```

Contract tests verify that the design system tokens, surface scopes, and material fallbacks are strictly preserved.

---

## Pull Request Workflow

1. Fork the repository and create your branch from `main`:
   ```bash
   git checkout -b feature/my-new-feature
   ```
2. Commit your changes with clear, descriptive commit messages:
   ```bash
   git commit -m "feat(board): add keyboard navigation for column reordering"
   ```
3. Ensure all tests pass (`npm test`).
4. Push your branch to your fork:
   ```bash
   git push origin feature/my-new-feature
   ```
5. Open a Pull Request on GitHub against `main`. Fill out the provided [Pull Request Template](.github/pull_request_template.md).

---

## Reporting Issues

- For bug reports, use the [Bug Report Template](.github/ISSUE_TEMPLATE/bug_report.md).
- For feature proposals, use the [Feature Request Template](.github/ISSUE_TEMPLATE/feature_request.md).
- For security issues, please refer to [SECURITY.md](SECURITY.md).
