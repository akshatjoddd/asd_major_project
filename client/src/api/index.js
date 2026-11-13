
import * as real from './endpoints';

export const USE_MOCK = false;

export const api = real;
export { ApiError, setAuthToken, onUnauthorized, API_URL } from './client';

export default api;
