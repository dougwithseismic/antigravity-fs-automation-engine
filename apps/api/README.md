# n8n Clone API

A backend API for a workflow automation tool, inspired by n8n. Built with Hono, TypeScript, and PostgreSQL.

## Features

- **Workflow Management**: Create, read, update, and delete workflows.
- **Execution Engine**: Execute workflows and track results.
- **OpenAPI Specification**: Auto-generated OpenAPI 3.0 spec.
- **Interactive Documentation**: Scalar-powered API reference.
- **Structured Logging**: JSON logging with Pino.

## Getting Started

### Prerequisites

- Node.js
- pnpm
- PostgreSQL

### Installation

```bash
pnpm install
```

### Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Ensure your database is running and `DATABASE_URL` is correct.

### Running the Server

```bash
pnpm dev
```

The server will start on port 3002 (default).

- **API**: `http://localhost:3002`
- **Documentation**: `http://localhost:3002/reference`
- **OpenAPI Spec**: `http://localhost:3002/doc`

## Project Structure

- `src/index.ts`: Application entry point and configuration.
- `src/routes/`: API route handlers.
- `src/execution/`: Workflow execution logic.
- `src/config.ts`: Environment configuration and validation.
