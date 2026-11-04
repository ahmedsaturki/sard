"use strict";
/**
 * @module @sard-cms/db-sqlcipher/pool
 * Worker thread pool for SQLCipher WASM - non-blocking async queue
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
exports.SQLCipherPool = void 0;
exports.createSQLCipherPool = createSQLCipherPool;
var node_worker_threads_1 = require("node:worker_threads");
var node_crypto_1 = require("node:crypto");
var node_url_1 = require("node:url");
var node_path_1 = require("node:path");
var __filename = (0, node_url_1.fileURLToPath)(import.meta.url);
var __dirname = (0, node_path_1.dirname)(__filename);
var SQLCipherPool = /** @class */ (function () {
    function SQLCipherPool() {
        this.workers = [];
        this.config = null;
        this.nextWorker = 0;
        this.closed = false;
    }
    SQLCipherPool.prototype.initialize = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            var poolSize, workerPath, _loop_1, this_1, i;
            var _this = this;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.config)
                            throw new Error('Pool already initialized');
                        this.config = config;
                        poolSize = (_a = config.poolSize) !== null && _a !== void 0 ? _a : 1;
                        workerPath = (0, node_path_1.join)(__dirname, 'worker.js');
                        _loop_1 = function (i) {
                            var worker;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        worker = new node_worker_threads_1.Worker(workerPath, {
                                            workerData: { databasePath: config.databasePath, encryptionKey: config.encryptionKey },
                                            env: __assign(__assign({}, process.env), { NODE_OPTIONS: '--max-old-space-size=128' })
                                        });
                                        return [4 /*yield*/, new Promise(function (resolve, reject) {
                                                var timeout = setTimeout(function () { return reject(new Error('Worker init timeout')); }, 10000);
                                                worker.once('message', function (msg) {
                                                    if ((msg === null || msg === void 0 ? void 0 : msg.type) === 'ready') {
                                                        clearTimeout(timeout);
                                                        resolve();
                                                    }
                                                });
                                                worker.once('error', function (err) { clearTimeout(timeout); reject(err); });
                                            })];
                                    case 1:
                                        _c.sent();
                                        this_1.workers.push({
                                            worker: worker,
                                            busy: false,
                                            queue: []
                                        });
                                        worker.on('message', function (response) {
                                            var w = _this.workers.find(function (w) { return w.worker === worker; });
                                            if (w && w.queue.length > 0) {
                                                var resolve = w.queue.shift().resolve;
                                                w.busy = w.queue.length > 0;
                                                resolve(response);
                                            }
                                        });
                                        worker.on('error', function (err) {
                                            var w = _this.workers.find(function (w) { return w.worker === worker; });
                                            if (w) {
                                                for (var _i = 0, _a = w.queue; _i < _a.length; _i++) {
                                                    var item = _a[_i];
                                                    item.reject(err);
                                                }
                                                w.queue = [];
                                                w.busy = false;
                                            }
                                        });
                                        return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        i = 0;
                        _b.label = 1;
                    case 1:
                        if (!(i < poolSize)) return [3 /*break*/, 4];
                        return [5 /*yield**/, _loop_1(i)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    SQLCipherPool.prototype.acquire = function () {
        var _a;
        if (this.closed)
            throw new Error('Pool closed');
        if (this.workers.length === 0)
            throw new Error('Pool not initialized');
        // Round-robin with queue depth check
        var attempts = 0;
        while (attempts < this.workers.length) {
            var idx = this.nextWorker++ % this.workers.length;
            var w = this.workers[idx];
            if (!w.busy || ((_a = this.config.queueMaxSize) !== null && _a !== void 0 ? _a : 100) > w.queue.length) {
                return w;
            }
            attempts++;
        }
        // All busy - return least busy
        return this.workers.reduce(function (a, b) { return a.queue.length < b.queue.length ? a : b; });
    };
    SQLCipherPool.prototype.send = function (msg) {
        var w = this.acquire();
        return new Promise(function (resolve, reject) {
            w.queue.push({ msg: msg, resolve: resolve, reject: reject });
            w.busy = true;
            w.worker.postMessage(msg);
        });
    };
    SQLCipherPool.prototype.exec = function (sql_1) {
        return __awaiter(this, arguments, void 0, function (sql, params) {
            var response;
            var _a, _b;
            if (params === void 0) { params = []; }
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.send({ id: (0, node_crypto_1.randomUUID)(), type: 'exec', sql: sql, params: params })];
                    case 1:
                        response = _c.sent();
                        if (!response.success)
                            throw new Error(response.error);
                        return [2 /*return*/, { rows: (_a = response.rows) !== null && _a !== void 0 ? _a : [], rowCount: (_b = response.rowCount) !== null && _b !== void 0 ? _b : 0 }];
                }
            });
        });
    };
    SQLCipherPool.prototype.query = function (sql_1) {
        return __awaiter(this, arguments, void 0, function (sql, params) {
            if (params === void 0) { params = []; }
            return __generator(this, function (_a) {
                return [2 /*return*/, this.exec(sql, params)];
            });
        });
    };
    SQLCipherPool.prototype.transaction = function (fn) {
        return __awaiter(this, void 0, void 0, function () {
            var w, statements, tx, result, response;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        w = this.workers[0];
                        statements = [];
                        tx = {
                            exec: function (sql_1) {
                                var args_1 = [];
                                for (var _i = 1; _i < arguments.length; _i++) {
                                    args_1[_i - 1] = arguments[_i];
                                }
                                return __awaiter(_this, __spreadArray([sql_1], args_1, true), void 0, function (sql, params) {
                                    if (params === void 0) { params = []; }
                                    return __generator(this, function (_a) {
                                        statements.push({ sql: sql, params: params });
                                        return [2 /*return*/, { rows: [], rowCount: 0, changes: 0 }];
                                    });
                                });
                            },
                            query: function (sql_1) {
                                var args_1 = [];
                                for (var _i = 1; _i < arguments.length; _i++) {
                                    args_1[_i - 1] = arguments[_i];
                                }
                                return __awaiter(_this, __spreadArray([sql_1], args_1, true), void 0, function (sql, params) {
                                    if (params === void 0) { params = []; }
                                    return __generator(this, function (_a) {
                                        statements.push({ sql: sql, params: params });
                                        return [2 /*return*/, { rows: [], rowCount: 0 }];
                                    });
                                });
                            }
                        };
                        return [4 /*yield*/, fn(tx)];
                    case 1:
                        result = _a.sent();
                        return [4 /*yield*/, this.send({
                                id: (0, node_crypto_1.randomUUID)(),
                                type: 'transaction',
                                statements: statements
                            })];
                    case 2:
                        response = _a.sent();
                        if (!response.success)
                            throw new Error(response.error);
                        return [2 /*return*/, result];
                }
            });
        });
    };
    SQLCipherPool.prototype.close = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, w;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.closed = true;
                        _i = 0, _a = this.workers;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        w = _a[_i];
                        w.worker.postMessage({ id: (0, node_crypto_1.randomUUID)(), type: 'close' });
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 100); })];
                    case 2:
                        _b.sent();
                        w.worker.terminate();
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        this.workers = [];
                        return [2 /*return*/];
                }
            });
        });
    };
    SQLCipherPool.prototype.healthCheck = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.send({ id: (0, node_crypto_1.randomUUID)(), type: 'health' })];
                    case 1:
                        response = _b.sent();
                        return [2 /*return*/, response.success];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return SQLCipherPool;
}());
exports.SQLCipherPool = SQLCipherPool;
function createSQLCipherPool(config) {
    return new SQLCipherPool();
}

