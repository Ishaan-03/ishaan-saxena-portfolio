import { defineConfig, devices } from '@playwright/test';

/** Checks the built site, where dev overlays and HMR are absent. */
export default defineConfig({
  testDir: './tests-prod',
  reporter: 'line',
  // Motion stays ON here: reduced motion renders every final state
  // immediately, which would hide content stuck waiting on an animation.
  use: {
    baseURL: 'http://localhost:3900',
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    { name: 'mobile', use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 } } },
  ],
});
