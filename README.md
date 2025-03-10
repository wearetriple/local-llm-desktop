# Local LLM Desktop

A desktop application that wraps the Ollama API and offers a secure, privacy-friendly local chat interface. Built with Electron and React, this application allows you to interact with various Large Language Models (LLMs) directly on your machine without sending data to external servers.

## Features

- 🤖 Local LLM Integration with Ollama
- 🔒 Privacy-focused - all data stays on your machine
- 💬 Modern chat interface
- 📱 Cross-platform support (Windows, macOS, Linux)
- 🔄 Automatic updates via electron-updater
- 📝 Markdown support for chat messages
- 🔍 Vector search capabilities

## Getting Started

Download and install the application.

# Development

## Getting Started

### Prerequisites

- Node.js (Latest LTS version recommended)
- npm or yarn
- Ollama installed and running locally

### Installation

1. Clone the repository:

```bash
git clone https://github.com/wearetriple/local-llm-desktop.git
cd local-llm-desktop
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

### Building

To create a production build:

```bash
# For macOS
npm run build:mac

# For Windows
npm run build:win

# For Linux
npm run build:linux
```

## Development

### Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application
- `npm run start` - Preview the built application
- `npm run lint` - Run all linting checks
- `npm run format` - Format code using Prettier and ESLint
- `npm run typecheck` - Run TypeScript type checking

### Project Structure

- `src/main` - Electron main process code
- `src/renderer` - React application code
- `src/preload` - Electron preload scripts

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run the linting and type checking:
   ```bash
   npm run lint
   npm run typecheck
   ```
5. Commit your changes (`git commit -m 'Add some amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Style

This project uses:

- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Husky for git hooks
- lint-staged for pre-commit checks

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Ollama](https://ollama.ai/) for providing the local LLM capabilities
- [Electron](https://www.electronjs.org/) for the desktop application framework
- [Mantine](https://mantine.dev/) for the UI components
- [Triple, part of Hypersolid](https://wearetriple.com/) for supporting this project
