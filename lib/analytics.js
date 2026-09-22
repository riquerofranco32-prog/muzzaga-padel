import { track } from "@vercel/analytics";

export function trackEvent(name, properties = {}) {
  try {
    track(name, properties);
  } catch (e) {
    // Fail-safe for non-browser or non-configured environments
  }

  try {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("muzzaga_analytics", {
          detail: { event: name, ...properties },
        })
      );
      if (process.env.NODE_ENV === "development") {
        console.log(`[Analytics] ${name}:`, properties);
      }
    }
  } catch (err) {
    // Non-blocking
  }
}
