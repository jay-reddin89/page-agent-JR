# Innovate AI 2026 - Page Agent Demo

A complete conference registration website demonstrating the integration of **[page-agent](https://github.com/alibaba/page-agent)** by Alibaba. This React-based application showcases how page-agent can autonomously navigate multi-step forms, handle user interactions, and assist with completing complex registration workflows.

## About Page Agent

[page-agent](https://github.com/alibaba/page-agent) is an AI-powered browser automation library by Alibaba that enables autonomous web page interaction. Unlike traditional automation tools, page-agent uses LLM-driven decision making to:

- **Understand page context** through semantic analysis
- **Autonomously navigate** complex multi-step workflows
- **Interact with forms** using natural language instructions
- **Handle dynamic content** and edge cases intelligently

This demo serves as a practical reference implementation for integrating page-agent into a React application.

## Features

- **Complete Registration Flow**: Landing → Auth → Ticket Selection → Workshop Selection → Cart → Checkout → Confirmation
- **Autonomous AI Assistant**: Floating AI button that can guide users through the entire registration process
- **Page-Aware Instructions**: Each route has specific instructions that guide the AI agent's behavior
- **Multi-Tier Ticketing**: Early Bird ($199), Student ($99), and VIP ($499) options with different benefits
- **Workshop Management**: 8 AI/ML themed workshops with unique time slots (no conflicts)
- **Smart Workshop Selection**: VIP automatically gets all workshops; ticket changes clear previous selections
- **Discount System**: Functional coupon code system (EARLY10, SPEAKER25, FREEPASS)
- **Free Order Support**: 100% discount codes skip payment form entirely
- **2-Column Workshop Layout**: Clean grid layout for workshop selection
- **Persistent State**: Cart and registration data persists across browser sessions

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 19** | UI framework |
| **TypeScript** | Type safety |
| **Vite 8** | Build tool |
| **React Router 7** | Client-side routing |
| **Zustand 5** | State management with persistence |
| **Tailwind CSS 4** | Styling with custom theme |
| **page-agent 1.5** | AI-powered automation |
| **Ollama Qwen 3** | LLM for page-agent (self-hosted) |

## Project Structure

```
innovate-ai-2026/
├── src/
│   ├── components/
│   │   └── AIAgentButton.tsx    # Floating button to activate page-agent
│   ├── config/
│   │   └── env.ts                # LLM configuration
│   ├── pages/
│   │   ├── LandingPage.tsx       # Hero & conference info
│   │   ├── AuthPage.tsx          # Sign up / Sign in forms
│   │   ├── TicketSelectionPage.tsx   # Tier selection (Early Bird/Student/VIP)
│   │   ├── WorkshopSelectionPage.tsx # Workshop picker (2-column grid)
│   │   ├── CartPage.tsx          # Cart review + discount codes + free order handling
│   │   ├── CheckoutPage.tsx      # Payment form with free order support
│   │   └── ConfirmationPage.tsx  # Registration confirmation
│   ├── services/
│   │   └── pageAgent.ts          # Page-agent initialization & configuration
│   ├── store/
│   │   └── useStore.ts           # Zustand store with persistence
│   ├── App.tsx                   # Router & protected routes
│   ├── main.tsx                  # Application entry point
│   └── index.css                 # Tailwind v4 + custom theme
├── .env.example                  # Environment variables template
├── vite.config.ts                # Build config
├── tsconfig.json                 # TypeScript config
└── package.json                  # Dependencies
```

## Installation

### Prerequisites

- **Node.js** 18+
- **npm** or **pnpm**

### Setup

```bash
# Clone the repository
git clone <repo-url>
cd innovate-ai-2026

# Install dependencies
npm install

# Configure environment variables (see Configuration below)
cp .env.example .env
```

## Configuration

### Environment Variables

Create a `.env` file in the project root (copy from `.env.example`):

```bash
# LLM Configuration for Page Agent
VITE_LLM_BASE_URL=your-base-url
VITE_LLM_API_KEY=your-api-key
VITE_LLM_MODEL=your-model-name
```

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_LLM_BASE_URL` | OpenAI-compatible LLM endpoint | *(required)* |
| `VITE_LLM_API_KEY` | API key for your LLM provider | *(required)* |
| `VITE_LLM_MODEL` | Model to use | *(required)* |

## Usage

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

```bash
npm run build
```

Production files are output to `dist/`.

### Using the Page Agent

1. Click the **floating AI button** in the bottom-right corner
2. The agent will initialize and connect to the LLM
3. Ask the agent to help you with tasks like:
   - "Register me for the conference"
   - "Get me a VIP ticket"
   - "Select the LLM fine-tuning workshop"
   - "Apply the EARLY10 discount"
   - "Complete my purchase"

### Page Agent Integration

The agent is configured in `src/services/pageAgent.ts` with:

- **System instructions** explaining the registration flow
- **Page-specific instructions** for each route
- **PageController** with masking enabled for visual interaction
- **Custom instruction resolver** that returns route-specific guidance

## Registration Flow

1. **Landing Page** (`/`) — Conference overview with CTA to register
2. **Auth** (`/auth`) — Sign up or sign in (mock authentication with localStorage)
3. **Ticket Selection** (`/tickets`) — Choose Early Bird ($199), Student ($99), or VIP ($499)
4. **Workshop Selection** (`/workshops`) — Pick from 8 workshops in 2-column grid (VIP gets all automatically)
5. **Cart** (`/cart`) — Review selection and apply discount codes
6. **Checkout** (`/checkout`) — Payment form (FREEPASS skips payment)
7. **Confirmation** (`/confirmation`) — Registration complete message

## Discount Codes

| Code | Discount | Description |
|------|----------|-------------|
| `EARLY10` | 10% off | Early bird discount |
| `SPEAKER25` | 25% off | Speaker discount |
| `FREEPASS` | 100% off | Free registration (skips payment) |

## Ticket Tiers

| Tier | Price | Benefits |
|------|-------|-----------|
| **Early Bird** | $199 | Full access, welcome kit, networking, recordings |
| **Student** | $99 | Full access, student networking, recordings, career fair |
| **VIP** | $499 | Priority seating, all workshops, VIP lounge, speaker meet & greet, swag, dinner |

## Workshops

All workshops have unique time slots (no conflicts):

1. **Hands-on LLM Fine-Tuning** (09:00 - 10:00)
2. **Computer Vision Workshop** (10:00 - 11:00)
3. **AI Ethics Panel** (11:00 - 12:00)
4. **RAG Systems Deep Dive** (12:00 - 13:00)
5. **Autonomous Agents in Production** (14:00 - 15:00)
6. **Edge AI & On-Device Inference** (15:00 - 16:00)
7. **Generative AI for Creative Industries** (16:00 - 17:00)
8. **AI Safety & Alignment Roundtable** (17:00 - 18:00)

## Key Implementation Details

### State Persistence
- User sessions, cart items, and purchases persist using Zustand persist middleware
- Data stored in localStorage survives page refreshes

### VIP Handling
- VIP tickets automatically include all 8 workshops
- Workshop selection is disabled for VIP users
- Cart shows "VIP: All workshops included" badge

### Free Orders
- When total is $0 (after 100% discount), payment form is skipped
- "Complete Free Registration" button completes order without payment
- Both Cart and Checkout pages handle this case

### Navigation Guards
- Auth pages redirect to home if already logged in
- Protected pages redirect to auth if not authenticated

### Discount Application
- Discounts apply to ticket price only (workshops are included)
- FREEPASS (100%) makes the order completely free

## License

MIT

## Links

- [page-agent GitHub](https://github.com/alibaba/page-agent)
- [Ollama Models](https://ollama.com/library)
- [Qwen Models](https://qwenlm.github.io/)
- [Netlify Deployment](https://docs.netlify.com/)
