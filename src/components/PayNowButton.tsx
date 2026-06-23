import { useState, useRef, useCallback } from 'react';
import { CreditCard, Loader2 } from 'lucide-react';
import { C } from '../lib/tokens';

interface PayNowButtonProps {
  amount: number; // Amount in rupees (e.g., 100 = ₹100)
  description?: string;
  onSuccess?: (response: RazorpaySuccessResponse) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpaySuccessResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayInstance {
  open: () => void;
  close: () => void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

const RAZORPAY_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export function PayNowButton({
  amount,
  description = 'Payment',
  onSuccess,
  onError,
  disabled = false,
}: PayNowButtonProps) {
  const [loading, setLoading] = useState(false);
  const scriptLoaded = useRef(false);
  const scriptLoading = useRef(false);

  const loadScript = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (scriptLoaded.current) {
        resolve();
        return;
      }
      if (scriptLoading.current) {
        // Wait for existing load
        const check = setInterval(() => {
          if (scriptLoaded.current) {
            clearInterval(check);
            resolve();
          }
        }, 100);
        return;
      }
      if (window.Razorpay) {
        scriptLoaded.current = true;
        resolve();
        return;
      }
      scriptLoading.current = true;
      const script = document.createElement('script');
      script.src = RAZORPAY_SCRIPT;
      script.async = true;
      script.onload = () => {
        scriptLoaded.current = true;
        scriptLoading.current = false;
        resolve();
      };
      script.onerror = () => {
        scriptLoading.current = false;
        reject(new Error('Failed to load Razorpay script'));
      };
      document.body.appendChild(script);
    });
  }, []);

  const createOrder = useCallback(async (): Promise<{ orderId: string; amount: number; currency: string }> => {
    const apiUrl = `${SUPABASE_URL}/functions/v1/create-razorpay-order`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        amount: amount * 100, // Convert to paise
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to create order (${response.status})`);
    }

    const data = await response.json();
    if (!data.orderId) {
      throw new Error('Invalid order response from server');
    }
    return data;
  }, [amount]);

  const handlePayment = useCallback(async () => {
    if (loading || disabled) return;
    setLoading(true);

    try {
      // Load Razorpay script
      await loadScript();

      // Create order via backend
      const order = await createOrder();

      // Open Razorpay checkout
      const options: RazorpayOptions = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_T4vpcqQtxHaS9L',
        amount: order.amount,
        currency: order.currency,
        name: 'Embroidery Marketplace',
        description: description,
        order_id: order.orderId,
        handler: (response: RazorpaySuccessResponse) => {
          setLoading(false);
          alert(`Payment successful! Payment ID: ${response.razorpay_payment_id}`);
          onSuccess?.(response);
        },
        prefill: {
          name: '',
          email: '',
          contact: '',
        },
        theme: {
          color: '#D4A853',
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setLoading(false);
      const message = err instanceof Error ? err.message : 'Payment failed';
      alert(`Payment Error: ${message}`);
      onError?.(message);
    }
  }, [loading, disabled, loadScript, createOrder, description, onSuccess, onError]);

  return (
    <button
      onClick={handlePayment}
      disabled={loading || disabled}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        width: '100%',
        padding: '16px 24px',
        background: loading || disabled ? 'rgba(212,168,83,0.5)' : 'linear-gradient(135deg, #D4A853, #7A5520)',
        color: '#0A0E1A',
        border: 'none',
        borderRadius: '14px',
        fontSize: '16px',
        fontWeight: 700,
        cursor: loading || disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit',
        transition: 'all 0.15s ease',
        boxShadow: '0 4px 20px rgba(212,168,83,0.3)',
      }}
      onMouseEnter={e => {
        if (!loading && !disabled) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(212,168,83,0.4)';
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(212,168,83,0.3)';
      }}
    >
      {loading ? (
        <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
      ) : (
        <CreditCard size={20} />
      )}
      {loading ? 'Processing...' : `Pay Now ₹${amount}`}
    </button>
  );
}
