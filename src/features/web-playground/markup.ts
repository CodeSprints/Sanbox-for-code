export async function renderMarkdown(source: string): Promise<string> {
  const { marked } = await import("marked");

  return marked.parse(source, { async: false, gfm: true, breaks: false });
}

export function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const TOKEN_PATTERN = /<%([=\-#]?)([\s\S]*?)%>/g;

export function compileEjs(template: string): string {
  let body = 'let __output = "";\n';
  let lastIndex = 0;

  const appendText = (text: string): void => {
    if (text.length > 0) {
      body += `__output += ${JSON.stringify(text)};\n`;
    }
  };

  for (const match of template.matchAll(TOKEN_PATTERN)) {
    const [raw, marker = "", code = ""] = match;
    const index = match.index ?? 0;

    appendText(template.slice(lastIndex, index));
    lastIndex = index + raw.length;

    if (marker === "#") {
      continue;
    }

    if (marker === "=") {
      body += `__output += __escape(${code.trim()});\n`;
      continue;
    }

    if (marker === "-") {
      body += `__output += String(${code.trim()});\n`;
      continue;
    }

    body += `${code}\n`;
  }

  appendText(template.slice(lastIndex));
  body += "return __output;";

  return body;
}

export function renderEjs(template: string, data: Record<string, unknown>): string {
  const keys = Object.keys(data);
  const values = keys.map((key) => data[key]);
  const renderer = new Function("__escape", ...keys, compileEjs(template)) as (
    escape: typeof escapeHtml,
    ...args: unknown[]
  ) => string;

  return renderer(escapeHtml, ...values);
}
