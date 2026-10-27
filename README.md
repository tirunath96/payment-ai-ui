# Payment AI Dashboard

A React-based dashboard for investigating payment transactions using AI.

## Features

- Search payments by transaction ID
- Integrates with a Spring Boot REST API
- Displays AI-generated payment investigation results
- Loading and error handling
- Responsive dashboard layout

## Technology Stack

- React
- JavaScript
- Vite
- CSS
- REST API integration

## Architecture

React Dashboard → Spring Boot AI Client → MCP Server → PostgreSQL

The AI client uses Ollama locally to analyse payment and gateway information retrieved from the database.

## Prerequisites

- Node.js and npm
- Payment AI backend services running locally

## Run Locally

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL shown in the terminal, typically `http://localhost:5173` or another available port.

## Backend API

**Endpoint:** `POST http://localhost:8082/api/ai/investigate`

Example request:

```json
{
  "message": "Investigate TXN1001"
}
```

## Purpose

This project demonstrates React frontend development, REST API integration, and an AI-assisted payment investigation workflow.

## Related Repositories

- [MCP Server & Database](https://github.com/tirunath96/java-local-ai)
- [AI Investigation Client](https://github.com/tirunath96/payment-ai-client)



https://github.com/user-attachments/assets/7a450f7b-d8d2-4ae6-9e86-1ade25e96dbf




