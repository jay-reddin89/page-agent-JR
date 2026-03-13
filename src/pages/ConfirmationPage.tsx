import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';

export function ConfirmationPage() {
  const navigate = useNavigate();
  const { purchase, user, resetPurchase } = useStore();

  // Redirect if no purchase
  useEffect(() => {
    if (!purchase || !user) {
      navigate('/auth');
    }
  }, [purchase, user, navigate]);

  // Don't render if no purchase (redirect will happen in useEffect)
  if (!purchase || !user) {
    return null;
  }

  const { ticket, workshops } = purchase;

  const handleRegisterAnother = () => {
    resetPurchase();
    navigate('/auth');
  };

  // Format date
  const purchaseDate = new Date(purchase.purchaseDate);
  const formattedDate = purchaseDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4">
            <span className="text-2xl text-green-500">✓</span>
          </div>
          <h1 className="text-4xl font-bold mb-2">Registration Complete!</h1>
          <p className="text-muted">
            You're all set for Innovate AI 2026 in Dubai
          </p>
        </div>

        {/* Ticket */}
        <div className="card overflow-hidden">
          {/* Ticket header with accent */}
          <div className="bg-accent p-6 text-center">
            <h2 className="text-2xl font-bold text-white">Innovate AI 2026</h2>
            <p className="text-white/80">March 15-17, 2026</p>
          </div>

          {/* Ticket content */}
          <div className="p-6">
            {/* Ticket type badge */}
            <div className="inline-block px-4 py-2 bg-accent/20 text-accent rounded-full font-semibold mb-6">
              {ticket.name} Ticket
            </div>

            {/* Attendee info */}
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-xs text-muted uppercase tracking-wider mb-1">Attendee</p>
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-muted">{user.email}</p>
              </div>

              <div>
                <p className="text-xs text-muted uppercase tracking-wider mb-1">Ticket ID</p>
                <p className="font-mono text-sm">{purchase.id}</p>
              </div>

              <div>
                <p className="text-xs text-muted uppercase tracking-wider mb-1">Purchase Date</p>
                <p className="text-sm">{formattedDate}</p>
              </div>

              {purchase.discount && (
                <div className="flex items-center gap-2 text-green-400">
                  <span className="text-sm">
                    {purchase.discount.percentage}% discount applied ({purchase.discount.code})
                  </span>
                </div>
              )}
            </div>

            {/* Workshops */}
            <div className="mb-6">
              <p className="text-xs text-muted uppercase tracking-wider mb-3">
                Workshops ({workshops.length})
              </p>
              <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-2">
                {workshops.map((workshop) => (
                  <div key={workshop.id} className="flex items-start gap-3 text-sm">
                    <span className="text-accent mt-1">▸</span>
                    <div>
                      <p className="font-medium">{workshop.title}</p>
                      <p className="text-xs text-muted">{workshop.timeSlot}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center mt-8">
          <button
            onClick={handleRegisterAnother}
            className="btn-primary text-lg px-12 py-4"
          >
            Register Another
          </button>
        </div>

        {/* Conference info */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted mb-2">
            Questions? Contact us at{' '}
            <a href="mailto:support@innovateai2026.com" className="text-accent hover:underline">
              support@innovateai2026.com
            </a>
          </p>
          <p className="text-xs text-muted-dark">
            We can't wait to see you there!
          </p>
        </div>
      </div>
    </div>
  );
}
