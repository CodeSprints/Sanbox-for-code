export interface PackageSummary {
  name: string;
  version: string;
  description: string;
  links: string;
}

const CDN = "https://esm.sh";
const REGISTRY = "https://registry.npmjs.org";

export function packageUrl(
  name: string,
  version: string,
  externals: readonly string[] = [],
): string {
  const pinned = version && version !== "latest" ? `${name}@${version}` : name;
  const shared = externals.filter((entry) => entry !== name);
  const query = shared.length > 0 ? `?external=${shared.join(",")}` : "";

  return `${CDN}/${pinned}${query}`;
}

export function buildImportMap(dependencies: Record<string, string>): {
  imports: Record<string, string>;
} {
  const names = Object.keys(dependencies).sort((a, b) => a.localeCompare(b, "en"));
  const imports: Record<string, string> = {};

  for (const name of names) {
    const version = dependencies[name] ?? "latest";
    imports[name] = packageUrl(name, version, names);
    imports[`${name}/`] = `${packageUrl(name, version, names).split("?")[0] ?? ""}/`;
  }

  return { imports };
}

export async function searchPackages(
  query: string,
  signal?: AbortSignal,
): Promise<PackageSummary[]> {
  const trimmed = query.trim();

  if (trimmed.length === 0) {
    return [];
  }

  const url = `${REGISTRY}/-/v1/search?text=${encodeURIComponent(trimmed)}&size=10`;
  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error(`Registry responded with ${response.status}`);
  }

  const payload = (await response.json()) as {
    objects?: {
      package?: { name?: string; version?: string; description?: string; links?: { npm?: string } };
    }[];
  };

  return (payload.objects ?? []).flatMap((entry) => {
    const info = entry.package;

    if (!info?.name) {
      return [];
    }

    return [
      {
        name: info.name,
        version: info.version ?? "latest",
        description: info.description ?? "",
        links: info.links?.npm ?? `https://www.npmjs.com/package/${info.name}`,
      },
    ];
  });
}

export async function fetchLatestVersion(name: string, signal?: AbortSignal): Promise<string> {
  const response = await fetch(`${REGISTRY}/${encodeURIComponent(name)}/latest`, { signal });

  if (!response.ok) {
    throw new Error(`Registry responded with ${response.status}`);
  }

  const payload = (await response.json()) as { version?: string };

  return payload.version ?? "latest";
}
