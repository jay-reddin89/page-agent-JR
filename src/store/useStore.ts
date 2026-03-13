import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
export type TicketTier = 'early-bird' | 'student' | 'vip';
export type WorkshopId = string;

export interface Ticket {
  id: string;
  tier: TicketTier;
  name: string;
  price: number;
  description: string;
  benefits: string[];
}

export interface Workshop {
  id: string;
  title: string;
  description: string;
  timeSlot: string;
  capacity: number;
  enrolled: number;
}

export interface Discount {
  code: string;
  percentage: number;
}

export interface CartItem {
  type: 'ticket' | 'workshop';
  id: string;
  name: string;
  price: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface TicketPurchase {
  id: string;
  user: User;
  ticket: Ticket;
  workshops: Workshop[];
  discount?: Discount;
  total: number;
  purchaseDate: string;
}

// Ticket definitions
export const TICKETS: Record<TicketTier, Ticket> = {
  'early-bird': {
    id: 'early-bird',
    tier: 'early-bird',
    name: 'Early Bird',
    price: 199,
    description: 'Limited time offer for early registrants',
    benefits: [
      'Full conference access',
      'Welcome kit',
      'Networking events',
      'Digital recordings',
    ],
  },
  student: {
    id: 'student',
    tier: 'student',
    name: 'Student',
    price: 99,
    description: 'Valid student ID required',
    benefits: [
      'Full conference access',
      'Student networking',
      'Digital recordings',
      'Career fair access',
    ],
  },
  vip: {
    id: 'vip',
    tier: 'vip',
    name: 'VIP',
    price: 499,
    description: 'Ultimate conference experience',
    benefits: [
      'Priority seating',
      'All workshops included',
      'VIP lounge access',
      'Speaker meet & greet',
      'Exclusive swag bag',
      'VIP dinner',
    ],
  },
};

// Workshop definitions
export const WORKSHOPS: Workshop[] = [
  {
    id: 'llm-finetuning',
    title: 'Hands-on LLM Fine-Tuning',
    description: 'Learn to fine-tune large language models for your specific use cases',
    timeSlot: '09:00 - 10:00',
    capacity: 50,
    enrolled: 32,
  },
  {
    id: 'computer-vision',
    title: 'Computer Vision Workshop',
    description: 'Practical computer vision applications with modern frameworks',
    timeSlot: '10:00 - 11:00',
    capacity: 40,
    enrolled: 28,
  },
  {
    id: 'ai-ethics',
    title: 'AI Ethics Panel',
    description: 'Discussion on responsible AI development and deployment',
    timeSlot: '11:00 - 12:00',
    capacity: 100,
    enrolled: 65,
  },
  {
    id: 'rag-systems',
    title: 'RAG Systems Deep Dive',
    description: 'Build production-ready Retrieval-Augmented Generation systems',
    timeSlot: '12:00 - 13:00',
    capacity: 50,
    enrolled: 45,
  },
  {
    id: 'autonomous-agents',
    title: 'Autonomous Agents in Production',
    description: 'Deploy and manage AI agents at scale',
    timeSlot: '14:00 - 15:00',
    capacity: 60,
    enrolled: 48,
  },
  {
    id: 'edge-ai',
    title: 'Edge AI & On-Device Inference',
    description: 'Optimize AI models for edge devices and on-device inference',
    timeSlot: '15:00 - 16:00',
    capacity: 40,
    enrolled: 22,
  },
  {
    id: 'generative-creative',
    title: 'Generative AI for Creative Industries',
    description: 'AI applications in design, music, and content creation',
    timeSlot: '16:00 - 17:00',
    capacity: 80,
    enrolled: 55,
  },
  {
    id: 'ai-safety',
    title: 'AI Safety & Alignment Roundtable',
    description: 'Ensuring AI systems align with human values and safety standards',
    timeSlot: '17:00 - 18:00',
    capacity: 50,
    enrolled: 38,
  },
];

// Valid discount codes
export const DISCOUNTS: Record<string, Discount> = {
  EARLY10: { code: 'EARLY10', percentage: 10 },
  SPEAKER25: { code: 'SPEAKER25', percentage: 25 },
  FREEPASS: { code: 'FREEPASS', percentage: 100 },
};

// Store interface
interface StoreState {
  // Auth state
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;

  // Registration flow
  selectedTicket: Ticket | null;
  selectedWorkshops: Set<WorkshopId>;
  appliedDiscount: Discount | null;

  // Cart
  cartItems: CartItem[];
  subtotal: number;
  discountAmount: number;
  total: number;

  // Actions
  setSelectedTicket: (ticket: Ticket) => void;
  toggleWorkshop: (workshop: Workshop) => void;
  vipHasAllWorkshops: () => boolean;
  applyDiscount: (code: string) => boolean;
  removeDiscount: () => void;
  clearCart: () => void;

  // Purchase
  purchase: TicketPurchase | null;
  completePurchase: (paymentData: PaymentData) => Promise<boolean>;
  resetPurchase: () => void;
}

interface PaymentData {
  cardNumber: string;
  expiry: string;
  cvv: string;
  cardholderName: string;
}

// Mock user storage
const mockUsers = new Map<string, { email: string; password: string; name: string }>();

// Create store
export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Initial auth state
      user: null,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      login: async (email, password) => {
        const storedUser = mockUsers.get(email);
        if (storedUser && storedUser.password === password) {
          const user = { id: crypto.randomUUID(), name: storedUser.name, email };
          set({ user, isAuthenticated: true });
          return true;
        }
        return false;
      },

      signup: async (name, email, password) => {
        if (mockUsers.has(email)) {
          return false;
        }
        mockUsers.set(email, { email, password, name });
        const user = { id: crypto.randomUUID(), name, email };
        set({ user, isAuthenticated: true });
        return true;
      },

      logout: () => set({ user: null, isAuthenticated: false }),

      // Registration flow
      selectedTicket: null,
      selectedWorkshops: new Set<WorkshopId>(),
      appliedDiscount: null,

      setSelectedTicket: (ticket) => set({ selectedTicket: ticket }),

      toggleWorkshop: (workshop) => {
        const { selectedWorkshops, selectedTicket } = get();

        // VIP gets all workshops automatically
        if (selectedTicket?.tier === 'vip') {
          return;
        }

        const newWorkshops = new Set(selectedWorkshops);

        if (newWorkshops.has(workshop.id)) {
          newWorkshops.delete(workshop.id);
        } else {
          newWorkshops.add(workshop.id);
        }

        set({ selectedWorkshops: newWorkshops });
      },

      vipHasAllWorkshops: () => {
        const { selectedTicket } = get();
        return selectedTicket?.tier === 'vip';
      },

      applyDiscount: (code) => {
        const discount = DISCOUNTS[code.toUpperCase()];
        if (discount) {
          set({ appliedDiscount: discount });
          return true;
        }
        return false;
      },

      removeDiscount: () => set({ appliedDiscount: null }),

      clearCart: () =>
        set({
          selectedTicket: null,
          selectedWorkshops: new Set(),
          appliedDiscount: null,
        }),

      // Cart computed values (recomputed on access)
      cartItems: [],
      subtotal: 0,
      discountAmount: 0,
      total: 0,

      purchase: null,

      completePurchase: async (paymentData) => {
        const { selectedTicket, selectedWorkshops, appliedDiscount, user } = get();

        if (!selectedTicket || !user) {
          return false;
        }

        // Mock validation - any 16-digit number passes, numbers starting with 0000 decline
        const cardNumber = paymentData.cardNumber.replace(/\s/g, '');
        if (cardNumber.startsWith('0000')) {
          return false;
        }

        // Build cart items
        const cartItems: CartItem[] = [
          { type: 'ticket', id: selectedTicket.id, name: selectedTicket.name, price: selectedTicket.price },
        ];

        // VIP gets all workshops, otherwise use selected
        const purchasedWorkshops = selectedTicket.tier === 'vip'
          ? WORKSHOPS
          : WORKSHOPS.filter(w => selectedWorkshops.has(w.id));

        purchasedWorkshops.forEach(workshop => {
          cartItems.push({
            type: 'workshop',
            id: workshop.id,
            name: workshop.title,
            price: 0, // Workshops included with ticket
          });
        });

        const subtotal = selectedTicket.price;
        const discountAmount = appliedDiscount
          ? (subtotal * appliedDiscount.percentage) / 100
          : 0;
        const total = subtotal - discountAmount;

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        const purchase: TicketPurchase = {
          id: crypto.randomUUID(),
          user,
          ticket: selectedTicket,
          workshops: purchasedWorkshops,
          discount: appliedDiscount || undefined,
          total,
          purchaseDate: new Date().toISOString(),
        };

        set({ purchase });
        return true;
      },

      resetPurchase: () => set({ purchase: null }),
    }),
    {
      name: 'innovate-ai-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        selectedTicket: state.selectedTicket,
        selectedWorkshops: Array.from(state.selectedWorkshops),
        appliedDiscount: state.appliedDiscount,
        purchase: state.purchase,
      }),
      merge: (persistedState: unknown, currentState) => {
        const state = persistedState as Partial<StoreState>;
        return {
          ...currentState,
          ...(typeof state === 'object' ? state : {}),
          // Convert selectedWorkshops array back to Set on rehydration
          selectedWorkshops: Array.isArray(state.selectedWorkshops)
            ? new Set(state.selectedWorkshops as WorkshopId[])
            : currentState.selectedWorkshops,
        };
      },
    },
  ),
);

