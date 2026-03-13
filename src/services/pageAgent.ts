import { PageAgent } from 'page-agent';
import { config } from '../config/env';

let agentInstance: PageAgent | null = null;

/**
 * Page-level instructions for each route
 * These help the AI understand what actions are available on each page
 */
const PAGE_INSTRUCTIONS: Record<string, string> = {
  '/': `
Click "Register Now" to go to /auth
Scroll down to view conference info
`,
  '/auth': `
Enter any email and password, click "Sign In"
Redirects to /tickets
`,
  '/tickets': `
Click a ticket card to select (Early Bird $199, Student $99, VIP $499)
Click "Continue to Workshops" button
`,
  '/workshops': `
Click workshops to select (VIP gets all automatically)
Click "Add to Cart" button
Click "Back to Tickets" to change ticket
`,
  '/cart': `
Review selected ticket and workshops
Enter discount code: EARLY10, SPEAKER25, or FREEPASS
Click "Proceed to Checkout"
`,
  '/checkout': `
If total is $0: click "Complete Registration"
Otherwise: fill card number (16 digits, not starting with 0000), expiry (MM/YY), CVV, cardholder name
Click "Pay Now"
`,
  '/confirmation': `
View ticket details
Click "Register Another" to start over
`,
};

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

Demo rules:
- Auth accepts any email/password
- Cards starting with 0000 are declined

Registration flow: / → /auth → /tickets → /workshops → /cart → /checkout → /confirmation

Tickets: Early Bird $199, Student $99, VIP $499 (VIP includes all workshops)
Discount codes: EARLY10 (10%), SPEAKER25 (25%), FREEPASS (100%)
`,
      getPageInstructions: (url: string) => {
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

