/**
 * User-related type definitions
 * @module types/user
 */

/**
 * Represents a user in the application
 */
export interface User {
    /**
     * Unique identifier for the user
     */
    id: string;

    /**
     * User's email address (optional)
     */
    email?: string;

    /**
     * User's display name (optional)
     */
    name?: string;

    /**
     * URL to user's avatar image (optional)
     */
    avatarUrl?: string;

    /**
     * Allows for additional properties not explicitly defined
     */
    [key: string]: any;
}

/**
 * Authentication providers supported by the application
 */
export type AuthProvider = "google" | "apple" | "email";

/**
 * Props for components that need authenticated user information
 */
export interface WithUserProps {
    /**
     * The authenticated user or null if not authenticated
     */
    user: User | null;

    /**
     * Function to call when the user logs out
     */
    onLogout: () => void;
} 
