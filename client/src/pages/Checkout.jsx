import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  MapPin,
  ClipboardList,
  CreditCard,
  Check,
  ArrowLeft,
  ArrowRight,
  Lock,
  Loader2,
  PackageCheck,
} from 'lucide-react';

import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../api/client';
import { inr, shippingNote } from '../utils/format';
import { assetUrl } from '../utils/asset';

const STEPS = [
  { id: 1, label: 'Details', icon: User },
  { id: 2, label: 'Address', icon: MapPin },
  { id: 3, label: 'Summary', icon: ClipboardList },
  { id: 4, label: 'Payment', icon: CreditCard },
];

const INITIAL = {
  fullName: '',
  mobile: '',
  email: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
};

export default function Checkout() {
  const { items, counts, clearCart } = useCart();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState(INITIAL);
  const [payment, setPayment] = useState('online');
  const [coupon, setCoupon] = useState('');
  const [applied, setApplied] = useState(null);
  const [placing, setPlacing] = useState(false);

  /*
   * Load Razorpay Checkout SDK
   */
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');

      script.src = 'https://checkout.razorpay.com/v1/checkout.js';

      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  };

  /*
   * Load user/default address
   */
  useEffect(() => {
    if (user) {
      const a =
        user.addresses?.find((x) => x.isDefault) ||
        user.addresses?.[0];

      setForm((f) => ({
        ...f,

        fullName: f.fullName || user.fullName || '',
        email: f.email || user.email || '',
        mobile: f.mobile || user.mobile || '',

        ...(a
          ? {
              fullName: a.fullName || user.fullName || '',
              mobile: a.mobile || user.mobile || '',
              address: a.address || '',
              city: a.city || '',
              state: a.state || '',
              pincode: a.pincode || '',
            }
          : {}),
      }));
    }
  }, [user]);

  /*
   * Shipping calculation
   */
  const shipping = shippingNote(
    counts.subtotal - (applied?.discount || 0)
  );

  const couponDiscount = applied?.discount || 0;

  const subAfterCoupon =
    counts.subtotal - couponDiscount;

  const grand =
    subAfterCoupon +
    (subAfterCoupon >= 999 || subAfterCoupon === 0
      ? 0
      : shipping.cost);

  /*
   * Form helper
   */
  const set = (key) => (event) => {
    setForm((current) => ({
      ...current,
      [key]: event.target.value,
    }));
  };

  /*
   * Address validation
   */
  const required = [
    'fullName',
    'mobile',
    'email',
    'address',
    'city',
    'state',
    'pincode',
  ];

  const addressValid =
    required.every(
      (key) => (form[key] || '').trim().length > 0
    ) &&
    /^\d{6}$/.test(form.pincode);

  /*
   * Coupon
   */
  const applyCoupon = async () => {
    if (!coupon.trim()) return;

    try {
      const data = await api.post('/coupons/validate', {
        code: coupon,
        subtotal: counts.subtotal,
      });

      setApplied(data.coupon);

      toast(
        `Coupon applied — save ${inr(data.coupon.discount)}`
      );
    } catch (error) {
      toast(error.message, 'error');
    }
  };

  /*
   * ============================================================
   * COMPLETE ORDER FLOW
   *
   * COD:
   * Checkout -> Create Order -> Confirmation
   *
   * ONLINE:
   * Checkout
   * -> Create Razorpay Order
   * -> Open Razorpay
   * -> Customer Pays
   * -> Verify Payment on Server
   * -> Create ND Perfume Order
   * -> Confirmation
   *
   * IMPORTANT:
   * We DO NOT create the ND Perfume order before payment.
   * ============================================================
   */
  const placeOrder = async () => {
    if (placing) return;

    setPlacing(true);

    try {
      const body = {
        address: form,

        paymentMethod: payment,

        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),

        ...(coupon.trim()
          ? {
              couponCode: coupon.trim(),
            }
          : {}),
      };

      /*
       * ========================================================
       * CASH ON DELIVERY
       * ========================================================
       */
      if (payment === 'cod') {
        const data = await api.post(
          '/orders/checkout',
          body
        );

        if (!data?.order) {
          throw new Error(
            'Order could not be created.'
          );
        }

        clearCart();

        navigate('/order-confirmation', {
          state: {
            order: data.order,
          },
        });

        return;
      }

      /*
       * ========================================================
       * ONLINE PAYMENT
       * ========================================================
       */

      /*
       * 1. Load Razorpay SDK
       */
      const loaded = await loadRazorpay();

      if (!loaded) {
        throw new Error(
          'Unable to load Razorpay. Please check your internet connection and try again.'
        );
      }

      /*
       * 2. Create Razorpay payment order
       *
       * grand is ₹499
       * backend converts it to 49900 paise
       */
      const paymentOrder = await api.post(
        '/payments/create-order',
        {
          amount: grand,
        }
      );

      if (
        !paymentOrder?.success ||
        !paymentOrder?.order?.id ||
        !paymentOrder?.keyId
      ) {
        throw new Error(
          'Unable to create Razorpay payment order.'
        );
      }

      /*
       * 3. Razorpay Checkout configuration
       */
      const options = {
        key: paymentOrder.keyId,

        amount: paymentOrder.order.amount,

        currency:
          paymentOrder.order.currency || 'INR',

        name: 'ND Perfume',

        description: `ND Perfume Order — ${inr(grand)}`,

        order_id: paymentOrder.order.id,

        prefill: {
          name: form.fullName,
          email: form.email,
          contact: form.mobile,
        },

        notes: {
          customer_name: form.fullName,
          mobile: form.mobile,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
        },

        theme: {
          color: '#c9a45c',
        },

        /*
         * ======================================================
         * PAYMENT SUCCESS
         * ======================================================
         */
        handler: async function (response) {
          try {
            /*
             * 4. Verify payment signature on backend
             */
            const verification =
              await api.post(
                '/payments/verify',
                {
                  razorpay_order_id:
                    response.razorpay_order_id,

                  razorpay_payment_id:
                    response.razorpay_payment_id,

                  razorpay_signature:
                    response.razorpay_signature,
                }
              );

            if (!verification?.success) {
              throw new Error(
                'Payment verification failed.'
              );
            }

            /*
             * 5. Payment has now been verified.
             *
             * ONLY NOW create the actual ND Perfume order.
             */
            const data = await api.post(
              '/orders/checkout',
              {
                ...body,

                paymentMethod: 'online',

                razorpayOrderId:
                  response.razorpay_order_id,

                razorpayPaymentId:
                  response.razorpay_payment_id,
              }
            );

            if (!data?.order) {
              throw new Error(
                'Payment was successful, but the order could not be created. Please contact support.'
              );
            }

            /*
             * 6. Clear cart
             */
            clearCart();

            /*
             * 7. Go to confirmation page
             */
            navigate('/order-confirmation', {
              state: {
                order: data.order,
              },
            });
          } catch (error) {
            console.error(
              'Payment verification/order error:',
              error
            );

            toast(
              error.message ||
                'Payment verification failed. If money was deducted, please contact support.',
              'error'
            );

            setPlacing(false);
          }
        },

        /*
         * ======================================================
         * PAYMENT WINDOW CLOSED
         * ======================================================
         */
        modal: {
          ondismiss: function () {
            setPlacing(false);

            toast(
              'Payment cancelled. Your order was not placed.',
              'error'
            );
          },
        },
      };

      /*
       * 4. Create Razorpay instance
       */
      const razorpay =
        new window.Razorpay(options);

      /*
       * ========================================================
       * PAYMENT FAILED
       * ========================================================
       */
      razorpay.on(
        'payment.failed',
        function (response) {
          console.error(
            'Razorpay payment failed:',
            response
          );

          setPlacing(false);

          toast(
            response?.error?.description ||
              'Payment failed. Your order was not placed.',
            'error'
          );
        }
      );

      /*
       * 5. Open Razorpay popup
       */
      razorpay.open();
    } catch (error) {
      console.error(
        'Checkout error:',
        error
      );

      toast(
        error.message ||
          'Something went wrong. Please try again.',
        'error'
      );

      setPlacing(false);
    }
  };

  const itemCount = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  /*
   * Empty cart
   */
  if (items.length === 0 && step !== 4) {
    return (
      <div
        className="container center"
        style={{
          paddingTop: 160,
          paddingBottom: 80,
        }}
      >
        <PackageCheck
          size={44}
          style={{
            color: 'var(--gold-2)',
            margin: '0 auto 18px',
          }}
        />

        <h1 className="h2">
          Nothing to check out
        </h1>

        <p className="muted mt-16">
          Your cart is empty. Add a fragrance first.
        </p>

        <Link
          to="/shop"
          className="btn btn-gold mt-24"
        >
          Shop Fragrances
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="page-head">
        <span className="eyebrow">
          Secure Checkout
        </span>

        <h1>CHECKOUT</h1>
      </div>

      <div className="container checkout-layout">
        <div className="checkout-main">

          {/* ===================================================
              STEPPER
          =================================================== */}
          <div className="stepper">
            {STEPS.map((currentStep, index) => {
              const Icon = currentStep.icon;

              return (
                <div
                  key={currentStep.id}
                  className={`step ${
                    step >= currentStep.id
                      ? 'done'
                      : ''
                  } ${
                    step === currentStep.id
                      ? 'current'
                      : ''
                  }`}
                >
                  <span className="step-ic">
                    {step > currentStep.id ? (
                      <Check size={15} />
                    ) : (
                      <Icon size={15} />
                    )}
                  </span>

                  <span className="step-label">
                    {currentStep.label}
                  </span>

                  {index < STEPS.length - 1 && (
                    <span className="step-line" />
                  )}
                </div>
              );
            })}
          </div>

          {/* ===================================================
              STEP 1 — CUSTOMER DETAILS
          =================================================== */}
          {step === 1 && (
            <div className="checkout-panel">
              <h3 className="h3">
                Customer Details
              </h3>

              <div className="form-grid">
                <div className="field">
                  <label>
                    Full Name *
                  </label>

                  <input
                    className="input"
                    value={form.fullName}
                    onChange={set('fullName')}
                    placeholder="e.g. Aarav Sharma"
                  />
                </div>

                <div className="field">
                  <label>
                    Mobile Number *
                  </label>

                  <input
                    className="input"
                    value={form.mobile}
                    onChange={set('mobile')}
                    placeholder="10-digit mobile"
                    inputMode="numeric"
                    maxLength={10}
                  />
                </div>

                <div
                  className="field"
                  style={{
                    gridColumn: '1 / -1',
                  }}
                >
                  <label>
                    Email *
                  </label>

                  <input
                    className="input"
                    type="email"
                    value={form.email}
                    onChange={set('email')}
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <button
                className="btn btn-gold"
                onClick={() => setStep(2)}
              >
                Continue
                <ArrowRight size={15} />
              </button>
            </div>
          )}

          {/* ===================================================
              STEP 2 — DELIVERY ADDRESS
          =================================================== */}
          {step === 2 && (
            <div className="checkout-panel">
              <h3 className="h3">
                Delivery Address
              </h3>

              <div className="form-grid">
                <div
                  className="field"
                  style={{
                    gridColumn: '1 / -1',
                  }}
                >
                  <label>
                    Full Address *
                  </label>

                  <textarea
                    className="textarea"
                    value={form.address}
                    onChange={set('address')}
                    placeholder="House no, street, area, landmark"
                  />
                </div>

                <div className="field">
                  <label>
                    City *
                  </label>

                  <input
                    className="input"
                    value={form.city}
                    onChange={set('city')}
                    placeholder="City"
                  />
                </div>

                <div className="field">
                  <label>
                    State *
                  </label>

                  <input
                    className="input"
                    value={form.state}
                    onChange={set('state')}
                    placeholder="State"
                  />
                </div>

                <div className="field">
                  <label>
                    Pincode *
                  </label>

                  <input
                    className="input"
                    value={form.pincode}
                    onChange={set('pincode')}
                    placeholder="6-digit pincode"
                    inputMode="numeric"
                    maxLength={6}
                  />
                </div>
              </div>

              <div className="checkout-nav">
                <button
                  className="btn btn-dark"
                  onClick={() => setStep(1)}
                >
                  <ArrowLeft size={15} />
                  Back
                </button>

                <button
                  className="btn btn-gold"
                  disabled={!addressValid}
                  onClick={() => setStep(3)}
                >
                  {!addressValid
                    ? 'Complete all fields'
                    : 'Continue'}

                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* ===================================================
              STEP 3 — ORDER SUMMARY
          =================================================== */}
          {step === 3 && (
            <div className="checkout-panel">
              <h3 className="h3">
                Order Summary
              </h3>

              <ul className="co-items">
                {items.map((item) => (
                  <li key={item.productId}>
                    <img
                      src={assetUrl(
                        item.bottleImage
                      )}
                      alt={item.name}
                      loading="lazy"
                    />

                    <div>
                      <strong>
                        {item.name}
                      </strong>

                      <span>
                        {item.size} · Qty{' '}
                        {item.quantity}
                      </span>
                    </div>

                    <b>
                      {inr(
                        item.price *
                          item.quantity
                      )}
                    </b>
                  </li>
                ))}
              </ul>

              <div className="co-sum">
                <div>
                  <span>
                    Items ({itemCount})
                  </span>

                  <span>
                    {inr(counts.subtotal)}
                  </span>
                </div>

                {couponDiscount > 0 && (
                  <div>
                    <span>
                      Coupon ({applied.code})
                    </span>

                    <span
                      style={{
                        color:
                          'var(--success)',
                      }}
                    >
                      − {inr(couponDiscount)}
                    </span>
                  </div>
                )}

                <div>
                  <span>
                    Shipping
                  </span>

                  <span>
                    {shipping.cost === 0
                      ? 'FREE'
                      : inr(shipping.cost)}
                  </span>
                </div>

                <div className="co-grand">
                  <span>
                    Grand Total
                  </span>

                  <b>
                    {inr(grand)}
                  </b>
                </div>
              </div>

              <div className="checkout-nav">
                <button
                  className="btn btn-dark"
                  onClick={() => setStep(2)}
                >
                  <ArrowLeft size={15} />
                  Back
                </button>

                <button
                  className="btn btn-gold"
                  onClick={() => setStep(4)}
                >
                  Continue to Payment
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* ===================================================
              STEP 4 — PAYMENT
          =================================================== */}
          {step === 4 && (
            <div className="checkout-panel">
              <h3 className="h3">
                Payment
              </h3>

              <p
                className="muted"
                style={{
                  marginBottom: 18,
                  fontSize: 14,
                }}
              >
                Choose your preferred payment method.
                Online payment is processed securely
                by Razorpay.
              </p>

              <div className="pay-options">

                {/* ONLINE PAYMENT */}
                <label
                  className={`pay-opt ${
                    payment === 'online'
                      ? 'active'
                      : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="pay"
                    checked={
                      payment === 'online'
                    }
                    onChange={() =>
                      setPayment('online')
                    }
                  />

                  <span className="pay-ic">
                    <CreditCard size={20} />
                  </span>

                  <span>
                    <strong>
                      Online Payment
                    </strong>

                    <small>
                      UPI · Card · Netbanking · Wallet
                    </small>
                  </span>

                  <span className="pay-badge">
                    Recommended
                  </span>
                </label>

                {/* COD */}
                <label
                  className={`pay-opt ${
                    payment === 'cod'
                      ? 'active'
                      : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="pay"
                    checked={
                      payment === 'cod'
                    }
                    onChange={() =>
                      setPayment('cod')
                    }
                  />

                  <span className="pay-ic">
                    <PackageCheck size={20} />
                  </span>

                  <span>
                    <strong>
                      Cash on Delivery
                    </strong>

                    <small>
                      Pay when your order arrives
                    </small>
                  </span>
                </label>
              </div>

              {/* PAYMENT SECURITY MESSAGE */}
              {payment === 'online' && (
                <div
                  style={{
                    marginTop: 18,
                    padding: '14px 16px',
                    border: '1px solid rgba(201, 164, 92, 0.25)',
                    borderRadius: 8,
                    background:
                      'rgba(201, 164, 92, 0.05)',
                    fontSize: 13,
                  }}
                >
                  <strong>
                    🔒 Secure Online Payment
                  </strong>

                  <p
                    className="muted"
                    style={{
                      marginTop: 5,
                      marginBottom: 0,
                    }}
                  >
                    You will be redirected to
                    Razorpay's secure checkout to
                    complete your payment. Your order
                    will be created only after the
                    payment is successfully verified.
                  </p>
                </div>
              )}

              {/* TOTAL BEFORE PAYMENT */}
              <div
                style={{
                  marginTop: 20,
                  padding: '16px 0',
                  borderTop:
                    '1px solid var(--border)',
                  borderBottom:
                    '1px solid var(--border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>
                  Amount to Pay
                </span>

                <strong
                  style={{
                    fontSize: 20,
                  }}
                >
                  {inr(grand)}
                </strong>
              </div>

              <div className="checkout-nav">
                <button
                  className="btn btn-dark"
                  onClick={() => setStep(3)}
                  disabled={placing}
                >
                  <ArrowLeft size={15} />
                  Back
                </button>

                <button
                  className="btn btn-gold"
                  onClick={placeOrder}
                  disabled={placing}
                >
                  {placing ? (
                    <>
                      <Loader2
                        size={16}
                        className="spin"
                      />

                      {payment === 'online'
                        ? 'Opening Payment...'
                        : 'Placing Order...'}
                    </>
                  ) : payment === 'online' ? (
                    <>
                      <Lock size={15} />
                      Pay Now · {inr(grand)}
                    </>
                  ) : (
                    <>
                      <Lock size={15} />
                      Place Order · {inr(grand)}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* =====================================================
            STICKY SUMMARY
        ===================================================== */}
        <aside className="co-side">
          <h4>
            SUMMARY
          </h4>

          <div className="co-side-row">
            <span>
              Items
            </span>

            <b>
              {itemCount}
            </b>
          </div>

          <div className="co-side-row">
            <span>
              Subtotal
            </span>

            <b>
              {inr(counts.subtotal)}
            </b>
          </div>

          {couponDiscount > 0 && (
            <div className="co-side-row save">
              <span>
                Coupon
              </span>

              <b>
                − {inr(couponDiscount)}
              </b>
            </div>
          )}

          <div className="co-side-row">
            <span>
              Shipping
            </span>

            <b>
              {shipping.cost === 0
                ? 'FREE'
                : inr(shipping.cost)}
            </b>
          </div>

          <div className="co-side-total">
            <span>
              Total
            </span>

            <b>
              {inr(grand)}
            </b>
          </div>

          {/* COUPON */}
          <div className="co-coupon">
            <input
              className="input"
              placeholder="Coupon code"
              value={coupon}
              onChange={(event) =>
                setCoupon(event.target.value)
              }
            />

            <button
              className="btn btn-dark btn-sm"
              onClick={applyCoupon}
              disabled={placing}
            >
              {applied
                ? 'Applied ✓'
                : 'Apply'}
            </button>
          </div>

          <p className="co-coupon-hint">
            Try WELCOME10 or FIRST15
          </p>

          <p className="co-secure">
            <Lock size={13} />
            100% secure · Data is never shared
          </p>
        </aside>
      </div>
    </>
  );
}