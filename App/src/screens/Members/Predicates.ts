

import _ from 'lodash';
import { IMemberOverviewFragment } from "../../model/IMemberOverviewFragment";
import { HashMap } from '../../model/Maps';

export type Predicate = (member: IMemberOverviewFragment) => boolean;

export class Predicates {
    public static readonly all = () => true;
    public static readonly none = () => false;

    public static or(...others: (Predicate | null)[]) {
        const reduced = (others || []).filter(f => f != null) as Predicate[];

        return reduced.length == 0
            ? Predicates.all
            : (member: IMemberOverviewFragment) => {
                return _.find(reduced, o => o(member) == true) != null;
            }
    }

    public static and(...others: (Predicate | null)[]) {
        const reduced = (others || []).filter(f => f != null) as Predicate[];

        return reduced.length == 0
            ? Predicates.all
            : (member: IMemberOverviewFragment) => {
                return _.find(reduced, o => o(member) == false) == null;
            }
    }

    public static favorite(favorites: HashMap<boolean>): Predicate {
        return (member: IMemberOverviewFragment) => {
            return favorites[member.id] === true;
        }
    }

    public static sametable(club: number): Predicate {
        return (member: IMemberOverviewFragment) => {
            return member.club.club == club;
        }
    }

    public static area(areas: HashMap<boolean, string> | null): Predicate {
        return (member) => {
            return areas == null || areas[member.area.name] === true;
        }
    }

    public static associationBoard(): Predicate {
        return (member) => {
            return member.roles != null && member.roles.find(r => r.ref.type === "assoc") != null;
        }
    }

    public static areaBoard(): Predicate {
        return (member) => {
            return member.roles != null && member.roles.find(r => r.ref.type === "area") != null;
        }
    }

    public static role(roles: HashMap<boolean, string> | null): Predicate {
        return (member: IMemberOverviewFragment) => {
            return roles == null ||
            (member.roles != null && _.find(member.roles, role => roles[role.name] === true) != null);
        }
    }

    public static table(tables: HashMap<boolean, string|number>): Predicate {
        return (member: IMemberOverviewFragment) => {
            return tables == null
            || tables[member.club.club] === true
            || tables[member.club.name] === true
        }
    }
}
