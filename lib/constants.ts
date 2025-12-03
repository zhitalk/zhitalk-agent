import { generateDummyPassword } from "./db/utils";

export const isProductionEnvironment = process.env.NODE_ENV === "production";
export const isDevelopmentEnvironment = process.env.NODE_ENV === "development";
export const isTestEnvironment = Boolean(
  process.env.PLAYWRIGHT_TEST_BASE_URL ||
    process.env.PLAYWRIGHT ||
    process.env.CI_PLAYWRIGHT
);

export const guestRegex = /^guest-\d+$/;

export const DUMMY_PASSWORD = generateDummyPassword();

/**
 * Determines if secure cookies should be used based on the request URL.
 * Secure cookies are only used when the request is over HTTPS.
 */
export function shouldUseSecureCookie(url: string | URL): boolean {
  const urlObj = typeof url === "string" ? new URL(url) : url;
  return urlObj.protocol === "https:";
}