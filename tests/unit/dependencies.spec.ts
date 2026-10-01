import { afterEach, describe, expect, it, vi } from "vitest";

import {
  buildImportMap,
  fetchLatestVersion,
  packageUrl,
  searchPackages,
} from "@/features/web-playground/dependencies";

afterEach(() => {
  vi.unstubAllGlobals();
});

function jsonResponse(payload: unknown, ok = true, status = 200): Response {
  return { ok, status, json: async () => payload } as Response;
}

describe("packageUrl", () => {
  it("pins the requested version", () => {
    expect(packageUrl("react", "18.3.1")).toBe("https://esm.sh/react@18.3.1");
  });

  it("omits the version when it is latest", () => {
    expect(packageUrl("react", "latest")).toBe("https://esm.sh/react");
  });

  it("shares other dependencies through the external query", () => {
    expect(packageUrl("react-dom", "18.3.1", ["react", "react-dom"])).toBe(
      "https://esm.sh/react-dom@18.3.1?external=react",
    );
  });
});

describe("buildImportMap", () => {
  it("maps names and subpath prefixes", () => {
    const { imports } = buildImportMap({ "react-dom": "18.3.1", react: "18.3.1" });

    expect(imports["react"]).toBe("https://esm.sh/react@18.3.1?external=react-dom");
    expect(imports["react-dom/"]).toBe("https://esm.sh/react-dom@18.3.1/");
    expect(Object.keys(imports)).toEqual(["react", "react/", "react-dom", "react-dom/"]);
  });

  it("returns an empty map for no dependencies", () => {
    expect(buildImportMap({})).toEqual({ imports: {} });
  });
});

describe("searchPackages", () => {
  it("returns nothing for an empty query", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    expect(await searchPackages("   ")).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("maps registry results", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse({
          objects: [
            {
              package: {
                name: "zod",
                version: "3.23.8",
                description: "Schemas",
                links: { npm: "https://npm/zod" },
              },
            },
            { package: { version: "1.0.0" } },
          ],
        }),
      ),
    );

    const results = await searchPackages("zod");

    expect(results).toEqual([
      { name: "zod", version: "3.23.8", description: "Schemas", links: "https://npm/zod" },
    ]);
  });

  it("throws when the registry fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse({}, false, 503)),
    );

    await expect(searchPackages("zod")).rejects.toThrow("503");
  });
});

describe("fetchLatestVersion", () => {
  it("reads the version field", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse({ version: "5.1.0" })),
    );

    expect(await fetchLatestVersion("axios")).toBe("5.1.0");
  });

  it("falls back to latest", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse({})),
    );

    expect(await fetchLatestVersion("axios")).toBe("latest");
  });
});
