import axios from '../../../utils/api';

export const getMySubscription = () =>
  axios.get('/subscriptions/me').then((r) => r.data);

export const getPaymentCheckout = () =>
  axios.get('/subscriptions/payment-checkout').then((r) => r.data);

export const requestSubscription = (packageId) =>
  axios.post('/subscriptions/request', { packageId }).then((r) => r.data);

export const simulateSubscriptionPayment = () =>
  axios.post('/subscriptions/dev/simulate-payment').then((r) => r.data);
