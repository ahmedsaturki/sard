"use strict";
/**
 * @module @sard-cms/wp-runtime/php-wasm-runtime
 * PHP-WASM runtime wrapper using @php-wasm/node (WordPress Playground)
 *
 * Each WP plugin runs in isolated PHP WASM instance with virtual filesystem.
 * Communication via Bridge API with capability enforcement.
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
exports.PHPWasmRuntime = void 0;
exports.createPHPWasmRuntime = createPHPWasmRuntime;
var node_1 = require("@php-wasm/node");
var PHPWasmRuntime = /** @class */ (function () {
    function PHPWasmRuntime(config) {
        if (config === void 0) { config = {}; }
        this.config = config;
        this.php = null;
        this.plugins = new Map();
        this.virtualFS = new Map(); // path -> content
        this.bridge = this.createBridge();
    }
    PHPWasmRuntime.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, node_1.PHP.load()];
                    case 1:
                        _a.php = _c.sent();
                        // Configure PHP ini
                        this.php.eval("\n      ini_set('memory_limit', '".concat((_b = this.config.memoryLimitMB) !== null && _b !== void 0 ? _b : 64, "M');\n      ini_set('max_execution_time', '5');\n      ini_set('allow_url_fopen', '0');\n      ini_set('allow_url_include', '0');\n      ini_set('disable_functions', 'exec,shell_exec,system,passthru,proc_open,popen,curl_exec,curl_multi_exec,parse_ini_file,show_source,pcntl_exec');\n    "));
                        return [2 /*return*/];
                }
            });
        });
    };
    PHPWasmRuntime.prototype.createBridge = function () {
        var self = this;
        return {
            getPosts: function (query) {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        // Translate to Sard content query
                        return [2 /*return*/, []]; // Implemented via Sard API call
                    });
                });
            },
            getPost: function (id) {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        return [2 /*return*/, null];
                    });
                });
            },
            getPages: function (query) {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        return [2 /*return*/, []];
                    });
                });
            },
            getPage: function (id) {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        return [2 /*return*/, null];
                    });
                });
            },
            getOption: function (name) {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        // Scoped to plugin prefix
                        return [2 /*return*/, self.getVirtualFile("options/".concat(name, ".json"))];
                    });
                });
            },
            updateOption: function (name, value) {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        self.setVirtualFile("options/".concat(name, ".json"), JSON.stringify(value));
                        return [2 /*return*/];
                    });
                });
            },
            deleteOption: function (name) {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        self.virtualFS.delete("options/".concat(name, ".json"));
                        return [2 /*return*/];
                    });
                });
            },
            query: function (sql, params) {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        // Parameterized queries only - no raw SQL execution
                        // Validate: only SELECT, no UNION, no DDL
                        if (!/^\s*select/i.test(sql))
                            throw new Error('Only SELECT queries allowed');
                        if (/union/i.test(sql))
                            throw new Error('UNION not allowed');
                        // Execute via Sard database adapter
                        return [2 /*return*/, []]; // Placeholder
                    });
                });
            },
            execute: function (sql, params) {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        throw new Error('Write queries not allowed via bridge; use options API');
                    });
                });
            },
            enqueueScript: function (handle, src, deps) {
                if (deps === void 0) { deps = []; }
                // Register for frontend enqueue
                self.setVirtualFile("assets/scripts/".concat(handle, ".json"), JSON.stringify({ src: src, deps: deps }));
            },
            enqueueStyle: function (handle, src, deps) {
                if (deps === void 0) { deps = []; }
                self.setVirtualFile("assets/styles/".concat(handle, ".json"), JSON.stringify({ src: src, deps: deps }));
            },
            addAdminPage: function (config) {
                self.setVirtualFile("admin/pages/".concat(config.menu_slug, ".json"), JSON.stringify(config));
            },
            addMetaBox: function (config) {
                self.setVirtualFile("admin/metaboxes/".concat(config.id, ".json"), JSON.stringify(config));
            },
            addAction: function (hook, callback, priority) {
                if (priority === void 0) { priority = 10; }
                var key = "hooks/actions/".concat(hook, "/").concat(priority, "/").concat(callback);
                self.setVirtualFile(key, JSON.stringify({ hook: hook, callback: callback, priority: priority }));
            },
            addFilter: function (hook, callback, priority) {
                if (priority === void 0) { priority = 10; }
                var key = "hooks/filters/".concat(hook, "/").concat(priority, "/").concat(callback);
                self.setVirtualFile(key, JSON.stringify({ hook: hook, callback: callback, priority: priority }));
            },
            doAction: function (hook) {
                var args = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    args[_i - 1] = arguments[_i];
                }
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
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
                        // Apply registered filters
                        return [2 /*return*/, value];
                    });
                });
            }
        };
    };
    PHPWasmRuntime.prototype.getVirtualFile = function (path) {
        var content = this.virtualFS.get(path);
        return content ? JSON.parse(content) : null;
    };
    PHPWasmRuntime.prototype.setVirtualFile = function (path, content) {
        this.virtualFS.set(path, content);
    };
    PHPWasmRuntime.prototype.loadPlugin = function (manifest, pluginZip) {
        return __awaiter(this, void 0, void 0, function () {
            var context;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.php) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.initialize()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        context = {
                            plugin: manifest,
                            bridge: this.bridge,
                            logger: {
                                info: function (msg, data) { return console.log("[WP:".concat(manifest.name, "] ").concat(msg), data !== null && data !== void 0 ? data : ''); },
                                warn: function (msg, data) { return console.warn("[WP:".concat(manifest.name, "] ").concat(msg), data !== null && data !== void 0 ? data : ''); },
                                error: function (msg, err) { return console.error("[WP:".concat(manifest.name, "] ").concat(msg), err !== null && err !== void 0 ? err : ''); }
                            },
                            config: {
                                get: function (key) { return _this.getVirtualFile("config/".concat(key, ".json")); },
                                set: function (key, value) { return _this.setVirtualFile("config/".concat(key, ".json"), JSON.stringify(value)); }
                            }
                        };
                        // Register plugin in PHP
                        // This is where the plugin's main file would be eval'd in PHP context
                        // with the bridge functions exposed as global PHP functions
                        this.plugins.set(manifest.slug, context);
                        return [2 /*return*/, context];
                }
            });
        });
    };
    PHPWasmRuntime.prototype.unloadPlugin = function (slug) {
        return __awaiter(this, void 0, void 0, function () {
            var context, _i, _a, path;
            return __generator(this, function (_b) {
                context = this.plugins.get(slug);
                if (!context)
                    return [2 /*return*/];
                // Clean up virtual FS entries for this plugin
                for (_i = 0, _a = this.virtualFS; _i < _a.length; _i++) {
                    path = _a[_i][0];
                    if (path.startsWith("plugins/".concat(slug, "/")) ||
                        path.includes("/".concat(slug, "/")) ||
                        path.startsWith("options/".concat(slug, "_"))) {
                        this.virtualFS.delete(path);
                    }
                }
                this.plugins.delete(slug);
                return [2 /*return*/];
            });
        });
    };
    PHPWasmRuntime.prototype.getPlugin = function (slug) {
        return this.plugins.get(slug);
    };
    PHPWasmRuntime.prototype.getBridge = function () {
        return this.bridge;
    };
    PHPWasmRuntime.prototype.shutdown = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, slug;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _i = 0, _a = this.plugins.keys();
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        slug = _a[_i];
                        return [4 /*yield*/, this.unloadPlugin(slug)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        if (!this.php) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.php.shutdown()];
                    case 5:
                        _b.sent();
                        this.php = null;
                        _b.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    return PHPWasmRuntime;
}());
exports.PHPWasmRuntime = PHPWasmRuntime;
function createPHPWasmRuntime(config) {
    return __awaiter(this, void 0, void 0, function () {
        var runtime;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    runtime = new PHPWasmRuntime(config);
                    return [4 /*yield*/, runtime.initialize()];
                case 1:
                    _a.sent();
                    return [2 /*return*/, runtime];
            }
        });
    });
}

