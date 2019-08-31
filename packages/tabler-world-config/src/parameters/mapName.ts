export function mapName(name: string, env: string = "dev"): string {
    return `/tabler-world/${env}/${name}`;
}
