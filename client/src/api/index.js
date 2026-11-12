// Switched to real Express API connecting to Neon DB PostgreSQL.
// Data is stored directly in Neon DB.

import * as real from './endpoints';

export const USE_MOCK = false;

export const api = real;
export { ApiError, setAuthToken, onUnauthorized, API_URL } from './client';

export default api;
