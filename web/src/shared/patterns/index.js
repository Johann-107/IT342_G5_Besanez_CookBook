/**
 * patterns/index.js
 *
 * Barrel export for all applied design pattern implementations.
 *
 * Patterns included:
 *   Factory Method  — APIClientFactory
 *   Facade          — CookbookFacade
 *   Observer        — AuthEventEmitter
 *   Decorator       — ComponentDecorators (withErrorBoundary)
 *   Strategy        — ImageUploadStrategy
 *
 * Note: RecipeBuilder is intentionally excluded from active use.
 * It is retained in the file system for reference but not applied
 * — only one component does edit-mode mapping, which doesn't
 * justify the abstraction at current scale.
 */

export { default as CookbookFacade } from './CookbookFacade';
export {
    default as APIClientFactory,
    authenticatedClient,
    publicClient,
    multipartClient
} from './APIClientFactory';
export { default as AuthEvents, AUTH_EVENTS } from './AuthEventEmitter';
export { withErrorBoundary } from './ComponentDecorators';
export {
    ImageUploadContext,
    CloudinaryStrategy,
    URLStrategy,
    IMAGE_STRATEGIES,
} from './ImageUploadStrategy';