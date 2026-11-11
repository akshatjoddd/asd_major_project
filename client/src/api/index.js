// One switch for the whole API surface: env VITE_USE_MOCK (default true) picks the
// in-browser mock so the UI runs without a backend. Set it to "false" for Express.

import * as real from './endpoints';
import * as mock from './mockApi';

export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

export const api = USE_MOCK ? mock : real;
export { ApiError, setAuthToken, onUnauthorized, API_URL } from './client';

export default api;
