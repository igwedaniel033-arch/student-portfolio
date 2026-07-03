import { defineConfig } from '@playwright/test';

const base = process.env.TEST_BASE_URL || 'http://localhost';
export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: base,
    headless: true,
    viewport: { width: 1280, height: 720 }
  }
});
