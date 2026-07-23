const DEFAULT_SPEC_WORKSPACE_BASE_URL = 'http://localhost:5173';

export function getSpecWorkspaceBaseUrl(): string {
  const configured =
    import.meta.env.PUBLIC_SPEC_WORKSPACE_BASE_URL || DEFAULT_SPEC_WORKSPACE_BASE_URL;
  return configured.replace(/\/+$/, '');
}

export function getSpecEntityId(filename: string): string {
  return filename.replace(/\.(yaml|yml|md)$/i, '');
}

export function getSpecEntityUrl(filename: string): string {
  return `${getSpecWorkspaceBaseUrl()}/#/entities/${getSpecEntityId(filename)}`;
}
