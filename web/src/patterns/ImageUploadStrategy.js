const CLOUDINARY_CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || '';
const CLOUDINARY_UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || '';
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

// ─── Concrete Strategy 1: Cloudinary file upload ─────────────────────────────

export class CloudinaryStrategy {
    label = 'Upload Photo';
    icon = '📷';

    /**
     * Uploads the selected file directly to Cloudinary from the browser and
     * returns the secure CDN URL. Only the URL is stored in your database —
     * no base64 blobs, no backend file handling needed.
     *
     * @param {{ file: File | null }} state
     * @returns {Promise<string | null>} Cloudinary secure_url or null
     */
    async resolve({ file }) {
        if (!file) return null;

        if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
            throw new Error(
                'Cloudinary is not configured. ' +
                'Set REACT_APP_CLOUDINARY_CLOUD_NAME and REACT_APP_CLOUDINARY_UPLOAD_PRESET in your .env file.'
            );
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        // Optional: organise uploads into a folder
        formData.append('folder', 'cookbook/recipes');

        const response = await fetch(CLOUDINARY_UPLOAD_URL, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error?.message || 'Cloudinary upload failed.');
        }

        const data = await response.json();
        return data.secure_url; // e.g. https://res.cloudinary.com/your_cloud/image/upload/v.../photo.jpg
    }

    validate(file) {
        if (!file) return null;
        if (!file.type?.startsWith('image/')) {
            return 'Please select a valid image file (JPEG, PNG, GIF, WEBP).';
        }
        if (file.size > 10 * 1024 * 1024) {
            return 'Image must be smaller than 10 MB.';
        }
        return null;
    }
}

// ─── Concrete Strategy 2: URL paste ───────────────────────────────────────────

export class URLStrategy {
    label = 'Paste URL';
    icon = '🔗';

    /**
     * Returns the trimmed URL as-is — no upload needed.
     *
     * @param {{ url: string }} state
     * @returns {Promise<string | null>}
     */
    async resolve({ url }) {
        return url?.trim() || null;
    }

    validate(url) {
        if (!url) return null;
        try {
            new URL(url);
            return null;
        } catch {
            return 'Please enter a valid URL (e.g. https://example.com/photo.jpg).';
        }
    }
}

// ─── Strategy Context ─────────────────────────────────────────────────────────

/**
 * ImageUploadContext holds the active strategy and provides a unified API
 * so CreateRecipe.jsx never needs to inspect which strategy is active.
 */
export class ImageUploadContext {
    constructor(strategy = new CloudinaryStrategy()) {
        this._strategy = strategy;
    }

    setStrategy(strategy) {
        this._strategy = strategy;
    }

    get label() { return this._strategy.label; }
    get icon() { return this._strategy.icon; }

    validate(value) {
        return this._strategy.validate(value);
    }

    async resolve(state) {
        return this._strategy.resolve(state);
    }
}

// ─── Available strategies registry ────────────────────────────────────────────

export const IMAGE_STRATEGIES = {
    cloudinary: new CloudinaryStrategy(),
    url: new URLStrategy(),
};