# Antigravity 🚀

**The Open Source Hybrid Execution Engine**

Antigravity is a powerful, developer-first workflow engine that blends server-side reliability with client-side interactivity. It allows you to build complex automation protocols that can pause, wait for user input, and resume execution seamlessly across the stack.

## ✨ Key Features

- **Hybrid Execution**: Run workflows that span both your server (API) and your user's browser (Client SDK).
- **Visual Workflow Editor**: A drag-and-drop interface to design and debug your automation logic.
- **React SDK**: Easily integrate workflow steps into your React applications with the `useWorkflow` hook.
- **Type-Safe**: Built with TypeScript from the ground up for a robust developer experience.
- **Scalable**: Powered by a high-performance execution engine designed for reliability.

## 🚀 Quick Start

### Prerequisites

- **Node.js**: v20 or higher
- **pnpm**: v9 or higher
- **Docker**: For running the database (optional but recommended)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-org/antigravity.git
    cd antigravity
    ```

2.  **Install dependencies:**

    ```bash
    pnpm install
    ```

3.  **Set up environment variables:**

    Copy the example environment file:

    ```bash
    cp .env.example .env
    ```

    Update `.env` with your database credentials and API keys.

4.  **Start the database:**

    If you have Docker installed, you can spin up a Postgres instance:

    ```bash
    docker-compose up -d db
    ```

5.  **Run the development server:**

    ```bash
    pnpm dev
    ```

    This will start:
    - **API**: http://localhost:3002
    - **Web App**: http://localhost:3000
    - **Docs**: http://localhost:3001

## 🏗️ Architecture

Antigravity is built as a monorepo using [Turbo](https://turbo.build/):

- **`apps/api`**: The core execution engine and REST API (Hono, Node.js).
- **`apps/web`**: The visual workflow editor and dashboard (Next.js).
- **`apps/docs`**: Documentation site (Nextra).
- **`packages/client-sdk`**: The TypeScript SDK for client-side integration.
- **`packages/ui`**: Shared UI component library.
- **`packages/database`**: Database schema and client (Drizzle ORM).

## 📚 Documentation

- [**Introduction**](http://localhost:3001): Why Antigravity?
- [**Engine Concepts**](http://localhost:3001/engine): Learn how the execution engine works.
- [**Client SDK**](http://localhost:3001/client-sdk): Integrate with your frontend.
- [**React SDK**](http://localhost:3001/react-sdk): React hooks and components.
- [**Deployment**](http://localhost:3001/deployment): How to deploy to production.

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) (coming soon) for details.

### Running Tests

```bash
pnpm test
```

### Linting

```bash
pnpm lint
```

## 📄 License

MIT © [Your Name/Organization]
