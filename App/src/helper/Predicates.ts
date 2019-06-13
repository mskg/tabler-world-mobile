

import _ from 'lodash';
import { IMember } from '../model/IMember';
import { HashMap } from '../model/Maps';

export type Predicate = (member: IMember) => boolean;

export class Predicates {
    public static readonly all = () => true;
    public static readonly none = () => false;

    public static or(...others: (Predicate | null)[]) {
        const reduced = (others || []).filter(f => f != null) as Predicate[];

        return reduced.length == 0
            ? Predicates.all
            : (member: IMember) => {
                return _.find(reduced, o => o(member) == true) != null;
            }
    }

    public static and(...others: (Predicate | null)[]) {
        const reduced = (others || []).filter(f => f != null) as Predicate[];

        return reduced.length == 0
            ? Predicates.all
            : (member: IMember) => {
                return _.find(reduced, o => o(member) == false) == null;
            }
    }

    public static favorite(favorites: HashMap<boolean>): Predicate {
        return (member: IMember) => {
            return favorites[member.id] === true;
        }
    }

    public static sametable(club: number): Predicate {
        return (member: IMember) => {
            return member.club.club == club;
        }
    }

    public static area(areas: HashMap<boolean, string> | null): Predicate {
        return (member) => {
            return areas == null || areas[member.area.name] === true;
        }
    }

    public static role(roles: HashMap<boolean, string> | null): Predicate {
        return (member: IMember) => {
            return roles == null ||
            (member.roles != null && _.find(member.roles, role => roles[role.name] === true) != null);
        }
    }

    public static table(tables: HashMap<boolean, string|number>): Predicate {
        return (member: IMember) => {
            return tables == null
            || tables[member.club] === true
            || tables[member.clubname] === true
        }
    }
}
