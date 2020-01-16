

import { find } from 'lodash';
import { normalizeForSearch } from '../../helper/normalizeForSearch';
import { IMemberOverviewFragment } from '../../model/IMemberOverviewFragment';
import { HashMap } from '../../model/Maps';

export type Predicate = (member: IMemberOverviewFragment) => boolean;

// tslint:disable: function-name
export class Predicates {
    static readonly all = () => true;
    static readonly none = () => false;

    static or(...others: (Predicate | null)[]): Predicate {
        const reduced = (others || []).filter((f) => f != null) as Predicate[];

        return reduced.length === 0
            ? Predicates.all
            : (member: IMemberOverviewFragment) => {
                return find(reduced, (o) => o(member)) != null;
            };
    }

    static and(...others: (Predicate | null)[]): Predicate {
        const reduced = (others || []).filter((f) => f != null) as Predicate[];

        return reduced.length === 0
            ? Predicates.all
            : (member: IMemberOverviewFragment) => {
                return find(reduced, (o) => !o(member)) == null;
            };
    }

    static text(text: string): Predicate {
        return (member: IMemberOverviewFragment) => {
            const search = normalizeForSearch(text);
            // tslint:disable: prefer-template
            return normalizeForSearch((member.firstname + ' ' + member.lastname)).indexOf(search) >= 0
                || normalizeForSearch((member.lastname + ' ' + member.firstname)).indexOf(search) >= 0
                || normalizeForSearch((member.club.name + ' ' + member.area.name + ' ' + member.association.name)).indexOf(search) >= 0;
        };
    }

    static favorite(favorites: HashMap<boolean>): Predicate {
        return (member: IMemberOverviewFragment) => {
            return favorites[member.id] === true;
        };
    }

    static sametable(club: string): Predicate {
        return (member: IMemberOverviewFragment) => {
            return member.club.id === club;
        };
    }

    static area(areas: HashMap<boolean, string> | null): Predicate {
        return (member) => {
            return areas == null || areas[member.area.name] === true;
        };
    }

    static association(associations: HashMap<boolean, string> | null): Predicate {
        return (member) => {
            return associations == null || associations[member.association.name] === true;
        };
    }

    static associationBoard(): Predicate {
        return (member) => {
            return member.roles != null && member.roles.find((r) => r.ref.type === 'assoc') != null;
        };
    }

    static areaBoard(): Predicate {
        return (member) => {
            return member.roles != null && member.roles.find((r) => r.ref.type === 'area') != null;
        };
    }

    static role(roles: HashMap<boolean, string> | null): Predicate {
        return (member: IMemberOverviewFragment) => {
            return roles == null ||
                (member.roles != null && find(member.roles, (role) => roles[role.name] === true) != null);
        };
    }

    static table(tables: HashMap<boolean, string | number>): Predicate {
        return (member: IMemberOverviewFragment) => {
            return tables == null
                || tables[member.club.club] === true
                || tables[member.club.name] === true;
        };
    }
}
