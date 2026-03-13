import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, WORKSHOPS, DISCOUNTS } from '../store/useStore';

export function CartPage() {
  const navigate = useNavigate();
  const { user, selectedTicket, selectedWorkshops, appliedDiscount, applyDiscount, removeDiscount, completePurchase } = useStore();
  const [discountCode, setDiscountCode] = useState('');
  const [discountError, setDiscountError] = useState('');
  const [discountSuccess, setDiscountSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Redirect if not authenticated or no ticket
  if (!user || !selectedTicket) {
    navigate('/auth');
    return null;
  }

  const isVIP = selectedTicket.tier === 'vip';
  const selectedWorkshopList = isVIP
    ? WORKSHOPS
    : WORKSHOPS.filter(w => selectedWorkshops.has(w.id));

  const subtotal = selectedTicket.price;
  const discountAmount = appliedDiscount
    ? (subtotal * appliedDiscount.percentage) / 100
    : 0;
  const total = Math.max(0, subtotal - discountAmount);
  const isFree = total === 0;

  const handleApplyDiscount = () => {
    setDiscountError('');
    setDiscountSuccess(false);

    if (!discountCode.trim()) {
      setDiscountError('Please enter a discount code');
      return;
    }

    const success = applyDiscount(discountCode);
    if (success) {
      setDiscountSuccess(true);
      setDiscountCode('');
    } else {
      setDiscountError('Invalid discount code');
    }
  };

  const handleRemoveDiscount = () => {
    removeDiscount();
    setDiscountSuccess(false);
  };

  const handleCheckout = async () => {
    // For free orders, complete directly without payment form
    if (isFree) {
      setIsProcessing(true);
      const success = await completePurchase({
        cardNumber: '4242424242424242',
        expiry: '12/26',
        cvv: '123',
        cardholderName: user.name,
      });
      setIsProcessing(false);
      if (success) {
        navigate('/confirmation');
      }
    } else {
      navigate('/checkout');
    }
  };

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/workshops')}
            className="text-muted hover:text-white mb-4 flex items-center gap-2"
          >
            Back to Workshops
          </button>
          <h1 className="text-4xl font-bold mb-4">Your Cart</h1>
          <p className="text-muted">Review your selection before checkout</p>
        </div>

        {/* Cart Items */}
        <div className="space-y-4 mb-8">
          {/* Ticket */}
          <div className="card flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div>
                  <h3 className="font-semibold">{selectedTicket.name} Ticket</h3>
                  <p className="text-sm text-muted">{selectedTicket.description}</p>
                </div>
              </div>
              {selectedTicket.benefits.slice(0, 2).map((benefit, i) => (
                <p key={i} className="text-xs text-muted-dark ml-8">- {benefit}</p>
              ))}
            </div>
            <div className="text-xl font-bold">${selectedTicket.price}</div>
          </div>

          {/* Workshops */}
          <div className="card">
            <h3 className="font-semibold mb-4">
              Workshops ({selectedWorkshopList.length})
            </h3>
            <div className="space-y-3">
              {selectedWorkshopList.map((workshop) => (
                <div key={workshop.id} className="flex justify-between items-start py-2 border-b border-dark-300 last:border-0 last:pb-0">
                  <div className="flex-1">
                    <p className="font-medium">{workshop.title}</p>
                    <p className="text-sm text-muted">{workshop.timeSlot}</p>
                  </div>
                  <span className="text-accent text-sm">Included</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Discount Section */}
        <div className="card mb-6">
          <h3 className="font-semibold mb-4">Discount Code</h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={discountCode}
              onChange={(e) => {
                setDiscountCode(e.target.value);
                setDiscountError('');
                setDiscountSuccess(false);
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleApplyDiscount()}
              placeholder="Enter code (e.g., EARLY10)"
              className="input flex-1"
              disabled={!!appliedDiscount}
            />
            {!appliedDiscount && (
              <button onClick={handleApplyDiscount} className="btn-secondary whitespace-nowrap">
                Apply
              </button>
            )}
            {appliedDiscount && (
              <button onClick={handleRemoveDiscount} className="btn-secondary whitespace-nowrap text-red-400">
                Remove
              </button>
            )}
          </div>

          {discountError && (
            <p className="mt-2 text-sm text-red-400">{discountError}</p>
          )}

          {discountSuccess && (
            <p className="mt-2 text-sm text-green-400">
              Discount applied: {appliedDiscount?.percentage}% off!
            </p>
          )}

          {/* Available codes hint */}
          {!appliedDiscount && (
            <div className="mt-4 p-3 bg-dark-200 rounded text-sm">
              <p className="text-muted mb-2">Try these codes:</p>
              <div className="flex flex-wrap gap-2">
                {Object.keys(DISCOUNTS).map(code => (
                  <span
                    key={code}
                    className="px-2 py-1 bg-dark-300 rounded text-xs font-mono"
                  >
                    {code}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="card mb-8">
          <h3 className="font-semibold mb-4">Order Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted">Subtotal</span>
              <span>${subtotal}</span>
            </div>
            {appliedDiscount && (
              <div className="flex justify-between text-green-400">
                <span>Discount ({appliedDiscount.code})</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-dark-300">
              <span>Total</span>
              <span className={appliedDiscount ? 'text-green-400' : ''}>
                ${total === 0 ? 'FREE' : total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Checkout Button */}
        <button
          onClick={handleCheckout}
          disabled={isProcessing}
          className="btn-primary w-full text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Processing...
            </>
          ) : isFree ? (
            'Complete Free Registration'
          ) : (
            'Proceed to Checkout'
          )}
        </button>

        {/* Security notice */}
        {!isFree && (
          <p className="mt-4 text-center text-xs text-muted">
            Secure checkout powered by Stripe (demo)
          </p>
        )}
      </div>
    </div>
  );
}
