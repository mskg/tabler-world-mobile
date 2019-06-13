import { ASSOCIATION, CLUB, PRIVATE, PUBLIC } from "./DBLevels";
import { FilterLevel } from "./FilterLevel";

export function hasAccess(priv: string, level: FilterLevel) {
    if (priv === PUBLIC) {
        return true;
    }

    if (priv === PRIVATE
        && level === FilterLevel.SamePerson) {
        return true;
    }

    if (priv === CLUB
        && level === FilterLevel.SameClub) {
        return true;
    }

    if (priv === ASSOCIATION
        && (level == FilterLevel.SameAssociation || level == FilterLevel.SameArea)) {
        return true;
    }

    return false;
}
