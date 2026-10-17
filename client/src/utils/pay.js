import api from '../api/client';

function loadRazorpay() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => reject(new Error('Could not load the payment window. Check your connection.'));
    document.body.appendChild(s);
  });
}

/** Resolves with the paid order, or rejects with an Error whose message is safe to show. */
export async function payOrder(order, user) {
  const { data: p } = await api.post('/payment/create', { orderId: order._id });

  if (p.demo) {
    const { data } = await api.post('/payment/verify', { orderId: order._id, demo: true });
    return data;
  }

  await loadRazorpay();
  return new Promise((resolve, reject) => {
    const rz = new window.Razorpay({
      key: p.keyId,
      amount: p.amount,
      currency: p.currency,
      order_id: p.razorpayOrderId,
      name: 'Atelier',
      description: `Order ${order._id.slice(-6)}`,
      prefill: { name: user?.name, email: user?.email, contact: order.shippingAddress?.phone },
      theme: { color: '#c9a45c' },
      handler: async (resp) => {
        try {
          const { data } = await api.post('/payment/verify', { orderId: order._id, ...resp });
          resolve(data);
        } catch (e) {
          reject(new Error(e?.response?.data?.message || 'We could not confirm your payment.'));
        }
      },
      modal: { ondismiss: () => reject(new Error('Payment was not completed. You can pay from My orders.')) },
    });
    rz.on('payment.failed', (r) => reject(new Error(r?.error?.description || 'Payment failed')));
    rz.open();
  });
}
