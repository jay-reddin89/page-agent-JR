# AGENTS.md

This file provides guidance to AI agents working in this repository.

## Project Overview

- **Name**: innovate-ai-2026 (Page Agent Demo) - React + Vite app demonstrating `page-agent` integration
- **Framework**: React 19 + TypeScript + Vite 8 + React Router + Zustand (persisted)
- **AI Automation**: Uses `page-agent` ^1.5.6 for LLM-driven browser automation with visual masking
- **UI**: Tailwind CSS v4 via PostCSS

## Key Entry Points

- `src/main.tsx` - App entry point
- `src/App.tsx` - Router setup, wraps app with `AIAgentButton`, uses protected routes
- `src/services/pageAgent.ts` - PageAgent initialization, system prompt, and **route-specific instructions** (critical for agent behavior)
- `src/components/AIAgentButton.tsx` - Floating "Page-Agent" button that toggles the page-agent panel
- `src/config/env.ts` - LLM config from VITE_* env vars (defaults to DashScope)
- `src/store/useStore.ts` - Zustand store with full registration flow state (auth, tickets, workshops, cart, discounts, purchase)

## Required Environment

Page Agent requires OpenAI-compatible LLM endpoint. Copy `.env.example` to `.env` or `.env.local` and set:
- `VITE_LLM_BASE_URL` (default: `https://dashscope.aliyuncs.com/compatible-mode/v1`)
- `VITE_LLM_API_KEY` (required)
- `VITE_LLM_MODEL` (default: `qwen3.5-plus`)

Supported providers listed in README (DashScope, OpenAI, Ollama http://localhost:11434/v1, LM Studio http://localhost:1234/v1).

## Development Commands

- `npm run dev` - Start Vite dev server (http://localhost:5173)
- `npm run build` - TypeScript check (`tsc -b`) + Vite build
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

**Build note**: Vite config suppresses EVAL warnings from page-controller and chunk size warnings (>500kb).

## Page Agent Behavior

The agent's behavior is defined in `src/services/pageAgent.ts`:
- **System prompt** instructs: follow user instructions precisely, double-check price/offer discounts, report errors immediately (no blind retries)
- **Page-specific instructions** per route (`PAGE_INSTRUCTIONS`) - critical for understanding what actions the AI should take on each page:
  - `/`: click "Register Now", scroll to view info
  - `/auth`: ask for email/password if not provided, click Sign In (demo accepts any creds)
  - `/tickets`: confirm ticket before selecting; click card to select tiers (Early Bird $199, Student $99, VIP $499)
  - `/workshops`: confirm workshop before selecting; click "Add to Cart"
  - `/cart`: review items, apply discount codes (EARLY10 10%, SPEAKER25 25%, FREEPASS 100%), click "Proceed to Checkout" (or auto-complete if free)
  - `/checkout`: if total $0 click "Complete Registration"; else fill card (16 digits, not starting with 0000), expiry MM/YY, CVV, cardholder; confirm details before paying
  - `/confirmation`: view ticket details, "Register Another" to start over

The floating button (`AIAgentButton`) initializes PageAgent on mount and toggles its panel.

## Registration Flow & Business Logic

`src/store/useStore.ts` contains the complete flow:
- **Auth**: Demo auth sets user from any email (name derived from email prefix); persisted in localStorage
- **Tickets**: Early Bird ($199), Student ($99), VIP ($499). VIP includes all workshops automatically.
- **Workshops**: 8 fixed workshops with time slots/capacities (enrolled counts are mock data)
- **Discounts**: `EARLY10` (10%), `SPEAKER25` (25%), `FREEPASS` (100%)
- **Cart**: Changing ticket clears cart/workshop selections. VIP auto-includes all workshops.
- **Payment**: Mock - any 16-digit card passes except those starting with `0000` (decline). 2s simulated delay. Free orders (total 0) complete without payment form.
- **Persistence**: Zustand persist stores user, auth state, selected ticket, workshops (as Set serialized), discount, purchase. Rehydrates Set correctly.

## Code Conventions

- TypeScript strict mode enabled (`noUncheckedIndexedAccess`, no unused locals/params, verbatimModuleSyntax)
- Path aliases: relative imports within `src/` (e.g., `../services/pageAgent`)
- React Router v7 with protected routes (auth required for `/tickets`, `/workshops`, `/cart`, `/checkout`, `/confirmation`)
- No comments - codebase follows "DO NOT ADD ANY COMMENTS unless asked" convention
- ESLint flat config with recommended TS, React Hooks, React Refresh rules; ignores `dist/`

## Testing & Verification

- **No test scripts defined** in package.json (only dev/build/lint/preview)
- Verify changes with: `npm run lint` and `npm run build` (includes `tsc -b` type checking)
- Manual verification: run `npm run dev` and test the registration flow; Page Agent requires valid LLM credentials to function

## Important Notes

- When editing, preserve existing code style and patterns (especially page-agent initialization, store structure, route protection)
- The app is a demo - auth accepts any credentials, payment is mocked
- Page agent instructions in `services/pageAgent.ts` directly control LLM behavior - changes here affect automation
