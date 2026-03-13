import { useNavigate } from 'react-router-dom';
import { useStore, WORKSHOPS } from '../store/useStore';

export function WorkshopSelectionPage() {
  const navigate = useNavigate();
  const { user, selectedTicket, selectedWorkshops, toggleWorkshop } = useStore();

  // Redirect if not authenticated or no ticket selected
  if (!user || !selectedTicket) {
    navigate('/auth');
    return null;
  }

  const isVIP = selectedTicket.tier === 'vip';
  const allSelected = isVIP || selectedWorkshops.size > 0;

  const handleToggle = (workshop: typeof WORKSHOPS[number]) => {
    // VIP cannot toggle workshops
    if (isVIP) return;
    toggleWorkshop(workshop);
  };

  const handleContinue = () => {
    navigate('/cart');
  };

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/tickets')}
            className="text-muted hover:text-white mb-4 flex items-center gap-2"
          >
            Back to Tickets
          </button>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Select Workshops</h1>
          <p className="text-muted">
            {isVIP
              ? 'VIP access includes all workshops automatically!'
              : 'Choose from our hands-on workshops.'}
          </p>
          {isVIP && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-accent text-white text-sm font-semibold rounded-full">
              VIP: All workshops included
            </div>
          )}
        </div>

        {/* Workshops in 2-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {WORKSHOPS.map((workshop) => {
                const isSelected = isVIP || selectedWorkshops.has(workshop.id);

                return (
                  <div
                    key={workshop.id}
                    onClick={() => handleToggle(workshop)}
                    className={`card cursor-pointer transition-all duration-200 ${
                      isVIP
                        ? 'opacity-60 cursor-not-allowed'
                        : 'hover:border-accent/50'
                    } ${
                      isSelected && !isVIP
                        ? 'border-accent ring-1 ring-accent'
                        : 'border-border'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold pr-4">{workshop.title}</h3>
                      {isSelected && !isVIP && (
                        <span className="text-accent text-sm">Selected</span>
                      )}
                    </div>

                    <p className="text-muted text-sm mb-2">{workshop.description}</p>
                    <p className="text-xs text-muted mb-4">{workshop.timeSlot}</p>

                    {/* Capacity indicator */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-dark-300 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              workshop.enrolled / workshop.capacity > 0.8
                                ? 'bg-red-500'
                                : workshop.enrolled / workshop.capacity > 0.5
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                            }`}
                            style={{
                              width: `${(workshop.enrolled / workshop.capacity) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-xs text-muted">
                          {workshop.enrolled}/{workshop.capacity}
                        </span>
                      </div>

                      {isVIP && (
                        <span className="text-xs text-accent">Included</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

        {/* Continue Button */}
        <div className="flex justify-center mt-12">
          <button
            onClick={handleContinue}
            className="btn-primary text-lg px-12 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!allSelected}
          >
            Add to Cart
          </button>
        </div>

        {/* Selection summary */}
        {!isVIP && selectedWorkshops.size > 0 && (
          <div className="mt-8 text-center text-muted">
            {selectedWorkshops.size} workshop{selectedWorkshops.size > 1 ? 's' : ''} selected
          </div>
        )}
      </div>
    </div>
  );
}
