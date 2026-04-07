import React, { Component } from 'react';

/**
 * @param {React.ComponentType} WrappedComponent
 * @param {{
 *   loadingEmoji?: string,
 *   loadingText?: string,
 *   errorText?: string,
 * }} options
 */
export function withLoadingState(WrappedComponent, options = {}) {
    const {
        loadingEmoji = '🍳',
        loadingText = 'Loading…',
    } = options;

    function WithLoadingState({ loading, error, data, ...rest }) {
        if (loading) {
            return (
                <div style={styles.center}>
                    <div style={styles.emoji}>{loadingEmoji}</div>
                    <p style={styles.text}>{loadingText}</p>
                </div>
            );
        }

        if (error) {
            return (
                <div style={styles.center}>
                    <div style={styles.emoji}>😕</div>
                    <p style={{ ...styles.text, color: '#E05555' }}>{error}</p>
                </div>
            );
        }

        return <WrappedComponent data={data} {...rest} />;
    }

    WithLoadingState.displayName = `withLoadingState(${WrappedComponent.displayName || WrappedComponent.name})`;
    return WithLoadingState;
}

/**
 * @param {React.ComponentType} WrappedComponent
 */
export function withErrorBoundary(WrappedComponent) {
    class ErrorBoundary extends Component {
        constructor(props) {
            super(props);
            this.state = { hasError: false, message: '' };
        }

        static getDerivedStateFromError(error) {
            return { hasError: true, message: error.message };
        }

        componentDidCatch(error, info) {
            console.error('ErrorBoundary caught:', error, info);
        }

        render() {
            if (this.state.hasError) {
                return (
                    <div style={{ ...styles.center, padding: '60px 24px' }}>
                        <div style={styles.emoji}>⚠️</div>
                        <p style={{ ...styles.text, fontWeight: 600 }}>Something went wrong</p>
                        <p style={{ ...styles.text, fontSize: '0.85rem', opacity: 0.7 }}>
                            {this.state.message || 'An unexpected error occurred.'}
                        </p>
                        <button
                            style={styles.retryBtn}
                            onClick={() => this.setState({ hasError: false, message: '' })}
                        >
                            Try again
                        </button>
                    </div>
                );
            }

            return <WrappedComponent {...this.props} />;
        }
    }

    ErrorBoundary.displayName = `withErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`;
    return ErrorBoundary;
}

const styles = {
    center: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 24px',
        gap: '12px',
        minHeight: '300px',
        fontFamily: "'DM Sans', sans-serif",
    },
    emoji: {
        fontSize: '3.5rem',
    },
    text: {
        fontSize: '0.9rem',
        color: 'var(--text-light, #B09080)',
        textAlign: 'center',
        margin: 0,
    },
    retryBtn: {
        marginTop: '8px',
        background: 'var(--peach-light, #FAE3CC)',
        color: 'var(--terracotta-dark, #A05E33)',
        border: 'none',
        borderRadius: '10px',
        padding: '8px 18px',
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 600,
        fontSize: '0.875rem',
        cursor: 'pointer',
    },
};