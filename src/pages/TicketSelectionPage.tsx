import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, TICKETS } from '../store/useStore';

export function TicketSelectionPage() {
  const navigate = useNavigate();
  const { user, selectedTicket, setSelectedTicket, clearCart } = useStore();
  const [hoveredTicket, setHoveredTicket] = useState<string | null>(null);

  // Redirect if not authenticated
  if (!user) {
    navigate('/auth');
    return null;
  }

  const handleSelectTicket = (ticketId: string) => {
    // If changing to a different ticket, clear workshop selections
    if (selectedTicket?.id !== ticketId) {
      clearCart();
    }
    setSelectedTicket(TICKETS[ticketId as keyof typeof TICKETS]);
  };

  const handleContinue = () => {
    if (selectedTicket) {
      navigate('/workshops');
    }
  };

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Select Your Ticket</h1>
          <p className="text-muted">
            Choose the pass that fits your needs. All tickets include full conference access.
          </p>
        </div>

        {/* Ticket Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {(Object.entries(TICKETS) as [string, typeof TICKETS[keyof typeof TICKETS]][]).map(
            ([id, ticket]) => {
              const isSelected = selectedTicket?.id === id;
              const isHovered = hoveredTicket === id;

              return (
                <div
                  key={id}
                  onClick={() => handleSelectTicket(id)}
                  onMouseEnter={() => setHoveredTicket(id)}
                  onMouseLeave={() => setHoveredTicket(null)}
                  className={`card cursor-pointer transition-all duration-300 ${
                    isSelected
                      ? 'border-accent ring-1 ring-accent'
                      : 'border-border hover:border-accent/50'
                  } ${isHovered && !isSelected ? 'transform -translate-y-1' : ''}`}
                >
                  {/* Badge for limited availability */}
                  {id === 'early-bird' && (
                    <div className="inline-block px-3 py-1 bg-accent/20 text-accent text-xs font-semibold rounded-full mb-4">
                      Limited Time Offer
                    </div>
                  )}

                  {id === 'vip' && (
                    <div className="inline-block px-3 py-1 bg-accent text-white text-xs font-semibold rounded-full mb-4">
                      Best Value
                    </div>
                  )}

                  {/* Ticket Name */}
                  <h3 className="text-2xl font-bold mb-2">{ticket.name}</h3>

                  {/* Price */}
                  <div className="text-4xl font-bold mb-4">
                    ${ticket.price}
                    <span className="text-lg text-muted font-normal"> USD</span>
                  </div>

                  {/* Description */}
                  <p className="text-muted mb-6">{ticket.description}</p>

                  {/* Benefits */}
                  <ul className="space-y-3">
                    {ticket.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="text-accent mt-1">-</span>
                        <span className="text-sm">{benefit}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Selection indicator */}
                  {isSelected && (
                    <div className="mt-6 pt-6 border-t border-border">
                      <div className="flex items-center gap-2 text-accent">
                        <span className="font-medium">Selected</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            },
          )}
        </div>

        {/* Continue Button */}
        <div className="flex justify-center">
          <button
            onClick={handleContinue}
            disabled={!selectedTicket}
            className="btn-primary text-lg px-12 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue to Workshops
            {selectedTicket && (
              <span className="ml-2 text-white/70">→ {selectedTicket.name}</span>
            )}
          </button>
        </div>

        {/* Help text */}
        <p className="mt-8 text-center text-sm text-muted">
          Need help deciding? Contact us at{' '}
          <a href="mailto:support@innovateai2026.com" className="text-accent hover:underline">
            support@innovateai2026.com
          </a>
        </p>
      </div>
    </div>
  );
}
