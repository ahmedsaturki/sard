import { devices } from '@playwright/test';

module.exports = {
  testDir: './__tests__',
  testMatch: '**/*.visual.test.ts',
  projects: [
    {
      name: 'chromium-desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 720 } },
    },
    {
      name: 'chromium-tablet',
      use: { ...devices['iPad Pro'], viewport: { width: 1024, height: 768 } },
    },
    {
      name: 'chromium-mobile',
      use: { ...devices['iPhone 13'], viewport: { width: 390, height: 844 } },
    },
  ],
  snapshotDir: './__snapshots__',
  snapshotPathTemplate: '{testDir}/__snapshots__/{testFileDir}/{arg}{ext}',
  updateSnapshots: 'missing',
  threshold: 0.02, // 2% pixel diff (HC-12 visual regression)
};
