export function fixC41AssociationName(name: string) {
    if (name && name.match(/ \| /)) {
        return name.substring(0, name.indexOf(' |'));
    }

    return name;
}
