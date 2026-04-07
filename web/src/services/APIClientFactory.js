import axios from 'axios';
import AuthEvents, { AUTH_EVENTS } from '../patterns/AuthEventEmitter';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

function applyAuthInterceptor(instance) {
    instance.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );
    return instance;
}

function applyErrorInterceptor(instance) {
    instance.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                AuthEvents.emit(AUTH_EVENTS.TOKEN_EXPIRED);
            }
            return Promise.reject(error);
        }
    );
    return instance;
}

class APIClientFactory {
    /**
     *
     * @param {'authenticated' | 'public' | 'multipart'} type
     * @returns {import('axios').AxiosInstance}
     */
    static create(type = 'authenticated') {
        switch (type) {
            case 'authenticated': {
                const instance = axios.create({
                    baseURL: API_BASE_URL,
                    headers: { 'Content-Type': 'application/json' },
                });
                applyAuthInterceptor(instance);
                applyErrorInterceptor(instance);
                return instance;
            }

            case 'public': {
                const instance = axios.create({
                    baseURL: API_BASE_URL,
                    headers: { 'Content-Type': 'application/json' },
                });
                return instance;
            }

            case 'multipart': {
                const instance = axios.create({ baseURL: API_BASE_URL });
                applyAuthInterceptor(instance);
                applyErrorInterceptor(instance);
                return instance;
            }

            default:
                throw new Error(`APIClientFactory: unknown client type "${type}"`);
        }
    }
}

const authenticatedClient = APIClientFactory.create('authenticated');
const publicClient = APIClientFactory.create('public');
const multipartClient = APIClientFactory.create('multipart');

export { authenticatedClient, publicClient, multipartClient };
export default APIClientFactory;