"use strict";
/**
 * @module @sard/db-sqlcipher/__tests__/pool.test
 * TDD tests for SQLCipher worker pool
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var vitest_1 = require("vitest");
var pool_js_1 = require("../src/pool.js");
var node_url_1 = require("node:url");
var node_path_1 = require("node:path");
var __filename = (0, node_url_1.fileURLToPath)(import.meta.url);
var __dirname = (0, node_path_1.dirname)(__filename);
var TEST_DB = (0, node_path_1.join)(__dirname, '..', '..', 'test-sqlcipher.db');
var TEST_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
(0, vitest_1.describe)('SQLCipherPool', function () {
    var pool;
    var config = {
        databasePath: TEST_DB,
        encryptionKey: TEST_KEY,
        poolSize: 1,
        queueMaxSize: 10
    };
    (0, vitest_1.beforeAll)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var fs, _i, _a, ext;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('node:fs'); })];
                case 1:
                    fs = _b.sent();
                    for (_i = 0, _a = ['', '-wal', '-shm']; _i < _a.length; _i++) {
                        ext = _a[_i];
                        try {
                            fs.unlinkSync(TEST_DB + ext);
                        }
                        catch (_c) { }
                    }
                    pool = (0, pool_js_1.createSQLCipherPool)(config);
                    return [4 /*yield*/, pool.initialize(config)];
                case 2:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.afterAll)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var fs, _i, _a, ext;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!pool) return [3 /*break*/, 2];
                    return [4 /*yield*/, pool.close()];
                case 1:
                    _b.sent();
                    _b.label = 2;
                case 2: return [4 /*yield*/, Promise.resolve().then(function () { return require('node:fs'); })];
                case 3:
                    fs = _b.sent();
                    for (_i = 0, _a = ['', '-wal', '-shm']; _i < _a.length; _i++) {
                        ext = _a[_i];
                        try {
                            fs.unlinkSync(TEST_DB + ext);
                        }
                        catch (_c) { }
                    }
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('should initialize and health check', function () { return __awaiter(void 0, void 0, void 0, function () {
        var healthy;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, pool.healthCheck()];
                case 1:
                    healthy = _a.sent();
                    (0, vitest_1.expect)(healthy).toBe(true);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('should create table and insert', function () { return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, pool.exec('CREATE TABLE test_table (id INTEGER PRIMARY KEY, name TEXT, value INTEGER)')];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, pool.exec('INSERT INTO test_table (name, value) VALUES (?, ?)', ['test', 42])];
                case 2:
                    result = _a.sent();
                    (0, vitest_1.expect)(result.rowCount).toBe(1);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('should query data', function () { return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, pool.query('SELECT * FROM test_table WHERE name = ?', ['test'])];
                case 1:
                    result = _a.sent();
                    (0, vitest_1.expect)(result.rowCount).toBe(1);
                    (0, vitest_1.expect)(result.rows[0][1]).toBe('test');
                    (0, vitest_1.expect)(result.rows[0][2]).toBe(42);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('should handle concurrent queries', function () { return __awaiter(void 0, void 0, void 0, function () {
        var promises, results, count;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    promises = Array(10).fill(null).map(function (_, i) {
                        return pool.exec('INSERT INTO test_table (name, value) VALUES (?, ?)', ["concurrent-".concat(i), i]);
                    });
                    return [4 /*yield*/, Promise.all(promises)];
                case 1:
                    results = _a.sent();
                    (0, vitest_1.expect)(results.every(function (r) { return r.rowCount === 1; })).toBe(true);
                    return [4 /*yield*/, pool.query('SELECT COUNT(*) as c FROM test_table')];
                case 2:
                    count = _a.sent();
                    (0, vitest_1.expect)(Number(count.rows[0][0])).toBe(11); // 1 + 10
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('should handle transaction', function () { return __awaiter(void 0, void 0, void 0, function () {
        var result, count;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, pool.transaction(function (tx) { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, tx.exec('INSERT INTO test_table (name, value) VALUES (?, ?)', ['tx1', 100])];
                                case 1:
                                    _a.sent();
                                    return [4 /*yield*/, tx.exec('INSERT INTO test_table (name, value) VALUES (?, ?)', ['tx2', 200])];
                                case 2:
                                    _a.sent();
                                    return [2 /*return*/, 'done'];
                            }
                        });
                    }); })];
                case 1:
                    result = _a.sent();
                    (0, vitest_1.expect)(result).toBe('done');
                    return [4 /*yield*/, pool.query('SELECT COUNT(*) as c FROM test_table WHERE name LIKE "tx%"')];
                case 2:
                    count = _a.sent();
                    (0, vitest_1.expect)(Number(count.rows[0][0])).toBe(2);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('should rollback transaction on error', function () { return __awaiter(void 0, void 0, void 0, function () {
        var count;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, vitest_1.expect)(pool.transaction(function (tx) { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, tx.exec('INSERT INTO test_table (name, value) VALUES (?, ?)', ['rollback1', 300])];
                                case 1:
                                    _a.sent();
                                    throw new Error('intentional rollback');
                            }
                        });
                    }); })).rejects.toThrow('intentional rollback')];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, pool.query('SELECT COUNT(*) as c FROM test_table WHERE name = "rollback1"')];
                case 2:
                    count = _a.sent();
                    (0, vitest_1.expect)(Number(count.rows[0][0])).toBe(0);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('should produce encrypted file unreadable without key', function () { return __awaiter(void 0, void 0, void 0, function () {
        var fs, content, str;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('node:fs'); })];
                case 1:
                    fs = _a.sent();
                    content = fs.readFileSync(TEST_DB);
                    str = content.toString('utf8', 0, Math.min(1000, content.length));
                    (0, vitest_1.expect)(str).not.toContain('test_table');
                    (0, vitest_1.expect)(str).not.toContain('CREATE TABLE');
                    return [2 /*return*/];
            }
        });
    }); });
});
