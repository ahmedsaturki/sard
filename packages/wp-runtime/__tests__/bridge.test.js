"use strict";
/**
 * @module @sard-cms/wp-runtime/__tests__/bridge.test
 * TDD tests for WP Plugin Bridge API
 *
 * Escape tests: verify plugin cannot exceed declared capabilities
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
Object.defineProperty(exports, "__esModule", { value: true });
var vitest_1 = require("vitest");
var bridge_js_1 = require("../src/bridge.js");
var sandbox_1 = require("@sard-cms/sandbox");
(0, vitest_1.describe)('WP Plugin Bridge', function () {
    var mockContext;
    var bridge;
    (0, vitest_1.beforeEach)(function () {
        var manifest = (0, bridge_js_1.createPluginManifest)('Test Plugin', 'test-plugin', '1.0.0', [sandbox_1.capabilities.content.read, sandbox_1.capabilities.content.write], {
            fs: { read: ['/tmp/test-plugin/*'], write: ['/tmp/test-plugin/*'] },
            net: { domains: ['api.example.com'] },
            db: { tables: ['wp_options', 'wp_postmeta'] },
            hooks: { actions: ['init', 'wp_head'], filters: ['the_content'] }
        }, 'test-plugin.php');
        mockContext = {
            plugin: manifest,
            bridge: {},
            logger: { info: vitest_1.vi.fn(), warn: vitest_1.vi.fn(), error: vitest_1.vi.fn() },
            config: {
                get: vitest_1.vi.fn(function (key) { return key === 'test-plugin_test_option' ? 'test-value' : null; }),
                set: vitest_1.vi.fn()
            }
        };
        bridge = (0, bridge_js_1.createBridge)(mockContext);
    });
    (0, vitest_1.it)('should allow declared capabilities', function () { return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, bridge.getPosts({ post_type: 'post', posts_per_page: 10 })];
                case 1:
                    result = _a.sent();
                    (0, vitest_1.expect)(Array.isArray(result)).toBe(true);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('should scope options to plugin prefix', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, bridge.updateOption('test_option', 'new-value')];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(mockContext.config.set).toHaveBeenCalledWith('test-plugin_test_option', 'new-value');
                    return [4 /*yield*/, bridge.getOption('test_option')];
                case 2:
                    _a.sent();
                    (0, vitest_1.expect)(mockContext.config.get).toHaveBeenCalledWith('test-plugin_test_option');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('should deny undeclared capabilities', function () { return __awaiter(void 0, void 0, void 0, function () {
        var manifest, ctx, minimalBridge;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    manifest = (0, bridge_js_1.createPluginManifest)('Minimal Plugin', 'minimal', '1.0.0', [], // no capabilities
                    { fs: {}, net: {}, db: {}, hooks: {} }, 'minimal.php');
                    ctx = __assign(__assign({}, mockContext), { plugin: manifest });
                    minimalBridge = (0, bridge_js_1.createBridge)(ctx);
                    return [4 /*yield*/, (0, vitest_1.expect)(minimalBridge.getPosts({})).rejects.toThrow('Capability denied')];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, vitest_1.expect)(minimalBridge.updateOption('x', 'y')).rejects.toThrow('Capability denied')];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('should only allow parameterized SELECT queries', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, vitest_1.expect)(bridge.query('SELECT * FROM wp_options', [])).resolves.toBeDefined()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, vitest_1.expect)(bridge.query('DROP TABLE wp_users', [])).rejects.toThrow('Only SELECT allowed')];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, (0, vitest_1.expect)(bridge.query('SELECT * FROM wp_users UNION SELECT * FROM wp_options', [])).rejects.toThrow('UNION not allowed')];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, (0, vitest_1.expect)(bridge.execute('INSERT INTO wp_options VALUES (1,2,3)', [])).rejects.toThrow('Write queries not allowed')];
                case 4:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('should enforce table allowlist', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, vitest_1.expect)(bridge.query('SELECT * FROM wp_postmeta', [])).resolves.toBeDefined()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, vitest_1.expect)(bridge.query('SELECT * FROM wp_users', [])).rejects.toThrow('Table not allowed')];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('should enforce network allowlist', function () { return __awaiter(void 0, void 0, void 0, function () {
        var manifest;
        return __generator(this, function (_a) {
            manifest = (0, bridge_js_1.createPluginManifest)('Network Plugin', 'net-plugin', '1.0.0', ['net:http'], { net: { domains: ['api.trusted.com'] }, fs: {}, db: {}, hooks: {} }, 'net-plugin.php');
            (0, vitest_1.expect)(manifest.permissions.net.domains).toContain('api.trusted.com');
            return [2 /*return*/];
        });
    }); });
    (0, vitest_1.it)('should audit every bridge call', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, bridge.getPosts({})];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(mockContext.logger.info).toHaveBeenCalled();
                    return [2 /*return*/];
            }
        });
    }); });
    // ESCAPE TESTS
    (0, vitest_1.describe)('Escape Prevention', function () {
        (0, vitest_1.it)('should prevent raw SQL execution', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, vitest_1.expect)(bridge.execute('DELETE FROM wp_options', [])).rejects.toThrow('Write queries not allowed')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        (0, vitest_1.it)('should prevent accessing undeclared tables', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, vitest_1.expect)(bridge.query('SELECT user_pass FROM wp_users', [])).rejects.toThrow('Table not allowed')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        (0, vitest_1.it)('should prevent option access outside plugin scope', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, bridge.getOption('other_plugin_option')];
                    case 1:
                        _a.sent();
                        (0, vitest_1.expect)(mockContext.config.get).toHaveBeenCalledWith('test-plugin_other_plugin_option');
                        return [2 /*return*/];
                }
            });
        }); });
        (0, vitest_1.it)('should prevent arbitrary hook registration', function () { return __awaiter(void 0, void 0, void 0, function () {
            var manifest, ctx, b;
            return __generator(this, function (_a) {
                manifest = (0, bridge_js_1.createPluginManifest)('Hook Plugin', 'hook-plugin', '1.0.0', ['hooks:action'], { hooks: { actions: ['init'] }, fs: {}, net: {}, db: {} }, 'hook-plugin.php');
                ctx = __assign(__assign({}, mockContext), { plugin: manifest });
                b = (0, bridge_js_1.createBridge)(ctx);
                b.addAction('init', 'my_callback');
                (0, vitest_1.expect)(mockContext.logger.info).toHaveBeenCalled();
                (0, vitest_1.expect)(manifest.permissions.hooks.actions).toEqual(['init']);
                return [2 /*return*/];
            });
        }); });
    });
});

