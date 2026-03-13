import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';

export function CheckoutPage() {
  const navigate = useNavigate();
  const { user, selectedTicket, appliedDiscount, completePurchase } = useStore();
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    cardholderName: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  // Redirect if not authenticated or no ticket
  if (!user || !selectedTicket) {
    navigate('/auth');
    return null;
  }

  // Calculate total
  const subtotal = selectedTicket.price;
  const discountAmount = appliedDiscount
    ? (subtotal * appliedDiscount.percentage) / 100
    : 0;
  const total = Math.max(0, subtotal - discountAmount);
  const isFree = total === 0;

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const groups = cleaned.match(/.{1,4}/g) || [];
    return groups.join(' ').slice(0, 19);
  };

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + (cleaned.length > 2 ? '/' + cleaned.slice(2, 4) : '');
    }
    return cleaned;
  };

  const handleInputChange = (field: string, value: string) => {
    let formatted = value;

    if (field === 'cardNumber') {
      formatted = formatCardNumber(value);
    } else if (field === 'expiry') {
      formatted = formatExpiry(value);
    }

    setFormData({ ...formData, [field]: formatted });
    setErrors({ ...errors, [field]: '' });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const cardNumberClean = formData.cardNumber.replace(/\s/g, '');
    if (cardNumberClean.length !== 16) {
      newErrors.cardNumber = 'Please enter a valid 16-digit card number';
    }

    const expiryMatch = formData.expiry.match(/^(\d{2})\/(\d{2})$/);
    if (!expiryMatch) {
      newErrors.expiry = 'Please enter a valid expiry date (MM/YY)';
    } else if (expiryMatch[1] && expiryMatch[2]) {
      const month = parseInt(expiryMatch[1], 10);
      if (month < 1 || month > 12) {
        newErrors.expiry = 'Invalid month';
      }
    }

    if (formData.cvv.length < 3) {
      newErrors.cvv = 'CVV must be at least 3 digits';
    }

    if (formData.cardholderName.trim().length < 2) {
      newErrors.cardholderName = 'Please enter the cardholder name';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    const success = await completePurchase({
      cardNumber: formData.cardNumber,
      expiry: formData.expiry,
      cvv: formData.cvv,
      cardholderName: formData.cardholderName,
    });

    if (success) {
      navigate('/confirmation');
    } else {
      setErrors({ form: 'Payment declined. Please try a different card.' });
    }

    setIsProcessing(false);
  };

  const handleFreeRegistration = async () => {
    setIsProcessing(true);

    const success = await completePurchase({
      cardNumber: '4242424242424242',
      expiry: '12/26',
      cvv: '123',
      cardholderName: user.name,
    });

    if (success) {
      navigate('/confirmation');
    }

    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/cart')}
            className="text-muted hover:text-white mb-4 flex items-center gap-2"
          >
            Back to Cart
          </button>
          <h1 className="text-4xl font-bold mb-4">Checkout</h1>
          <p className="text-muted">{isFree ? 'Complete your free registration' : 'Complete your purchase securely'}</p>
        </div>

        {isFree ? (
          /* Free Order View */
          <div className="card">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4">
                <span className="text-3xl text-green-500">🎉</span>
              </div>
              <h2 className="text-2xl font-bold mb-2">You're all set!</h2>
              <p className="text-muted">
                Your {appliedDiscount?.code || 'discount'} code gives you 100% off.
                No payment required.
              </p>
            </div>

            {/* Order Summary */}
            <div className="mb-8 pt-6 border-t border-dark-300">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-green-400">FREE</span>
              </div>
            </div>

            {/* Error */}
            {errors.form && (
              <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded">
                {errors.form}
              </div>
            )}

            {/* Complete Registration Button */}
            <button
              onClick={handleFreeRegistration}
              disabled={isProcessing}
              className="btn-primary w-full text-lg py-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                'Complete Registration'
              )}
            </button>
          </div>
        ) : (
          /* Payment Form */
          <form onSubmit={handleSubmit} className="card">
            {/* Card Preview */}
            <div className="mb-8 p-6 bg-accent rounded-xl text-white">
              <div className="flex justify-between items-start mb-8">
                <div className="text-sm opacity-80">Credit Card</div>
              </div>
              <div className="text-xl tracking-widest font-mono mb-4">
                {formData.cardNumber || '•••• •••• •••• ••••'}
              </div>
              <div className="flex justify-between">
                <div className="font-mono">{formData.expiry || 'MM/YY'}</div>
                <div className="font-mono">{formData.cardholderName || 'CARDHOLDER'}</div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              <div>
                <label htmlFor="cardNumber" className="block text-sm font-medium mb-2">
                  Card Number
                </label>
                <input
                  id="cardNumber"
                  type="text"
                  value={formData.cardNumber}
                  onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                  placeholder="1234 5678 9012 3456"
                  className="input w-full font-mono"
                  maxLength={19}
                />
                {errors.cardNumber && (
                  <p className="mt-1 text-sm text-red-400">{errors.cardNumber}</p>
                )}
                {formData.cardNumber.replace(/\s/g, '').startsWith('0000') && (
                  <p className="mt-1 text-sm text-yellow-400">
                    Cards starting with 0000 will be declined (demo restriction)
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="expiry" className="block text-sm font-medium mb-2">
                    Expiry Date
                  </label>
                  <input
                    id="expiry"
                    type="text"
                    value={formData.expiry}
                    onChange={(e) => handleInputChange('expiry', e.target.value)}
                    placeholder="MM/YY"
                    className="input w-full font-mono"
                    maxLength={5}
                  />
                  {errors.expiry && (
                    <p className="mt-1 text-sm text-red-400">{errors.expiry}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="cvv" className="block text-sm font-medium mb-2">
                    CVV
                  </label>
                  <input
                    id="cvv"
                    type="password"
                    value={formData.cvv}
                    onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                    placeholder="•••"
                    className="input w-full font-mono"
                    maxLength={4}
                  />
                  {errors.cvv && (
                    <p className="mt-1 text-sm text-red-400">{errors.cvv}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="cardholderName" className="block text-sm font-medium mb-2">
                  Cardholder Name
                </label>
                <input
                  id="cardholderName"
                  type="text"
                  value={formData.cardholderName}
                  onChange={(e) => setFormData({ ...formData, cardholderName: e.target.value })}
                  placeholder="JOHN DOE"
                  className="input w-full uppercase"
                />
                {errors.cardholderName && (
                  <p className="mt-1 text-sm text-red-400">{errors.cardholderName}</p>
                )}
              </div>
            </div>

            {/* Order summary */}
            <div className="mt-8 pt-6 border-t border-dark-300">
              <div className="flex justify-between text-lg font-bold">
                <span>Total to Pay</span>
                <span className="text-accent">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Error */}
            {errors.form && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded">
                {errors.form}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isProcessing}
              className="btn-primary w-full text-lg py-4 mt-6 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                'Pay Now'
              )}
            </button>

            {/* Security badges */}
            <div className="mt-6 flex items-center justify-center gap-4 text-xs text-muted">
              <div className="flex items-center gap-1">
                Secure Payment
              </div>
              <div className="flex items-center gap-1">
                Money-back Guarantee
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
