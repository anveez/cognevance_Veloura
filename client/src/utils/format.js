export const inr = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

export const dateShort = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export const STATUS_LABEL = {
  pending: 'Awaiting payment',
  processing: 'Preparing',
  shipped: 'On the way',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};
