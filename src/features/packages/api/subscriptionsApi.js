import axios from '../../../utils/api';

export const getMySubscription = () =>
  axios.get('/subscriptions/me').then((r) => r.data);

export const requestSubscription = (packageId) =>
  axios.post('/subscriptions/request', { packageId }).then((r) => r.data);
