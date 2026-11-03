"use strict";
/**
 * @module @sard-cms/db-sqlcipher/payload-adapter
 * Payload 3 Database Adapter implementation over SQLCipher pool
 * Implements Payload's DatabaseAdapter contract
 */
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayloadSQLCipherAdapter = void 0;
exports.createPayloadAdapter = createPayloadAdapter;
var pool_js_1 = require("./pool.js");
var PayloadSQLCipherAdapter = /** @class */ (function () {
    function PayloadSQLCipherAdapter() {
        this.pool = null;
        this.config = null;
    }
    PayloadSQLCipherAdapter.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var encryptionKey, keyFile, databasePath, key, fs;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.pool)
                            return [2 /*return*/];
                        encryptionKey = process.env.SARD_DB_KEY;
                        keyFile = process.env.SARD_DB_KEY_FILE;
                        databasePath = (_a = process.env.SARD_DB_PATH) !== null && _a !== void 0 ? _a : './data/sard';
                        if (!encryptionKey && !keyFile) {
                            throw new Error('SARD_DB_KEY or SARD_DB_KEY_FILE environment variable required (AC-11)');
                        }
                        key = encryptionKey;
                        if (!(!key && keyFile)) return [3 /*break*/, 2];
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('node:fs'); })];
                    case 1:
                        fs = _b.sent();
                        key = fs.readFileSync(keyFile, 'utf8').trim();
                        _b.label = 2;
                    case 2:
                        if (!key || key.length !== 64) {
                            throw new Error('Encryption key must be 32 bytes (64 hex chars)');
                        }
                        this.config = {
                            databasePath: databasePath,
                            encryptionKey: key,
                            poolSize: 1, // Single writer for SQLite
                            queueMaxSize: 50,
                            pragmas: {
                                journal_mode: 'WAL',
                                synchronous: 'NORMAL',
                                foreign_keys: 'ON',
                                busy_timeout: '5000'
                            }
                        };
                        this.pool = (0, pool_js_1.createSQLCipherPool)(this.config);
                        return [4 /*yield*/, this.pool.initialize(this.config)];
                    case 3:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PayloadSQLCipherAdapter.prototype.disconnect = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.pool) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.pool.close()];
                    case 1:
                        _a.sent();
                        this.pool = null;
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    PayloadSQLCipherAdapter.prototype.execute = function (sql_1) {
        return __awaiter(this, arguments, void 0, function (sql, params) {
            var result;
            if (params === void 0) { params = []; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.pool)
                            throw new Error('Not connected');
                        return [4 /*yield*/, this.pool.exec(sql, params)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, {
                                rows: result.rows,
                                affectedRows: result.rowCount,
                                insertId: undefined // SQLite doesn't easily return insertId without RETURNING
                            }];
                }
            });
        });
    };
    PayloadSQLCipherAdapter.prototype.query = function (sql_1) {
        return __awaiter(this, arguments, void 0, function (sql, params) {
            var result;
            if (params === void 0) { params = []; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.pool)
                            throw new Error('Not connected');
                        return [4 /*yield*/, this.pool.query(sql, params)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, { rows: result.rows }];
                }
            });
        });
    };
    PayloadSQLCipherAdapter.prototype.transaction = function (callback) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                if (!this.pool)
                    throw new Error('Not connected');
                return [2 /*return*/, this.pool.transaction(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                        var payloadTx;
                        var _this = this;
                        return __generator(this, function (_a) {
                            payloadTx = {
                                execute: function (sql_1) {
                                    var args_1 = [];
                                    for (var _i = 1; _i < arguments.length; _i++) {
                                        args_1[_i - 1] = arguments[_i];
                                    }
                                    return __awaiter(_this, __spreadArray([sql_1], args_1, true), void 0, function (sql, params) {
                                        var result;
                                        if (params === void 0) { params = []; }
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0: return [4 /*yield*/, tx.exec(sql, params)];
                                                case 1:
                                                    result = _a.sent();
                                                    return [2 /*return*/, { rows: result.rows, affectedRows: result.rowCount, insertId: undefined }];
                                            }
                                        });
                                    });
                                },
                                query: function (sql_1) {
                                    var args_1 = [];
                                    for (var _i = 1; _i < arguments.length; _i++) {
                                        args_1[_i - 1] = arguments[_i];
                                    }
                                    return __awaiter(_this, __spreadArray([sql_1], args_1, true), void 0, function (sql, params) {
                                        var result;
                                        if (params === void 0) { params = []; }
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0: return [4 /*yield*/, tx.query(sql, params)];
                                                case 1:
                                                    result = _a.sent();
                                                    return [2 /*return*/, { rows: result.rows }];
                                            }
                                        });
                                    });
                                }
                            };
                            return [2 /*return*/, callback(payloadTx)];
                        });
                    }); })];
            });
        });
    };
    PayloadSQLCipherAdapter.prototype.createMigrationTable = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.execute("\n      CREATE TABLE IF NOT EXISTS ", _migrations(templateObject_1 || (templateObject_1 = __makeTemplateObject([" (\n        "], [" (\n        "]))), name(templateObject_2 || (templateObject_2 = __makeTemplateObject([" TEXT PRIMARY KEY,\n        "], [" TEXT PRIMARY KEY,\n        "]))), executed_at(templateObject_3 || (templateObject_3 = __makeTemplateObject([" INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))\n      )\n    "], [" INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))\n      )\n    "]))))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PayloadSQLCipherAdapter.prototype.getExecutedMigrations = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.query('SELECT `name` FROM `_migrations` ORDER BY `executed_at`')];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.rows.map(function (r) { return r[0]; })];
                }
            });
        });
    };
    PayloadSQLCipherAdapter.prototype.executeMigration = function (sql) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.execute(sql)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return PayloadSQLCipherAdapter;
}());
exports.PayloadSQLCipherAdapter = PayloadSQLCipherAdapter;
function createPayloadAdapter(config) {
    return new PayloadSQLCipherAdapter();
}
var templateObject_1, templateObject_2, templateObject_3;

