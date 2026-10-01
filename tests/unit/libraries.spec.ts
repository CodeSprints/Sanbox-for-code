import { describe, expect, it } from "vitest";

import { LANGUAGE_LIBRARIES, librariesFor, manifestFor } from "@/features/code-runner/libraries";

const CATALOGUED = ["python", "cpp", "rust", "csharp", "java", "kotlin"];

describe("language library catalog", () => {
  it("lists twenty libraries for every supported language", () => {
    for (const language of CATALOGUED) {
      expect(librariesFor(language), language).toHaveLength(20);
    }
  });

  it("uses unique ids inside each catalog", () => {
    for (const [language, libraries] of Object.entries(LANGUAGE_LIBRARIES)) {
      const ids = libraries.map((library) => library.id);

      expect(new Set(ids).size, language).toBe(ids.length);
    }
  });

  it("returns an empty catalog for languages without one", () => {
    expect(librariesFor("javascript")).toEqual([]);
  });
});

describe("manifestFor", () => {
  it("writes requirements.txt for python", () => {
    const manifest = manifestFor("python", librariesFor("python").slice(0, 2));

    expect(manifest?.path).toBe("requirements.txt");
    expect(manifest?.content.trim().split("\n")).toHaveLength(2);
  });

  it("writes Cargo.toml for rust", () => {
    const manifest = manifestFor("rust", librariesFor("rust").slice(0, 1));

    expect(manifest?.path).toBe("Cargo.toml");
    expect(manifest?.content).toContain("[dependencies]");
  });

  it("writes valid json for cpp", () => {
    const manifest = manifestFor("cpp", librariesFor("cpp").slice(0, 3));

    expect(manifest?.path).toBe("vcpkg.json");
    expect(JSON.parse(manifest?.content ?? "{}")).toMatchObject({ name: "sandbox" });
  });

  it("writes package references for csharp", () => {
    const manifest = manifestFor("csharp", librariesFor("csharp").slice(0, 1));

    expect(manifest?.path).toBe("sandbox.csproj");
    expect(manifest?.content).toContain("<PackageReference Include=");
  });

  it("writes maven coordinates for java", () => {
    const manifest = manifestFor("java", librariesFor("java").slice(0, 1));

    expect(manifest?.path).toBe("pom.xml");
    expect(manifest?.content).toContain("<artifactId>");
  });

  it("writes gradle dependencies for kotlin", () => {
    const manifest = manifestFor("kotlin", librariesFor("kotlin").slice(0, 1));

    expect(manifest?.path).toBe("build.gradle.kts");
    expect(manifest?.content).toContain("dependencies {");
  });

  it("returns null without selected libraries or manifests", () => {
    expect(manifestFor("python", [])).toBeNull();
    expect(manifestFor("javascript", librariesFor("python"))).toBeNull();
  });
});
