import { useState, useEffect } from 'react';
import { useStore } from '../lib/store';
import { supabase } from '../lib/supabase';
import { C, pageStyle, glassStyle, goldGlassStyle } from '../lib/tokens';
import { BackButton } from '../components/BackButton';
import { PayNowButton } from '../components/PayNowButton';
import { TOKEN_PACKAGES } from '../data/tokenPackages';
import {
  CreditCard, CheckCircle, Clock, XCircle, Loader2,
  ArrowLeftRight, Wallet, Receipt, ChevronRight, Coins
} from 'lucide-react';

interface PaymentRecord {
  id: string;
  order_id: string;
  payment_id: string;
  amount: number;
  currency: string;
  status: string;
  tokens_purchased: number;
  created_at: string;
}

export function TransactionScreen() {
  const { user, auth, setScreen, buyPackage } = useStore();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPkg, setSelectedPkg] = useState<(typeof TOKEN_PACKAGES)[0] | null>(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  const fetchPayments = async () => {
    if (!auth.authUid) {
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('id, order_id, payment_id, amount, currency, status, tokens_purchased, created_at')
        .eq('user_uid', auth.authUid)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setPayments(data || []);
    } catch (e) {
      console.error('Failed to fetch payments:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [auth.authUid]);

  const handlePaymentSuccess = async (response: any) => {
    setProcessingPayment(true);
    try {
      if (auth.authUid && selectedPkg) {
        await supabase
          .from('payments')
          .update({
            payment_id: response.razorpay_payment_id,
            status: 'completed',
            updated_at: new Date().toISOString(),
          })
          .eq('user_uid', auth.authUid)
          .eq('order_id', response.razorpay_order_id);

        buyPackage(selectedPkg);
        await fetchPayments();
      }
    } catch (e) {
      console.error('Payment update failed:', e);
    } finally {
      setProcessingPayment(false);
      setShowPayModal(false);
      setSelectedPkg(null);
    }
  };

  const handleSelectPackage = (pkg: (typeof TOKEN_PACKAGES)[0]) => {
    setSelectedPkg(pkg);
    setShowPayModal(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle size={16} color="#22c55e" />;
      case 'failed': return <XCircle size={16} color="#ef4444" />;
      case 'pending': return <Clock size={16} color="#f59e0b" />;
      default: return <Clock size={16} color="#6b7280" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#22c55e';
      case 'failed': return '#ef4444';
      case 'pending': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{ ...pageStyle, padding: '0 24px 48px', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ paddingTop: '56px', marginBottom: '8px' }}>
        <BackButton onClick={() => setScreen('home')} />
      </div>

      <h1 style={{ fontSize: '26px', fontWeight: 800, color: C.text, margin: '16px 0 24px', letterSpacing: '-0.02em' }}>
        Transactions
      </h1>

      {/* Token Balance Card */}
      <div style={{ ...goldGlassStyle, padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(212,168,83,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wallet size={22} color={C.gold} />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: C.textSoft, marginBottom: 2 }}>Current Balance</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: C.gold, lineHeight: 1 }}>
                {user.tokens} <span style={{ fontSize: '14px', fontWeight: 600 }}>tokens</span>
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', color: C.textSoft }}>Value</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: C.text }}>₹{user.tokens * 10}</div>
          </div>
        </div>
        <div style={{ height: 1, background: 'rgba(212,168,83,0.2)', marginBottom: '16px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: C.textSoft }}>
          <span>Total spent: ₹{payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0) / 100}</span>
          <span>{payments.filter(p => p.status === 'completed').length} purchases</span>
        </div>
      </div>

      {/* Buy Tokens Section */}
      <h2 style={{ fontSize: '16px', fontWeight: 700, color: C.text, margin: '0 0 14px' }}>
        Buy Tokens
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
        {TOKEN_PACKAGES.map((pkg) => (
          <div
            key={pkg.name}
            onClick={() => handleSelectPackage(pkg)}
            style={{
              ...(pkg.highlight ? goldGlassStyle : glassStyle),
              padding: '16px 20px',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              ...(pkg.highlight ? { border: `1.5px solid ${C.gold}` } : {}),
              transition: 'all 0.15s ease',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '15px', fontWeight: 700, color: C.text }}>{pkg.name}</span>
                {pkg.badge && (
                  <span style={{
                    fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px',
                    background: pkg.badge === 'BEST VALUE' ? C.gold : C.textMuted + '44',
                    color: pkg.badge === 'BEST VALUE' ? '#0A0E1A' : C.textSoft,
                  }}>
                    {pkg.badge}
                  </span>
                )}
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: pkg.highlight ? C.gold : C.text }}>
                <Coins size={18} style={{ display: 'inline', marginRight: 4 }} />
                {pkg.tokens} tokens
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '20px', fontWeight: 800, color: pkg.highlight ? C.gold : C.text }}>
                  ₹{pkg.price}
                </div>
                <div style={{ fontSize: '11px', color: C.textMuted }}>
                  ₹{(pkg.price / pkg.tokens).toFixed(0)}/token
                </div>
              </div>
              <ChevronRight size={18} color={C.textMuted} />
            </div>
          </div>
        ))}
      </div>

      {/* Payment History */}
      <h2 style={{ fontSize: '16px', fontWeight: 700, color: C.text, margin: '0 0 14px' }}>
        Payment History
      </h2>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Loader2 size={28} color={C.gold} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
          <div style={{ fontSize: '14px', color: C.textSoft }}>Loading transactions...</div>
        </div>
      ) : payments.length === 0 ? (
        <div style={{ ...glassStyle, padding: '40px 24px', textAlign: 'center' }}>
          <Receipt size={36} color={C.textMuted} style={{ margin: '0 auto 12px' }} />
          <div style={{ fontSize: '14px', color: C.textSoft, marginBottom: 4 }}>No transactions yet</div>
          <div style={{ fontSize: '12px', color: C.textMuted }}>Your payment history will appear here</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {payments.map((payment) => (
            <div key={payment.id} style={{ ...glassStyle, padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: getStatusColor(payment.status) + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {getStatusIcon(payment.status)}
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: C.text }}>
                      {payment.tokens_purchased} Tokens
                    </div>
                    <div style={{ fontSize: '12px', color: C.textMuted }}>
                      {new Date(payment.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: C.text }}>
                    ₹{payment.amount / 100}
                  </div>
                  <div style={{ fontSize: '11px', color: getStatusColor(payment.status), fontWeight: 600 }}>
                    {payment.status}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: 6 }}>
                <ArrowLeftRight size={12} color={C.textMuted} />
                <span style={{ fontSize: '11px', color: C.textMuted, fontFamily: 'monospace' }}>
                  {payment.order_id}
                </span>
              </div>
              {payment.payment_id && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, padding: '6px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: 6 }}>
                  <CreditCard size={12} color={C.textMuted} />
                  <span style={{ fontSize: '11px', color: C.textMuted, fontFamily: 'monospace' }}>
                    {payment.payment_id}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Payment Modal */}
      {showPayModal && selectedPkg && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 300, maxWidth: '430px', margin: '0 auto',
        }}>
          <div style={{ ...glassStyle, padding: '28px', width: '90%', maxWidth: '340px' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '42px', marginBottom: '8px' }}>
                <Coins size={42} color={C.gold} />
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: C.text, margin: '0 0 4px' }}>
                {selectedPkg.name} Pack
              </h2>
              <p style={{ fontSize: '14px', color: C.textSoft, margin: 0 }}>
                {selectedPkg.tokens} tokens for ₹{selectedPkg.price}
              </p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${C.surface2}` }}>
                <span style={{ fontSize: '14px', color: C.textSoft }}>Tokens</span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: C.text }}>{selectedPkg.tokens}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${C.surface2}` }}>
                <span style={{ fontSize: '14px', color: C.textSoft }}>Price</span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: C.text }}>₹{selectedPkg.price}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                <span style={{ fontSize: '14px', color: C.textSoft }}>Per Token</span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: C.gold }}>₹{(selectedPkg.price / selectedPkg.tokens).toFixed(2)}</span>
              </div>
            </div>

            <PayNowButton
              amount={selectedPkg.price}
              description={`${selectedPkg.name} - ${selectedPkg.tokens} tokens`}
              onSuccess={handlePaymentSuccess}
              onError={(err) => {
                console.error('Payment error:', err);
                setProcessingPayment(false);
              }}
              disabled={processingPayment}
            />

            <button
              onClick={() => { setShowPayModal(false); setSelectedPkg(null); }}
              style={{
                width: '100%', padding: '14px', marginTop: '12px',
                background: 'transparent', border: `1px solid ${C.surface2}`,
                borderRadius: '14px', color: C.textSoft, fontSize: '14px',
                fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Processing Overlay */}
      {processingPayment && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 400, maxWidth: '430px', margin: '0 auto',
        }}>
          <div style={{ textAlign: 'center' }}>
            <Loader2 size={40} color={C.gold} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
            <div style={{ fontSize: '16px', fontWeight: 700, color: C.text }}>Processing Payment...</div>
            <div style={{ fontSize: '13px', color: C.textSoft, marginTop: 4 }}>Please complete the checkout</div>
          </div>
        </div>
      )}
    </div>
  );
}
