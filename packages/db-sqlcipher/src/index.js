"use strict";
/**
 * @module @sard-cms/db-sqlcipher
 * SQLCipher WASM worker pool + Payload Database Adapter for Sard Lite
 *
 * AC-06: SQLite in production = SQLCipher (AES-256). No exceptions.
 * AC-11: Key only from SARD_DB_KEY env var or SARD_DB_KEY_FILE.
 * HC-07: Pool abstraction, no direct better-sqlite3 usage.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSQLCipherPool = exports.SQLCipherPool = void 0;
__exportStar(require("./types.js"), exports);
var pool_js_1 = require("./pool.js");
Object.defineProperty(exports, "SQLCipherPool", { enumerable: true, get: function () { return pool_js_1.SQLCipherPool; } });
Object.defineProperty(exports, "createSQLCipherPool", { enumerable: true, get: function () { return pool_js_1.createSQLCipherPool; } });

