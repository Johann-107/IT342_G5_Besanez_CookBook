import { useState } from 'react';
import shareAPI from '../services/share';
import styles from '../styles/SharePanel.module.css';

/**
 * SharePanel — shown inside RecipeDetail for the recipe owner.
 *
 * Props:
 *   recipeId   {number}  — the recipe's id
 *   initialToken {string|null} — existing shareToken (from recipe data, if any)
 */
const SharePanel = ({ recipeId, initialToken }) => {
    const [shareToken, setShareToken] = useState(initialToken || null);
    const [shareUrl, setShareUrl] = useState(
        initialToken ? `${window.location.origin}/shared/${initialToken}` : null
    );
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [open, setOpen] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const res = await shareAPI.generateShareToken(recipeId);
            setShareToken(res.data.shareToken);
            setShareUrl(res.data.shareUrl);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to generate share link.');
        } finally {
            setLoading(false);
        }
    };

    const handleRevoke = async () => {
        if (!window.confirm('Disable sharing for this recipe? Anyone with the link will lose access.')) return;
        setLoading(true);
        try {
            await shareAPI.revokeShareToken(recipeId);
            setShareToken(null);
            setShareUrl(null);
            setOpen(false);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to revoke share link.');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2200);
        } catch {
            // Fallback for browsers that block clipboard
            const input = document.createElement('input');
            input.value = shareUrl;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
            setCopied(true);
            setTimeout(() => setCopied(false), 2200);
        }
    };

    return (
        <div className={styles.wrap}>
            <button
                className={`${styles.triggerBtn} ${shareToken ? styles.active : ''}`}
                onClick={() => {
                    if (!shareToken) handleGenerate();
                    else setOpen(o => !o);
                }}
                disabled={loading}
                title={shareToken ? 'Share options' : 'Create share link'}
            >
                <span className={styles.icon}>🔗</span>
                {loading ? 'Generating…' : shareToken ? 'Share' : 'Share'}
            </button>

            {shareToken && open && (
                <div className={styles.panel}>
                    <div className={styles.panelHeader}>
                        <span className={styles.panelTitle}>Share this recipe</span>
                        <button className={styles.closePanel} onClick={() => setOpen(false)}>×</button>
                    </div>

                    <p className={styles.panelDesc}>
                        Anyone with this link can preview and save a copy of your recipe.
                    </p>

                    <div className={styles.urlRow}>
                        <input
                            className={styles.urlInput}
                            value={shareUrl}
                            readOnly
                            onFocus={e => e.target.select()}
                        />
                        <button
                            className={`${styles.copyBtn} ${copied ? styles.copied : ''}`}
                            onClick={handleCopy}
                        >
                            {copied ? '✓ Copied!' : 'Copy'}
                        </button>
                    </div>

                    <div className={styles.panelActions}>
                        <button
                            className={styles.revokeBtn}
                            onClick={handleRevoke}
                            disabled={loading}
                        >
                            🚫 Disable link
                        </button>
                    </div>
                </div>
            )}

            {/* Auto-open panel after generating */}
            {shareToken && !open && (
                <button
                    className={styles.viewLinkBtn}
                    onClick={() => setOpen(true)}
                >
                    View link ↓
                </button>
            )}
        </div>
    );
};

export default SharePanel;