export type ConsoleLevel = "log" | "info" | "warn" | "error";

export interface PreviewMessage {
  source: "code-sandbox-preview";
  level: ConsoleLevel;
  message: string;
  time: number;
}

export interface ConsoleEntry {
  id: number;
  level: ConsoleLevel;
  message: string;
  time: number;
}

const LEVELS: readonly string[] = ["log", "info", "warn", "error"];

export function isPreviewMessage(value: unknown): value is PreviewMessage {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Partial<PreviewMessage>;

  return (
    candidate.source === "code-sandbox-preview" &&
    typeof candidate.level === "string" &&
    LEVELS.includes(candidate.level) &&
    typeof candidate.message === "string"
  );
}
