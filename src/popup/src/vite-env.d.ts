/// <reference types="vite/client" />

/**
 * Type definitions for Vite environment variables
 */
interface ImportMetaEnv {
    /**
     * Supabase URL for authentication
     */
    readonly VITE_SUPABASE_URL: string;

    /**
     * Supabase anonymous key for authentication
     */
    readonly VITE_SUPABASE_ANON_KEY: string;

    /**
     * Application mode (development, production, test)
     */
    readonly MODE: string;

    /**
     * Whether the app is running in development mode
     */
    readonly DEV: boolean;

    /**
     * Whether the app is running in production mode
     */
    readonly PROD: boolean;

    /**
     * Base public path when served in development or production
     */
    readonly BASE_URL: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

/**
 * Type definition for Chrome extension global API
 */
interface Chrome {
    runtime: {
        id?: string;
        lastError?: {
            message: string;
        };
        getManifest(): Record<string, any>;
    };
    storage?: {
        local: {
            get(keys: string | string[] | Record<string, any> | null, callback: (items: Record<string, any>) => void): void;
            set(items: Record<string, any>, callback?: () => void): void;
        };
    };
    identity?: {
        launchWebAuthFlow(options: { url: string; interactive: boolean }, callback: (redirectUrl?: string) => void): void;
    };
}

/**
 * Global Chrome variable available in extensions
 */
declare const chrome: Chrome;
