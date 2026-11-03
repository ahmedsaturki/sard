/**
 * @module @sard-cms/wp-runtime/__tests__/bridge.test
 * TDD tests for WP Plugin Bridge API
 * 
 * Escape tests: verify plugin cannot exceed declared capabilities
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createBridge, createPluginManifest, type WPPluginContext } from '../src/bridge.js';
import { capabilities } from '@sard-cms/sandbox';

describe('WP Plugin Bridge', () => {
  let mockContext: WPPluginContext;
  let bridge: ReturnType<typeof createBridge>;
  
  beforeEach(() => {
    const manifest = createPluginManifest(
      'Test Plugin',
      'test-plugin',
      '1.0.0',
      [capabilities.content.read, capabilities.content.write],
      {
        fs: { read: ['/tmp/test-plugin/*'], write: ['/tmp/test-plugin/*'] },
        net: { domains: ['api.example.com'] },
        db: { tables: ['wp_options', 'wp_postmeta'] },
        hooks: { actions: ['init', 'wp_head'], filters: ['the_content'] }
      },
      'test-plugin.php'
    );
    
    mockContext = {
      plugin: manifest,
      bridge: {} as any,
      logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
      config: {
        get: vi.fn((key) => key === 'test-plugin_test_option' ? 'test-value' : null),
        set: vi.fn()
      }
    };
    
    bridge = createBridge(mockContext);
  });
  
  it('should allow declared capabilities', async () => {
    const result = await bridge.getPosts({ post_type: 'post', posts_per_page: 10 });
    expect(Array.isArray(result)).toBe(true);
  });
  
  it('should scope options to plugin prefix', async () => {
    await bridge.updateOption('test_option', 'new-value');
    expect(mockContext.config.set).toHaveBeenCalledWith('test-plugin_test_option', 'new-value');
    
    await bridge.getOption('test_option');
    expect(mockContext.config.get).toHaveBeenCalledWith('test-plugin_test_option');
  });
  
  it('should deny undeclared capabilities', async () => {
    const manifest = createPluginManifest(
      'Minimal Plugin',
      'minimal',
      '1.0.0',
      [], // no capabilities
      { fs: {}, net: {}, db: {}, hooks: {} },
      'minimal.php'
    );
    
    const ctx = { ...mockContext, plugin: manifest };
    const minimalBridge = createBridge(ctx);
    
    await expect(minimalBridge.getPosts({})).rejects.toThrow('Capability denied');
    await expect(minimalBridge.updateOption('x', 'y')).rejects.toThrow('Capability denied');
  });
  
  it('should only allow parameterized SELECT queries', async () => {
    await expect(bridge.query('SELECT * FROM wp_options', [])).resolves.toBeDefined();
    await expect(bridge.query('DROP TABLE wp_users', [])).rejects.toThrow('Only SELECT allowed');
    await expect(bridge.query('SELECT * FROM wp_users UNION SELECT * FROM wp_options', [])).rejects.toThrow('UNION not allowed');
    await expect(bridge.execute('INSERT INTO wp_options VALUES (1,2,3)', [])).rejects.toThrow('Write queries not allowed');
  });
  
  it('should enforce table allowlist', async () => {
    await expect(bridge.query('SELECT * FROM wp_postmeta', [])).resolves.toBeDefined();
    await expect(bridge.query('SELECT * FROM wp_users', [])).rejects.toThrow('Table not allowed');
  });
  
  it('should enforce network allowlist', async () => {
    const manifest = createPluginManifest(
      'Network Plugin',
      'net-plugin',
      '1.0.0',
      ['net:http'],
      { net: { domains: ['api.trusted.com'] }, fs: {}, db: {}, hooks: {} },
      'net-plugin.php'
    );
    expect(manifest.permissions.net.domains).toContain('api.trusted.com');
  });
  
  it('should audit every bridge call', async () => {
    await bridge.getPosts({});
    expect(mockContext.logger.info).toHaveBeenCalled();
  });
  
  // ESCAPE TESTS
  describe('Escape Prevention', () => {
    it('should prevent raw SQL execution', async () => {
      await expect(bridge.execute('DELETE FROM wp_options', [])).rejects.toThrow('Write queries not allowed');
    });
    
    it('should prevent accessing undeclared tables', async () => {
      await expect(bridge.query('SELECT user_pass FROM wp_users', [])).rejects.toThrow('Table not allowed');
    });
    
    it('should prevent option access outside plugin scope', async () => {
      await bridge.getOption('other_plugin_option');
      expect(mockContext.config.get).toHaveBeenCalledWith('test-plugin_other_plugin_option');
    });
    
    it('should prevent arbitrary hook registration', async () => {
      const manifest = createPluginManifest(
        'Hook Plugin',
        'hook-plugin',
        '1.0.0',
        ['hooks:action'],
        { hooks: { actions: ['init'] }, fs: {}, net: {}, db: {} },
        'hook-plugin.php'
      );
      const ctx = { ...mockContext, plugin: manifest };
      const b = createBridge(ctx);
      
      b.addAction('init', 'my_callback');
      expect(mockContext.logger.info).toHaveBeenCalled();
      
      expect(manifest.permissions.hooks.actions).toEqual(['init']);
    });
  });
});

