# SmartKharcha AI - Your Personal Financial Advisor

SmartKharcha AI is an intelligent, web-based financial advisory application designed for the Indian market. It leverages the power of Google's Gemini AI through Genkit to provide users with personalized advice on insurance, taxes, and financial document analysis. The application is built with a modern tech stack, featuring a responsive and intuitive user interface.

![SmartKharcha AI Dashboard](https://i.imgur.com/your-screenshot-url.png) <!-- It's a good idea to replace this with an actual screenshot of your app! -->

---

## ✨ Key Features

The application is structured into several modular, AI-powered tools:

*   **👤 Local User Profiles**: A simple and effective system to store user financial details (income, dependents, goals) in the browser's local storage for a personalized experience without requiring a backend database.

*   **🤖 General AI Chat**: A central chat interface on the dashboard for general financial questions, powered by a sophisticated RAG (Retrieval-Augmented Generation) pipeline that uses a knowledge base of Indian financial documents.

*   **🛡️ AI Insurance Advisor**: A specialized chat interface that provides tailored recommendations for insurance products (e.g., term insurance) based on the user's profile.

*   **💸 Tax Calculator & Advisor**: An interactive tool that compares a user's tax liability under India's Old and New tax regimes. It uses an AI-powered flow to provide a clear recommendation on which regime is more beneficial.

*   **📄 Document Intelligence**: A powerful feature allowing users to upload images of financial documents (like salary slips, bills, or receipts). The AI analyzes the document, extracts structured data (key-value pairs), and allows the user to ask specific questions about the document's contents.

*   **💬 RAG-Powered Tax Chatbot**: A dedicated chatbot for answering complex questions about Indian tax law, powered by a specialized knowledge base to ensure accurate and context-aware answers.

---

## 🛠️ Tech Stack

This project is built with a modern, robust, and scalable technology stack:

*   **Framework**: [Next.js](https://nextjs.org/) (v15 App Router)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **UI Components**: [ShadCN/UI](https://ui.shadcn.com/)
*   **Generative AI**: [Firebase Genkit](https://firebase.google.com/docs/genkit) with Google's Gemini Models
*   **Forms**: [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) for validation
*   **Animation**: [Framer Motion](https://www.framer.com/motion/)

---

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   Node.js (v18 or newer recommended)
*   npm or yarn

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/your-repository-name.git
    cd your-repository-name
    ```

2.  **Install NPM packages:**
    ```bash
    npm install
    ```

3.  **Set up your environment variables:**
    Create a new file named `.env` in the root of your project and add your Gemini API key.
    ```env
    GEMINI_API_KEY=your_google_ai_gemini_api_key_here
    ```

### Running the Application

This project requires two separate terminal processes to run concurrently: one for the Next.js frontend and one for the Genkit AI flows.

1.  **Start the Genkit server:**
    In your first terminal, run:
    ```bash
    npm run genkit:watch
    ```
    This will start the Genkit development server, which watches for changes in your AI flows.

2.  **Start the Next.js development server:**
    In a second terminal, run:
    ```bash
    npm run dev
    ```

3.  **Open the application:**
    Open [http://localhost:9003](http://localhost:9003) (or the port specified in your `package.json`) in your browser to see the result.

---

## 📂 Project Structure

The codebase is organized to separate concerns, making it easier to navigate and maintain.

```
/
├── src/
│   ├── app/                    # Next.js App Router pages and layouts
│   │   ├── (app)/              # Main application pages (dashboard, etc.)
│   │   ├── actions.ts          # Server Actions for form submissions & AI calls
│   │   └── layout.tsx          # Root layout
│   ├── ai/                     # All Genkit-related code
│   │   ├── flows/              # Genkit flows for different AI features
│   │   └── genkit.ts           # Genkit initialization
│   ├── components/             # Reusable React components
│   │   ├── app/                # Application-specific components (sidebar, chat)
│   │   └── ui/                 # Generic UI components from ShadCN
│   ├── lib/                    # Utility functions, hooks, and type definitions
│   └── frontend/
│       └── seed_data/          # JSON files acting as a knowledge base
├── .env                        # Environment variables (needs to be created)
└── package.json                # Project dependencies and scripts
```

---

This README provides a solid foundation for your project. Feel free to add more sections, such as a "Contributing" guide or a "Deployment" section, as your project evolves.
