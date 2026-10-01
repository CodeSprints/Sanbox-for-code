import type { RunnableLanguage } from "./languages";

export interface ExtraFile {
  name: string;
  content: string;
}

export interface RunRequest {
  language: RunnableLanguage;
  source: string;
  stdin: string;
  extraFiles?: readonly ExtraFile[];
  signal?: AbortSignal;
}

export interface RunResult {
  output: string;
  failed: boolean;
  exitCode: number | null;
  durationMs: number;
}

export type ExecutionErrorCode = "network" | "rate-limit" | "service" | "empty-source";

export class ExecutionError extends Error {
  public readonly code: ExecutionErrorCode;

  constructor(code: ExecutionErrorCode, message: string) {
    super(message);
    this.name = "ExecutionError";
    this.code = code;
  }
}

interface PistonStage {
  stdout?: string;
  stderr?: string;
  output?: string;
  code?: number | null;
  signal?: string | null;
}

interface PistonResponse {
  run?: PistonStage;
  compile?: PistonStage;
  message?: string;
}

const DEFAULT_ENDPOINT = "https://emkc.org/api/v2/piston/execute";
const REQUEST_TIMEOUT_MS = 20_000;
const MAX_SOURCE_LENGTH = 100_000;

export function getExecutionEndpoint(): string {
  const configured = import.meta.env.VITE_EXECUTION_ENDPOINT;

  return typeof configured === "string" && configured.length > 0 ? configured : DEFAULT_ENDPOINT;
}

function mergeStageOutput(stage: PistonStage | undefined): string {
  if (!stage) {
    return "";
  }

  if (typeof stage.output === "string" && stage.output.length > 0) {
    return stage.output;
  }

  return [stage.stdout ?? "", stage.stderr ?? ""].filter(Boolean).join("\n");
}

function combineSignals(external: AbortSignal | undefined, timeout: AbortSignal): AbortSignal {
  if (!external) {
    return timeout;
  }

  if (typeof AbortSignal.any === "function") {
    return AbortSignal.any([external, timeout]);
  }

  return external;
}

export async function runCode({
  language,
  source,
  stdin,
  extraFiles = [],
  signal,
}: RunRequest): Promise<RunResult> {
  if (source.trim().length === 0) {
    throw new ExecutionError("empty-source", "Source code is empty.");
  }

  const startedAt = Date.now();
  const timeoutSignal = AbortSignal.timeout(REQUEST_TIMEOUT_MS);

  let response: Response;

  try {
    response = await fetch(getExecutionEndpoint(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: combineSignals(signal, timeoutSignal),
      body: JSON.stringify({
        language: language.runtime,
        version: language.version,
        files: [
          { name: language.filename, content: source.slice(0, MAX_SOURCE_LENGTH) },
          ...extraFiles.map((file) => ({
            name: file.name,
            content: file.content.slice(0, MAX_SOURCE_LENGTH),
          })),
        ],
        stdin,
      }),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ExecutionError("network", "The execution request was cancelled or timed out.");
    }

    throw new ExecutionError("network", "The execution service is unreachable.");
  }

  if (response.status === 429) {
    throw new ExecutionError("rate-limit", "Too many executions. Please wait a moment.");
  }

  if (!response.ok) {
    throw new ExecutionError("service", `Execution service responded with ${response.status}.`);
  }

  const payload = (await response.json()) as PistonResponse;

  if (payload.message) {
    throw new ExecutionError("service", payload.message);
  }

  const compileOutput = mergeStageOutput(payload.compile);
  const runOutput = mergeStageOutput(payload.run);
  const exitCode = payload.run?.code ?? null;
  const compileFailed = (payload.compile?.code ?? 0) !== 0;

  return {
    output: [compileOutput, runOutput]
      .filter((part) => part.length > 0)
      .join("\n")
      .trimEnd(),
    failed: compileFailed || (exitCode !== null && exitCode !== 0),
    exitCode,
    durationMs: Date.now() - startedAt,
  };
}
