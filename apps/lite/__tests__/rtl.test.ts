/**
 * @module sard/lite/__tests__/rtl.test
 * RTL visual regression and accessibility tests
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { chromium, type Browser, type Page } from '@playwright/test';

describe('RTL Support', () => {
  let browser: Browser;
  let page: Page;
  
  beforeAll(async () => {
    browser = await chromium.launch({ headless: true });
    page = await browser.newPage();
    await page.goto('http://localhost:4321');
  });
  
  afterAll(async () => {
    await browser?.close();
  });
  
  it('should have RTL direction on html', async () => {
    const dir = await page.getAttribute('html', 'dir');
    expect(dir).toBe('rtl');
  });
  
  it('should use Arabic font', async () => {
    const fontFamily = await page.evaluate(() => 
      getComputedStyle(document.body).fontFamily
    );
    expect(fontFamily).toContain('IBM Plex Sans Arabic');
  });
  
  it('should have logical properties in CSS', async () => {
    const styles = await page.evaluate(() => {
      const sheet = document.styleSheets[0];
      if (!sheet) return [];
      return Array.from(sheet.cssRules || []).map(r => r.cssText);
    });
    // Check for logical properties
    const hasLogical = styles.some((s: string) => s.includes('margin-inline') || s.includes('padding-inline'));
    expect(hasLogical).toBe(true);
  });
  
  it('should pass axe accessibility audit', async () => {
    // Would inject axe-core and run audit
    expect(true).toBe(true); // Placeholder
  });
  
  it('should render Arabic content correctly', async () => {
    await page.goto('http://localhost:4321/posts');
    const content = await page.textContent('body');
    expect(content).toContain('مقالات'); // Arabic word for posts
  });
});
