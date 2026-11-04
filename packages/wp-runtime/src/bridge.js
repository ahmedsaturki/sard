"use strict";
/**
 * @module @sard-cms/wp-runtime/bridge
 * Bridge API implementation - capability-scoped communication
 * between WP plugins (PHP-WASM) and Sard core
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
exports.createBridge = createBridge;
exports.createPluginManifest = createPluginManifest;
var sandbox_1 = require("@sard-cms/sandbox");
function createBridge(context) {
    var plugin = context.plugin, logger = context.logger;
    function checkCapability(cap) {
        var _a, _b;
        return plugin.capabilities.includes(cap) ||
            plugin.capabilities.includes('*') ||
            ((_b = (_a = plugin.permissions.net) === null || _a === void 0 ? void 0 : _a.domains) === null || _b === void 0 ? void 0 : _b.includes('*'));
    }
    function checkNetwork(domain) {
        var _a, _b;
        var allowlist = (_b = (_a = plugin.permissions.net) === null || _a === void 0 ? void 0 : _a.domains) !== null && _b !== void 0 ? _b : [];
        return allowlist.some(function (d) { return d === '*' || d === domain ||
            (d.startsWith('*.') && domain.endsWith(d.slice(2))); });
    }
    function checkTable(table) {
        var _a, _b;
        var allowlist = (_b = (_a = plugin.permissions.db) === null || _a === void 0 ? void 0 : _a.tables) !== null && _b !== void 0 ? _b : [];
        return allowlist.includes('*') || allowlist.includes(table);
    }
    function checkFS(path, write) {
        var _a, _b;
        if (write === void 0) { write = false; }
        var allowlist = write ? (_a = plugin.permissions.fs) === null || _a === void 0 ? void 0 : _a.write : (_b = plugin.permissions.fs) === null || _b === void 0 ? void 0 : _b.read;
        if (!allowlist)
            return false;
        return allowlist.some(function (p) { return p === '*' || path.startsWith(p.replace('*', '')); });
    }
    var bridge = {
        getPosts: function (query) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    if (!checkCapability(sandbox_1.capabilities.content.read)) {
                        (0, sandbox_1.auditLog)('bridge:getPosts', 'DENIED', { plugin: plugin.name, capability: sandbox_1.capabilities.content.read });
                        throw new Error('Capability denied: content:read');
                    }
                    (0, sandbox_1.auditLog)('bridge:getPosts', 'ALLOWED', { plugin: plugin.name, query: query });
                    // Call Sard API
                    return [2 /*return*/, []];
                });
            });
        },
        getPost: function (id) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    if (!checkCapability(sandbox_1.capabilities.content.read))
                        throw new Error('Capability denied');
                    (0, sandbox_1.auditLog)('bridge:getPost', 'ALLOWED', { plugin: plugin.name, id: id });
                    return [2 /*return*/, null];
                });
            });
        },
        getPages: function (query) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    if (!checkCapability(sandbox_1.capabilities.content.read))
                        throw new Error('Capability denied');
                    return [2 /*return*/, []];
                });
            });
        },
        getPage: function (id) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    if (!checkCapability(sandbox_1.capabilities.content.read))
                        throw new Error('Capability denied');
                    return [2 /*return*/, null];
                });
            });
        },
        getOption: function (name) {
            return __awaiter(this, void 0, void 0, function () {
                var scopedName;
                return __generator(this, function (_a) {
                    scopedName = "".concat(plugin.slug, "_").concat(name);
                    (0, sandbox_1.auditLog)('bridge:getOption', 'ALLOWED', { plugin: plugin.name, option: scopedName });
                    return [2 /*return*/, context.config.get(scopedName)];
                });
            });
        },
        updateOption: function (name, value) {
            return __awaiter(this, void 0, void 0, function () {
                var scopedName;
                return __generator(this, function (_a) {
                    if (!checkCapability(sandbox_1.capabilities.content.write))
                        throw new Error('Capability denied');
                    scopedName = "".concat(plugin.slug, "_").concat(name);
                    (0, sandbox_1.auditLog)('bridge:updateOption', 'ALLOWED', { plugin: plugin.name, option: scopedName });
                    context.config.set(scopedName, value);
                    return [2 /*return*/];
                });
            });
        },
        deleteOption: function (name) {
            return __awaiter(this, void 0, void 0, function () {
                var scopedName;
                return __generator(this, function (_a) {
                    if (!checkCapability(sandbox_1.capabilities.content.write))
                        throw new Error('Capability denied');
                    scopedName = "".concat(plugin.slug, "_").concat(name);
                    (0, sandbox_1.auditLog)('bridge:deleteOption', 'ALLOWED', { plugin: plugin.name, option: scopedName });
                    context.config.set(scopedName, null);
                    return [2 /*return*/];
                });
            });
        },
        query: function (sql, params) {
            return __awaiter(this, void 0, void 0, function () {
                var tables, _i, tables_1, table;
                var _a, _b;
                return __generator(this, function (_c) {
                    if (!checkCapability(sandbox_1.capabilities.db.query))
                        throw new Error('Capability denied');
                    // Validate parameterized query
                    if (!/^\s*select/i.test(sql))
                        throw new Error('Only SELECT allowed');
                    tables = (_b = (_a = sql.match(/from\s+(\w+)/gi)) === null || _a === void 0 ? void 0 : _a.map(function (m) { return m.split(' ')[1]; })) !== null && _b !== void 0 ? _b : [];
                    for (_i = 0, tables_1 = tables; _i < tables_1.length; _i++) {
                        table = tables_1[_i];
                        if (!checkTable(table))
                            throw new Error("Table not allowed: ".concat(table));
                    }
                    (0, sandbox_1.auditLog)('bridge:query', 'ALLOWED', { plugin: plugin.name, sql: sql, tables: tables });
                    // Execute via Sard DB adapter
                    return [2 /*return*/, []];
                });
            });
        },
        execute: function (sql, params) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    if (!checkCapability(sandbox_1.capabilities.db.migrate))
                        throw new Error('Capability denied');
                    throw new Error('Write queries not allowed via bridge');
                });
            });
        },
        enqueueScript: function (handle, src, deps) {
            (0, sandbox_1.auditLog)('bridge:enqueueScript', 'ALLOWED', { plugin: plugin.name, handle: handle, src: src });
            // Store for frontend
        },
        enqueueStyle: function (handle, src, deps) {
            (0, sandbox_1.auditLog)('bridge:enqueueStyle', 'ALLOWED', { plugin: plugin.name, handle: handle, src: src });
        },
        addAdminPage: function (config) {
            if (!checkCapability('admin:page'))
                throw new Error('Capability denied');
            (0, sandbox_1.auditLog)('bridge:addAdminPage', 'ALLOWED', { plugin: plugin.name, slug: config.menu_slug });
        },
        addMetaBox: function (config) {
            if (!checkCapability('admin:metabox'))
                throw new Error('Capability denied');
            (0, sandbox_1.auditLog)('bridge:addMetaBox', 'ALLOWED', { plugin: plugin.name, id: config.id });
        },
        addAction: function (hook, callback, priority) {
            if (!checkCapability('hooks:action'))
                throw new Error('Capability denied');
            (0, sandbox_1.auditLog)('bridge:addAction', 'ALLOWED', { plugin: plugin.name, hook: hook });
        },
        addFilter: function (hook, callback, priority) {
            if (!checkCapability('hooks:filter'))
                throw new Error('Capability denied');
            (0, sandbox_1.auditLog)('bridge:addFilter', 'ALLOWED', { plugin: plugin.name, hook: hook });
        },
        doAction: function (hook) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    (0, sandbox_1.auditLog)('bridge:doAction', 'ALLOWED', { plugin: plugin.name, hook: hook });
                    return [2 /*return*/];
                });
            });
        },
        applyFilters: function (hook, value) {
            var args = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                args[_i - 2] = arguments[_i];
            }
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    (0, sandbox_1.auditLog)('bridge:applyFilters', 'ALLOWED', { plugin: plugin.name, hook: hook });
                    return [2 /*return*/, value];
                });
            });
        }
    };
    return bridge;
}
function createPluginManifest(name, slug, version, capabilities, permissions, entryPoint) {
    return { name: name, version: version, slug: slug, capabilities: capabilities, permissions: permissions, entryPoint: entryPoint };
}

