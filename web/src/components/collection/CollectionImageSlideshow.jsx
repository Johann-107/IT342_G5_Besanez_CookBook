import { useState, useEffect } from 'react';
import styles from '../../styles/CollectionImageSlideshow.module.css';

/**
 * Infinite image slideshow that fills its positioned parent.
 *
 * Props:
 *   images        {string[]}  — image URLs; nulls/blanks are filtered out
 *   interval      {number}    — ms between slides (default 3 000)
 *   overlay       {boolean}   — apply a dark scrim (default true)
 *   overlayVariant {'default'|'strong'} — scrim intensity (default 'default')
 *   fallback      {ReactNode} — rendered when no valid images exist
 */
const CollectionImageSlideshow = ({
    images = [],
    interval = 3000,
    overlay = true,
    overlayVariant = 'default',
    fallback = null,
}) => {
    const valid = (images || []).filter(Boolean);

    const [idx, setIdx] = useState(0);
    const [prevIdx, setPrevIdx] = useState(null);

    // Auto-advance
    useEffect(() => {
        if (valid.length <= 1) return;
        const id = setInterval(() => {
            setIdx(cur => {
                setPrevIdx(cur);
                return (cur + 1) % valid.length;
            });
        }, interval);
        return () => clearInterval(id);
    }, [valid.length, interval]);

    // Remove the exiting slide after its animation completes
    useEffect(() => {
        if (prevIdx === null) return;
        const id = setTimeout(() => setPrevIdx(null), 700);
        return () => clearTimeout(id);
    }, [prevIdx]);

    if (valid.length === 0) return fallback ?? null;

    const safeIdx = idx % valid.length;
    const safePrevIdx = prevIdx !== null ? prevIdx % valid.length : null;

    return (
        <div className={styles.wrap}>
            {/* Exiting image */}
            {safePrevIdx !== null && (
                <img
                    src={valid[safePrevIdx]}
                    className={`${styles.img} ${styles.exit}`}
                    alt=""
                    aria-hidden="true"
                    draggable={false}
                />
            )}

            {/* Entering / current image — key change forces animation replay */}
            <img
                key={safeIdx}
                src={valid[safeIdx]}
                className={`${styles.img} ${safePrevIdx !== null ? styles.enter : ''}`}
                alt=""
                aria-hidden="true"
                draggable={false}
            />

            {overlay && (
                <div
                    className={
                        overlayVariant === 'strong'
                            ? styles.overlayStrong
                            : styles.overlay
                    }
                />
            )}
        </div>
    );
};

export default CollectionImageSlideshow;