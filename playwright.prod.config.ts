import { defineConfig, devices } from '@playwright/test';

/** Checks the built site, where dev overlays and HMR are absent. */
export default defineConfig({
  testDir: './tests-prod',
  reporter: 'line',
  /**
   * The mobile hero needs 24s on its own: Pixel 7 emulation plus the WebGL
   * globe. Two workers pushed it past the 30s default, so the margin was too
   * thin to be trusted rather than the test being wrong.
   */
  timeout: 90_000,
  // Motion stays ON here: reduced motion renders every final state
  // immediately, which would hide content stuck waiting on an animation.
  use: {
    baseURL: 'http://localhost:3700',
  },
  /**
   * Starts its own server against the current `.next-prod`, and never reuses
   * one that is already up.
   *
   * Reuse is what let the contact endpoint ship broken: the dev config reuses
   * an existing server, a four-hour-old dev process answered the suite, and a
   * middleware change it predated went unseen until CI ran on a clean machine.
   * A busy port failing loudly here is better than a silent pass against a
   * stale build. `build:prod` has to have run first.
   */
  webServer: {
    command: 'npm run start:prod',
    url: 'http://localhost:3700',
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    { name: 'mobile', use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 } } },
  ],
});
