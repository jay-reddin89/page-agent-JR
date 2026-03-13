import { PageAgent } from 'page-agent';
import { config } from '../config/env';

let agentInstance: PageAgent | null = null;

/**
 * Page-level instructions for each route
 * These help the AI understand what actions are available on each page
 */
const PAGE_INSTRUCTIONS: Record<string, string> = (
  {
    '/': `
This is the landing page for Innovate AI 2026 Conference in Dubai.
Available actions:
- Click "Register Now" to start the registration flow (goes to auth page)
- Click "Sign In" to go to the sign-in page
- Scroll down to see conference highlights
`,

    '/auth': `
This is the authentication page with tabs for Sign Up and Sign In.
Available actions:
- Click on "Sign Up" or "Sign In" tabs to switch between forms
- Fill in name, email, and password fields
- Click "Sign Up" or "Sign In" buttons to submit the form
- After successful auth, user is redirected to ticket selection
`,

    '/tickets': `
This is the ticket selection page with three ticket tiers.
Available actions:
- Click on any ticket card to select it (Early Bird $199, Student $99, VIP $499)
- View ticket benefits on each card
- After selection, click "Continue to Workshops" button
`,

    '/workshops': `
This is the workshop selection page with 8 AI/ML themed workshops.
Available actions:
- Click on workshop cards to toggle selection (VIP gets all automatically)
- View workshop details: title, description, time slot, capacity
- Note: workshops with conflicting time slots cannot both be selected
- Click "Add to Cart" button when done selecting
`,

    '/cart': `
This is the cart page showing selected items.
Available actions:
- Review selected ticket and workshops
- Enter discount codes in the coupon field (EARLY10, SPEAKER25, FREEPASS)
- Click "Apply" button to apply discount
- Click "Proceed to Checkout" to continue
`,

    '/checkout': `
This is the checkout/payment page.
Available actions:
- Fill in payment details: card number (16 digits), expiry (MM/YY), CVV, cardholder name
- Click "Pay Now" to submit payment
- Note: Cards starting with 0000 will be declined
- After successful payment, user is redirected to confirmation
`,

    '/confirmation': `
This is the confirmation page displaying the ticket.
Available actions:
- View ticket details: attendee info, ticket type, workshops, ticket ID
- Scan the QR code for check-in
- Click "Download Ticket" to save as image
- Click "Register Another" to start a new registration
`,
  }
);

/**
 * Initialize the page-agent instance
 * Should be called once at app root
 */
export function initializePageAgent(): PageAgent {
  if (agentInstance) {
    return agentInstance;
  }

  agentInstance = new PageAgent({
    baseURL: config.llm.baseURL,
    apiKey: config.llm.apiKey,
    model: config.llm.model,
    language: 'en-US',

    // PageController options
    enableMask: true,
    viewportExpansion: 0,

    // Instructions to guide agent behavior
    instructions: {
      system: `
You are an AI assistant for the Innovate AI 2026 Conference registration website.
You help users navigate the registration flow, select tickets, choose workshops, and complete checkout.

Key Guidelines:
- Always confirm actions before executing them (e.g., "I'll click the Register Now button")
- Be clear and concise in your explanations
- If a user asks about pricing, explain the ticket tiers and workshop availability
- For payment, clearly explain the total before proceeding
- Report any errors immediately and suggest next steps
- VIP tickets automatically include all workshops

Registration Flow:
1. Landing Page → Auth (Sign Up/Sign In)
2. Ticket Selection (Early Bird $199, Student $99, VIP $499)
3. Workshop Selection (VIP gets all, others select individually)
4. Cart (apply discounts like EARLY10, SPEAKER25, FREEPASS)
5. Checkout (payment form)
6. Confirmation (ticket with QR code)
`,
      getPageInstructions: (url: string) => {
        // Find matching page instruction
        const path = new URL(url).pathname;
        return PAGE_INSTRUCTIONS[path] || PAGE_INSTRUCTIONS[path + '/'] || undefined;
      },
    },
  });

  return agentInstance;
}

/**
 * Get the existing page-agent instance
 * Returns null if not initialized
 */
export function getPageAgent(): PageAgent | null {
  return agentInstance;
}

