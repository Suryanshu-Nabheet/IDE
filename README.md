# CodeX

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/Suryanshu-Nabheet/CodeX/blob/main/LICENSE) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)]()

**[CodeX](https://github.com/Suryanshu-Nabheet/CodeX) is an enterprise-level AI-powered code editor with the beautiful Oxocarbon theme.** Built for developers who demand both power and aesthetics.

## Features

-   **AI-Powered Coding**: Generate 10-100 lines of code with advanced AI assistance
-   **Smart Diff View**: See only proposed changes with intelligent diff highlighting
-   **Integrated Chat**: ChatGPT-style interface that understands your codebase
-   **Oxocarbon Theme**: Beautiful IBM Carbon-inspired dark theme with high contrast
-   **LSP Support**: Full Language Server Protocol support for multiple languages
-   **Integrated Terminal**: Powerful terminal with multiple instances and tabs
-   **Git Integration**: Built-in git support with inline blame and diff viewer
-   **Extension System**: Extensible architecture for custom plugins

<p align="center">
<img src="https://user-images.githubusercontent.com/4297743/227696390-0c1886c7-0cda-4528-9259-0b2944892d4c.png" width="1000"><br>
</p>

## Getting Started

### Prerequisites

-   Node.js 16 or higher
-   npm or yarn

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/Suryanshu-Nabheet/CodeX.git
cd CodeX
npm install
```

Download non-versioned dependencies (ripgrep binaries and language server js):

```bash
./setup.sh # Mac/Linux
./setup.ps1 # Windows
```

### Running CodeX

Start the development server:

```bash
npm start
```

### Building

Create a distributable package:

```bash
npm run make
```

## Oxocarbon Theme

CodeX features the stunning Oxocarbon theme, inspired by IBM Carbon Design System. The color palette balances industrial grays with vibrant blues, creating a modern and professional coding environment that's easy on the eyes during long coding sessions.

## Roadmap

Our vision is to build CodeX into the world's most productive and beautiful development environment:

-   **Smart Refactoring**: AI-assisted refactoring across your entire codebase
-   **Collaborative Editing**: Real-time collaboration with team members
-   **Advanced Debugging**: Integrated debugging with AI-powered error analysis
-   **Cloud Sync**: Sync settings and extensions across devices
-   **Performance Optimization**: Lightning-fast startup and response times

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## Development

### Project Structure

-   `/src` - Source code
    -   `/components` - React components
    -   `/features` - Redux slices and business logic
    -   `/main` - Electron main process
-   `/assets` - Icons, fonts, and static assets
-   `/tutor` - Tutorial files

### Tech Stack

-   **Electron** - Desktop application framework
-   **React** - UI framework
-   **Redux** - State management
-   **CodeMirror 6** - Code editor
-   **TypeScript** - Type-safe development
-   **Tailwind CSS** - Styling

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Acknowledgments

-   Inspired by the original CodeX editor
-   Oxocarbon theme by [nyoom-engineering](https://github.com/nyoom-engineering/oxocarbon.nvim)
-   IBM Carbon Design System

## Support

-   📧 Email: suryanshu@codex.dev
-   🐛 Issues: [GitHub Issues](https://github.com/Suryanshu-Nabheet/CodeX/issues)
-   💬 Discussions: [GitHub Discussions](https://github.com/Suryanshu-Nabheet/CodeX/discussions)

---

**Made with ❤️ by Suryanshu Nabheet**
