"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var config_1 = require("vitest/config");
var vitest_tsconfig_paths_1 = require("vitest-tsconfig-paths");
exports.default = (0, config_1.defineConfig)({
    plugins: [(0, vitest_tsconfig_paths_1.default)()],
    test: {
        environment: 'node',
        globals: true,
        include: ['__tests__/**/*.test.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            thresholds: { lines: 80, functions: 80, branches: 70, statements: 80 }
        }
    }
});
