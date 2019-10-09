import { ALL, ASSOCIATION, CLUB, PRIVATE, PUBLIC } from './DBLevels';
import { FilterLevel } from './FilterLevel';

// error in rule
// tslint:disable: ter-indent

export function hasAccess(priv: string, level: FilterLevel) {
    if (priv === ALL) {
        return true;
    }

    // same family only, we currently cannot check that
    if (priv === PUBLIC) {
        return true;
    }

    // same person only
    if (priv === PRIVATE) {
        switch (level) {
            case FilterLevel.SamePerson:
                return true;

            default:
                return false;
        }
    }

    // same club only
    if (priv === CLUB) {
        switch (level) {
            case FilterLevel.SamePerson:
            case FilterLevel.SameClub:
                return true;

            default:
                return false;
        }
    }

    // same assocation only
    if (priv === ASSOCIATION) {
        switch (level) {
            case FilterLevel.SamePerson:
            case FilterLevel.SameClub:
            case FilterLevel.SameArea:
            case FilterLevel.SameAssociation:
                return true;

            default:
                return false;
        }
    }

    return false;
}
