import axios from '../../../utils/api';

export const getPublicPackages = () =>
  axios.get('/packages/public').then((r) => r.data);
