/**
 * @module @sard/wp-runtime
 * PHP-WASM runtime + Bridge API for WordPress plugin sandbox (L1 WP Compat)
 * 
 * ADR-016: Each WP plugin runs in isolated process with PHP-WASM.
 * Bridge API enforces capability manifest + audit trail.
 */

export * from './types.js';
export { PHPWasmRuntime, createPHPWasmRuntime } from './php-wasm-runtime.js';
export { createBridge, createPluginManifest } from './bridge.js';
