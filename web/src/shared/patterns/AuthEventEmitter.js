class AuthEventEmitter {
    constructor() {
        /** @type {Map<string, Set<Function>>} */
        this._listeners = new Map();
    }

    /**
     * Subscribe to an event. Returns an unsubscribe function for use in
     * useEffect cleanup.
     *
     * @param {string}   event
     * @param {Function} listener
     * @returns {Function} unsubscribe
     */
    on(event, listener) {
        if (!this._listeners.has(event)) {
            this._listeners.set(event, new Set());
        }
        this._listeners.get(event).add(listener);
        return () => this.off(event, listener);
    }

    /** Subscribe to an event exactly once. */
    once(event, listener) {
        const wrapper = (...args) => {
            listener(...args);
            this.off(event, wrapper);
        };
        return this.on(event, wrapper);
    }

    /** Unsubscribe a listener. */
    off(event, listener) {
        this._listeners.get(event)?.delete(listener);
    }

    /** Emit an event, calling all registered listeners with the payload. */
    emit(event, payload) {
        this._listeners.get(event)?.forEach((listener) => {
            try {
                listener(payload);
            } catch (err) {
                console.error(`AuthEventEmitter: listener error for "${event}"`, err);
            }
        });
    }
}

// Singleton — shared across the entire application
const AuthEvents = new AuthEventEmitter();

export default AuthEvents;

export const AUTH_EVENTS = {
    TOKEN_EXPIRED: 'token:expired',
    USER_LOGIN: 'user:login',
    USER_LOGOUT: 'user:logout',
    USER_UPDATED: 'user:updated',
};