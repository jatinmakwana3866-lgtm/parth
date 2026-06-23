import { useState, useCallback, useEffect } from 'react';
import { CreditCard, Loader2 } from 'lucide-react';

interface PayNowButtonProps {
  amount: number;
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

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

function isInIframe(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

function openPopupCheckout(orderId: string, amount: number, key: string, desc: string) {
  const popup = window.open(
    '',
    'RazorpayCheckout',
    'width=600,height=700,top=100,left=100,scrollbars=yes,resizable=yes'
  );
  if (!popup) {
    alert('Popup blocked. Please allow popups for this site and try again.');
    return null;
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Payment - Embroidery Marketplace</title>
        <style>
          body { font-family: system-ui, sans-serif; background: #0A0E1A; color: #F8F5F0; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
          .loading { text-align: center; }
          .spinner { width: 40px; height: 40px; border: 3px solid rgba(212,168,83,0.3); border-top-color: #D4A853; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 16px; }
          @keyframes spin { to { transform: rotate(360deg); } }
          p { color: #A8A29E; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="loading">
          <div class="spinner"></div>
          <p>Loading secure checkout...</p>
        </div>
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
        <script>
          const options = {
            key: "${key}",
            amount: ${amount},
            currency: "INR",
            name: "Embroidery Marketplace",
            description: "${desc.replace(/"/g, '\\"')}",
            order_id: "${orderId}",
            handler: function(response) {
              window.opener.postMessage({
                type: 'RAZORPAY_SUCCESS',
                payment_id: response.razorpay_payment_id,
                order_id: response.razorpay_order_id,
                signature: response.razorpay_signature
              }, '*');
              document.body.innerHTML = '<div style="text-align:center;padding:40px"><div style="font-size:48px;margin-bottom:16px">✓</div><h2 style="color:#22c55e">Payment Successful!</h2><p style="color:#A8A29E">You can close this window.</p></div>';
              setTimeout(function() { window.close(); }, 3000);
            },
            modal: {
              ondismiss: function() {
                window.opener.postMessage({ type: 'RAZORPAY_DISMISSED' }, '*');
                window.close();
              }
            },
            theme: { color: "#D4A853" }
          };
          const rzp = new Razorpay(options);
          rzp.open();
        </script>
      </body>
    </html>
  `;

  popup.document.write(html);
  popup.document.close();
  return popup;
}

export function PayNowButton({
  amount,
  description = 'Payment',
  onSuccess,
  onError,
  disabled = false,
}: PayNowButtonProps) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'RAZORPAY_SUCCESS') {
        setLoading(false);
        onSuccess?.({
          razorpay_payment_id: event.data.payment_id,
          razorpay_order_id: event.data.order_id,
          razorpay_signature: event.data.signature,
        });
      } else if (event.data?.type === 'RAZORPAY_DISMISSED') {
        setLoading(false);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onSuccess]);

  const createOrder = useCallback(async (): Promise<{ orderId: string; amount: number; currency: string }> => {
    const apiUrl = `${SUPABASE_URL}/functions/v1/create-razorpay-order`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        amount: amount * 100,
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
      const order = await createOrder();
      const key = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_T4vpcqQtxHaS9L';

      if (isInIframe()) {
        openPopupCheckout(order.orderId, order.amount, key, description);
      } else {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => {
          const rzp = new (window as any).Razorpay({
            key,
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
            modal: {
              ondismiss: () => setLoading(false),
            },
            theme: { color: '#D4A853' },
          });
          rzp.open();
        };
        script.onerror = () => {
          setLoading(false);
          onError?.('Failed to load Razorpay checkout');
        };
        document.body.appendChild(script);
      }
    } catch (err) {
      setLoading(false);
      const message = err instanceof Error ? err.message : 'Payment failed';
      alert(`Payment Error: ${message}`);
      onError?.(message);
    }
  }, [loading, disabled, createOrder, description, onSuccess, onError]);

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
