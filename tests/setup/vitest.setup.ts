import { config } from "@vue/test-utils";
import { afterEach, beforeEach, vi } from "vitest";

class MediaQueryListStub {
  public matches = false;

  public media: string;

  private readonly listeners = new Set<(event: MediaQueryListEvent) => void>();

  constructor(media: string) {
    this.media = media;
  }

  addEventListener(_type: "change", listener: (event: MediaQueryListEvent) => void): void {
    this.listeners.add(listener);
  }

  removeEventListener(_type: "change", listener: (event: MediaQueryListEvent) => void): void {
    this.listeners.delete(listener);
  }

  dispatch(matches: boolean): void {
    this.matches = matches;
    for (const listener of this.listeners) {
      listener({ matches } as MediaQueryListEvent);
    }
  }
}

export const mediaQueries = new Map<string, MediaQueryListStub>();

beforeEach(() => {
  mediaQueries.clear();

  if (typeof localStorage !== "undefined") {
    localStorage.clear();
  }

  if (typeof document === "undefined") {
    return;
  }

  vi.stubGlobal("matchMedia", (media: string) => {
    const existing = mediaQueries.get(media);

    if (existing) {
      return existing as unknown as MediaQueryList;
    }

    const created = new MediaQueryListStub(media);
    mediaQueries.set(media, created);
    return created as unknown as MediaQueryList;
  });

  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    callback(0);
    return 0;
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

config.global.stubs = {};
