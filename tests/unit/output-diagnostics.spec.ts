import { describe, expect, it } from "vitest";

import { parseOutputDiagnostics } from "@/features/code-runner/output-diagnostics";

describe("parseOutputDiagnostics", () => {
  it("parses gcc style errors", () => {
    const diagnostics = parseOutputDiagnostics(
      "main.cpp:4:10: error: 'cout' was not declared in this scope",
      ["main.cpp"],
    );

    expect(diagnostics[0]).toMatchObject({ line: 4, column: 10, severity: "error" });
    expect(diagnostics[0]?.message).toContain("cout");
  });

  it("parses gcc style warnings", () => {
    const diagnostics = parseOutputDiagnostics("main.cpp:2:5: warning: unused variable 'x'", [
      "main.cpp",
    ]);

    expect(diagnostics[0]?.severity).toBe("warning");
  });

  it("parses msbuild style csharp errors", () => {
    const diagnostics = parseOutputDiagnostics(
      "Program.cs(7,13): error CS0103: The name 'foo' does not exist",
      ["Program.cs"],
    );

    expect(diagnostics[0]).toMatchObject({ line: 7, column: 13, severity: "error" });
  });

  it("parses rust arrow locations", () => {
    const diagnostics = parseOutputDiagnostics(
      "error[E0425]: cannot find value `x`\n  --> main.rs:3:5\n   |\n",
      ["main.rs"],
    );

    expect(diagnostics[0]?.line).toBe(3);
    expect(diagnostics[0]?.column).toBe(5);
  });

  it("parses python tracebacks", () => {
    const diagnostics = parseOutputDiagnostics(
      "Traceback (most recent call last):\n  File \"main.py\", line 2, in <module>\nNameError: name 'q' is not defined",
      ["main.py"],
    );

    expect(diagnostics[0]?.line).toBe(2);
    expect(diagnostics[0]?.message).toContain("NameError");
  });

  it("parses javac style errors", () => {
    const diagnostics = parseOutputDiagnostics("Main.java:5: error: ';' expected", ["Main.java"]);

    expect(diagnostics[0]).toMatchObject({ line: 5, severity: "error" });
  });

  it("matches files by base name", () => {
    const diagnostics = parseOutputDiagnostics("/tmp/build/Main.kt:9: error: expecting ')'", [
      "Main.kt",
    ]);

    expect(diagnostics).toHaveLength(1);
  });

  it("ignores files that are not part of the workspace", () => {
    expect(parseOutputDiagnostics("other.cpp:1:1: error: nope", ["main.cpp"])).toEqual([]);
  });

  it("drops duplicate diagnostics", () => {
    const output = "main.py:1: error: bad\nmain.py:1: error: bad";

    expect(parseOutputDiagnostics(output, ["main.py"])).toHaveLength(1);
  });

  it("returns nothing for clean output", () => {
    expect(parseOutputDiagnostics("Hello world\n", ["main.py"])).toEqual([]);
  });
});
