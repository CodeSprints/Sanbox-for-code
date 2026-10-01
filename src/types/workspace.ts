export const WORKSPACE_MODES = ["web", "runner"] as const;

export type WorkspaceMode = (typeof WORKSPACE_MODES)[number];

export const SPLIT_PANES = ["editors", "output"] as const;

export type SplitPane = (typeof SPLIT_PANES)[number];

export function isWorkspaceMode(value: unknown): value is WorkspaceMode {
  return typeof value === "string" && (WORKSPACE_MODES as readonly string[]).includes(value);
}
