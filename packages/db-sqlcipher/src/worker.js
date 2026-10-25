"use strict";
/**
 * @module @sard/db-sqlcipher/worker
 * SQLCipher WASM worker - runs in worker thread, executes encrypted SQLite
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
var node_worker_threads_1 = require("node:worker_threads");
var client_1 = require("@libsql/client");
var libsql_1 = require("drizzle-orm/libsql");
var schema = require("@sard/db");
if (!node_worker_threads_1.parentPort) {
    throw new Error('SQLCipher worker must be run as a worker thread');
}
var _a = node_worker_threads_1.workerData, databasePath = _a.databasePath, encryptionKey = _a.encryptionKey;
var client = null;
var db = null;
function initialize() {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    client = (0, client_1.createClient)({
                        url: "file:".concat(databasePath),
                        encryptionKey: encryptionKey,
                    });
                    // Apply PRAGMAs
                    return [4 /*yield*/, client.execute('PRAGMA journal_mode = WAL;')];
                case 1:
                    // Apply PRAGMAs
                    _a.sent();
                    return [4 /*yield*/, client.execute('PRAGMA synchronous = NORMAL;')];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, client.execute('PRAGMA foreign_keys = ON;')];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, client.execute('PRAGMA busy_timeout = 5000;')];
                case 4:
                    _a.sent();
                    db = (0, libsql_1.drizzle)(client, { schema: schema });
                    return [4 /*yield*/, client.execute('SELECT 1 as test')];
                case 5:
                    result = _a.sent();
                    if (!result.rows || result.rows.length !== 1) {
                        throw new Error('Database initialization failed');
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function execute(sql_1) {
    return __awaiter(this, arguments, void 0, function (sql, params) {
        var result, error_1;
        var _a, _b;
        if (params === void 0) { params = []; }
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!client)
                        throw new Error('Client not initialized');
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, client.execute({ sql: sql, args: params })];
                case 2:
                    result = _c.sent();
                    return [2 /*return*/, {
                            id: '',
                            success: true,
                            rows: result.rows,
                            rowCount: result.rows.length,
                            changes: (_a = result.changes) !== null && _a !== void 0 ? _a : 0,
                            lastInsertRowid: (_b = result.lastInsertRowid) !== null && _b !== void 0 ? _b : 0,
                        }];
                case 3:
                    error_1 = _c.sent();
                    return [2 /*return*/, {
                            id: '',
                            success: false,
                            error: error_1 instanceof Error ? error_1.message : String(error_1),
                        }];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function transaction(statements) {
    return __awaiter(this, void 0, void 0, function () {
        var error_2;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!client)
                        throw new Error('Client not initialized');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, client.transaction(function (txClient) { return __awaiter(_this, void 0, void 0, function () {
                            var _i, statements_1, stmt;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _i = 0, statements_1 = statements;
                                        _a.label = 1;
                                    case 1:
                                        if (!(_i < statements_1.length)) return [3 /*break*/, 4];
                                        stmt = statements_1[_i];
                                        return [4 /*yield*/, txClient.execute({ sql: stmt.sql, args: stmt.params })];
                                    case 2:
                                        _a.sent();
                                        _a.label = 3;
                                    case 3:
                                        _i++;
                                        return [3 /*break*/, 1];
                                    case 4: return [2 /*return*/, {
                                            id: '',
                                            success: true,
                                            rowCount: statements.length,
                                        }];
                                }
                            });
                        }); })];
                case 2: return [2 /*return*/, _a.sent()];
                case 3:
                    error_2 = _a.sent();
                    return [2 /*return*/, {
                            id: '',
                            success: false,
                            error: error_2 instanceof Error ? error_2.message : String(error_2),
                        }];
                case 4: return [2 /*return*/];
            }
        });
    });
}
node_worker_threads_1.parentPort.on('message', function (msg) { return __awaiter(void 0, void 0, void 0, function () {
    var response, _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, error_3;
    var _l, _m, _o;
    return __generator(this, function (_p) {
        switch (_p.label) {
            case 0:
                response = { id: msg.id, success: false };
                _p.label = 1;
            case 1:
                _p.trys.push([1, 14, , 15]);
                _a = msg.type;
                switch (_a) {
                    case 'exec': return [3 /*break*/, 2];
                    case 'query': return [3 /*break*/, 4];
                    case 'transaction': return [3 /*break*/, 6];
                    case 'health': return [3 /*break*/, 8];
                    case 'close': return [3 /*break*/, 9];
                }
                return [3 /*break*/, 12];
            case 2:
                if (!msg.sql)
                    throw new Error('SQL required for exec');
                _c = (_b = Object).assign;
                _d = [response];
                return [4 /*yield*/, execute(msg.sql, (_l = msg.params) !== null && _l !== void 0 ? _l : [])];
            case 3:
                _c.apply(_b, _d.concat([_p.sent()]));
                return [3 /*break*/, 13];
            case 4:
                if (!msg.sql)
                    throw new Error('SQL required for query');
                _f = (_e = Object).assign;
                _g = [response];
                return [4 /*yield*/, execute(msg.sql, (_m = msg.params) !== null && _m !== void 0 ? _m : [])];
            case 5:
                _f.apply(_e, _g.concat([_p.sent()]));
                return [3 /*break*/, 13];
            case 6:
                if (!((_o = msg.statements) === null || _o === void 0 ? void 0 : _o.length))
                    throw new Error('Statements required for transaction');
                _j = (_h = Object).assign;
                _k = [response];
                return [4 /*yield*/, transaction(msg.statements)];
            case 7:
                _j.apply(_h, _k.concat([_p.sent()]));
                return [3 /*break*/, 13];
            case 8:
                response.success = true;
                response.rowCount = 1;
                return [3 /*break*/, 13];
            case 9:
                if (!client) return [3 /*break*/, 11];
                return [4 /*yield*/, client.close()];
            case 10:
                _p.sent();
                client = null;
                db = null;
                _p.label = 11;
            case 11:
                response.success = true;
                return [3 /*break*/, 13];
            case 12:
                response.error = "Unknown message type: ".concat(msg.type);
                _p.label = 13;
            case 13: return [3 /*break*/, 15];
            case 14:
                error_3 = _p.sent();
                response.error = error_3 instanceof Error ? error_3.message : String(error_3);
                return [3 /*break*/, 15];
            case 15:
                node_worker_threads_1.parentPort.postMessage(response);
                return [2 /*return*/];
        }
    });
}); });
// Initialize on startup
initialize().catch(function (err) {
    console.error('[SQLCipher Worker] Initialization failed:', err);
    process.exit(1);
});
node_worker_threads_1.parentPort.postMessage({ type: 'ready' });
