import React, { useState } from 'react';
import { X, Zap, CheckCircle, Shield, Loader2, ChevronRight, Receipt } from 'lucide-react';
import { useAuth, API_BASE } from '../../context/AuthContext';
import './PaymentOptionsModal.css';

const GST_RATE = 0.18;

// Dynamically load Razorpay SDK
const loadRazorpayScript = (): Promise<boolean> =>
  new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

interface PaymentOptionsModalProps {
  booking: {
    id: string;
    totalPaid: number; // base price from DB
    status: string;
    advancePaid?: number;
    remainingAmount?: number;
    paymentType?: string;
    service?: { name: string };
    artist?: { user?: { name?: string } };
  };
  onClose: () => void;
  onSuccess: () => void;
}

type PaymentType = 'ADVANCE' | 'FULL';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const PaymentOptionsModal: React.FC<PaymentOptionsModalProps> = ({ booking, onClose, onSuccess }) => {
  const { user, token } = useAuth();
  const [selected, setSelected] = useState<PaymentType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const base = booking.totalPaid;
  const gst = base * GST_RATE;
  const totalWithGST = base + gst;
  const advanceAmount = totalWithGST / 2;

  const handlePay = async (type: PaymentType) => {
    setLoading(true);
    setError('');
    try {
      const sdkLoaded = await loadRazorpayScript();
      if (!sdkLoaded) throw new Error('Razorpay SDK failed to load. Are you online?');

      // Create order on backend
      const orderRes = await fetch(`${API_BASE}/api/payments/create-booking-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ bookingId: booking.id, paymentType: type }),
      });
      const orderData = await orderRes.json();
      if (!orderData.success) throw new Error(orderData.message || 'Failed to create order');


      const description = type === 'ADVANCE'
        ? `Advance Payment (50%) — ${booking.service?.name || 'Booking'}`
        : `Full Payment — ${booking.service?.name || 'Booking'}`;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || '',
        amount: orderData.data.amount,
        currency: orderData.data.currency,
        name: 'LUME',
        description,
        image: 'https://i.imgur.com/K3VqQ5n.png',
        order_id: orderData.data.id,
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch(`${API_BASE}/api/payments/verify-booking`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingId: booking.id,
                paymentType: type,
              }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyData.success) throw new Error('Payment verification failed');
            onSuccess();
          } catch (err: any) {
            setError(err.message || 'Payment verification failed. Please contact support.');
            setLoading(false);
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        notes: {
          bookingId: booking.id,
          paymentType: type,
        },
        theme: {
          color: '#c4a97d',
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (err: any) {
      setError(err.message || 'Payment initiation failed.');
      setLoading(false);
    }
  };

  return (
    <div className="pom-overlay" role="dialog" aria-modal="true" aria-label="Payment Options">
      <div className="pom-backdrop" onClick={!loading ? onClose : undefined} />
      <div className="pom-modal">
        {/* Header */}
        <div className="pom-header">
          <div className="pom-header__icon">
            <Receipt size={20} />
          </div>
          <div className="pom-header__text">
            <h2 className="pom-title">Choose Payment</h2>
            <p className="pom-subtitle">
              {booking.service?.name || 'Booking'} · {booking.artist?.user?.name || 'Artist'}
            </p>
          </div>
          {!loading && (
            <button className="pom-close" onClick={onClose} aria-label="Close">
              <X size={18} />
            </button>
          )}
        </div>

        {/* Price Breakdown */}
        <div className="pom-breakdown">
          <div className="pom-breakdown__row">
            <span className="pom-breakdown__label">Base Price</span>
            <span className="pom-breakdown__value">{fmt(base)}</span>
          </div>
          <div className="pom-breakdown__row pom-breakdown__row--gst">
            <span className="pom-breakdown__label">GST (18%)</span>
            <span className="pom-breakdown__value">{fmt(gst)}</span>
          </div>
          <div className="pom-breakdown__divider" />
          <div className="pom-breakdown__row pom-breakdown__row--total">
            <span className="pom-breakdown__label">Total</span>
            <span className="pom-breakdown__value">{fmt(totalWithGST)}</span>
          </div>
        </div>

        {/* Payment Option Cards */}
        <p className="pom-choose-label">Select payment option</p>
        <div className="pom-options">
          {/* Advance Option */}
          <button
            className={`pom-option ${selected === 'ADVANCE' ? 'pom-option--selected' : ''}`}
            onClick={() => setSelected('ADVANCE')}
            disabled={loading}
          >
            <div className="pom-option__badge pom-option__badge--advance">
              <Zap size={14} />
              Popular
            </div>
            <div className="pom-option__top">
              <div className="pom-option__icon pom-option__icon--advance">
                <Zap size={22} />
              </div>
              <div className="pom-option__info">
                <h3 className="pom-option__title">Pay Advance</h3>
                <p className="pom-option__desc">50% now · 50% before event</p>
              </div>
              <div className={`pom-option__radio ${selected === 'ADVANCE' ? 'pom-option__radio--active' : ''}`} />
            </div>
            <div className="pom-option__amount">
              <span className="pom-option__amount-label">Pay today</span>
              <span className="pom-option__amount-value">{fmt(advanceAmount)}</span>
            </div>
            <div className="pom-option__remaining">
              <span>Remaining: {fmt(advanceAmount)}</span>
            </div>
          </button>

          {/* Full Payment Option */}
          <button
            className={`pom-option ${selected === 'FULL' ? 'pom-option--selected' : ''}`}
            onClick={() => setSelected('FULL')}
            disabled={loading}
          >
            <div className="pom-option__top">
              <div className="pom-option__icon pom-option__icon--full">
                <CheckCircle size={22} />
              </div>
              <div className="pom-option__info">
                <h3 className="pom-option__title">Pay Full</h3>
                <p className="pom-option__desc">100% upfront · No pending dues</p>
              </div>
              <div className={`pom-option__radio ${selected === 'FULL' ? 'pom-option__radio--active' : ''}`} />
            </div>
            <div className="pom-option__amount">
              <span className="pom-option__amount-label">Pay today</span>
              <span className="pom-option__amount-value">{fmt(totalWithGST)}</span>
            </div>
            <div className="pom-option__remaining">
              <span>No remaining balance</span>
            </div>
          </button>
        </div>

        {error && (
          <div className="pom-error">
            <Shield size={14} />
            {error}
          </div>
        )}

        {/* Trust badge */}
        <div className="pom-trust">
          <Shield size={13} />
          <span>100% secure payment via Razorpay</span>
        </div>

        {/* CTA */}
        <button
          className="pom-cta"
          onClick={() => selected && handlePay(selected)}
          disabled={!selected || loading}
        >
          {loading ? (
            <>
              <Loader2 size={18} className="pom-spinner" />
              Opening Payment…
            </>
          ) : (
            <>
              {selected
                ? `Pay ${selected === 'ADVANCE' ? fmt(advanceAmount) : fmt(totalWithGST)}`
                : 'Select an option above'}
              {selected && <ChevronRight size={18} />}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default PaymentOptionsModal;
