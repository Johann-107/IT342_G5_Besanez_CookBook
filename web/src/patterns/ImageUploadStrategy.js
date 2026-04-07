export class FileUploadStrategy {
    label = 'Upload File';
    icon = '📁';

    /**
     * @param {{ file: File | null }} state
     * @returns {Promise<string | null>}
     */
    async resolve({ file }) {
        if (!file) return null;
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error('Failed to read image file'));
            reader.readAsDataURL(file);
        });
    }

    validate(file) {
        if (!file) return null;
        if (!file.type?.startsWith('image/')) {
            return 'Please select a valid image file (JPEG, PNG, GIF, WEBP).';
        }
        if (file.size > 5 * 1024 * 1024) {
            return 'Image must be smaller than 5 MB.';
        }
        return null;
    }
}

export class URLStrategy {
    label = 'Paste URL';
    icon = '🔗';

    /**
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
            return 'Please enter a valid URL.';
        }
    }
}

export class ImageUploadContext {
    constructor(strategy = new FileUploadStrategy()) {
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

export const IMAGE_STRATEGIES = {
    file: new FileUploadStrategy(),
    url: new URLStrategy(),
};