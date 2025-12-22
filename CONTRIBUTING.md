# Contributing to CodeX

Thank you for your interest in contributing to CodeX! This document provides guidelines and instructions for contributing.

## Table of Contents

-   [Code of Conduct](#code-of-conduct)
-   [Getting Started](#getting-started)
-   [Development Setup](#development-setup)
-   [Code Style](#code-style)
-   [Pull Request Process](#pull-request-process)
-   [Reporting Bugs](#reporting-bugs)
-   [Suggesting Enhancements](#suggesting-enhancements)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/CodeX.git`
3. Add upstream remote: `git remote add upstream https://github.com/Suryanshu-Nabheet/CodeX.git`
4. Create a new branch: `git checkout -b feature/your-feature-name`

## Development Setup

### Prerequisites

-   Node.js 16 or higher
-   npm or yarn
-   Git

### Installation

```bash
# Install dependencies
npm install

# Download non-versioned dependencies
./setup.sh  # Mac/Linux
./setup.ps1 # Windows

# Start development server
npm start
```

### Project Structure

```
CodeX/
├── src/
│   ├── components/     # React components
│   ├── features/       # Redux slices and business logic
│   ├── main/          # Electron main process
│   └── index.css      # Global styles
├── assets/            # Icons, fonts, static assets
└── .webpack/          # Webpack build output
```

## Code Style

### TypeScript/JavaScript

-   Use TypeScript for all new code
-   Follow existing code patterns
-   Prefix unused variables with underscore (`_variableName`)
-   Use meaningful variable and function names
-   Add JSDoc comments for complex functions

### CSS

-   Use CSS variables for colors and transitions
-   Follow BEM naming convention where applicable
-   Group related styles together
-   Add comments for major UI sections
-   Keep selectors specific but not overly nested

### Formatting

```bash
# Format code
npm run format

# Check formatting
npm run format-check

# Lint code
npm run lint

# Fix linting issues
npm run fix
```

## Pull Request Process

### Before Submitting

1. **Test your changes**

    ```bash
    npm start  # Verify app runs
    npm test   # Run tests
    npm run lint  # Check for linting errors
    ```

2. **Update documentation**

    - Update README.md if adding features
    - Add entry to CHANGELOG.md
    - Update JSDoc comments

3. **Commit messages**
    - Use clear, descriptive commit messages
    - Follow conventional commits format:
        ```
        feat: add command palette fuzzy search
        fix: resolve LSP connection error
        docs: update installation instructions
        style: improve button hover effects
        refactor: consolidate duplicate imports
        ```

### Submitting

1. Push to your fork
2. Create a Pull Request to `main` branch
3. Fill out the PR template completely
4. Link any related issues
5. Wait for review

### PR Requirements

-   ✅ All tests pass
-   ✅ No linting errors
-   ✅ Code is formatted
-   ✅ Documentation updated
-   ✅ CHANGELOG.md updated
-   ✅ No merge conflicts

## Reporting Bugs

### Before Reporting

1. Check existing issues
2. Verify bug in latest version
3. Try to reproduce consistently

### Bug Report Template

```markdown
**Describe the bug**
A clear description of the bug.

**To Reproduce**
Steps to reproduce:

1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**

-   OS: [e.g. macOS 13.0]
-   CodeX Version: [e.g. 1.0.0]
-   Node Version: [e.g. 18.0.0]

**Additional context**
Any other relevant information.
```

## Suggesting Enhancements

### Enhancement Template

```markdown
**Is your feature request related to a problem?**
A clear description of the problem.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
Alternative solutions or features you've considered.

**Additional context**
Any other context or screenshots.
```

## Development Guidelines

### Adding New Features

1. **Plan first**: Discuss major features in an issue first
2. **Small PRs**: Keep changes focused and manageable
3. **Test thoroughly**: Add tests for new functionality
4. **Document**: Update relevant documentation

### Code Review

-   Be respectful and constructive
-   Explain reasoning for suggestions
-   Be open to feedback
-   Respond to review comments promptly

### Performance

-   Profile before optimizing
-   Avoid premature optimization
-   Consider bundle size impact
-   Test with large files/projects

### Accessibility

-   Use semantic HTML
-   Add ARIA labels where needed
-   Test keyboard navigation
-   Ensure sufficient color contrast

## Questions?

-   📧 Email: suryanshu@codex.dev
-   💬 Discussions: [GitHub Discussions](https://github.com/Suryanshu-Nabheet/CodeX/discussions)
-   🐛 Issues: [GitHub Issues](https://github.com/Suryanshu-Nabheet/CodeX/issues)

---

**Thank you for contributing to CodeX!** 🎉
