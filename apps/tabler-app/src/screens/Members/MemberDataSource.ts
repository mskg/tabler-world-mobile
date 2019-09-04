

import _ from 'lodash';
import { normalizeForSearch } from '../../helper/normalizeForSearch';
import { IMemberOverviewFragment } from '../../model/IMemberOverviewFragment';
import { Predicate, Predicates } from './Predicates';

export type SectionData = {
    title: string,
    data: IMemberOverviewFragment[],
}[];

function isChar(c) {
    return c >= 'A' && c <= 'Z';
}

function sectionFrom(s): string {
    // we must replace äöü
    const c = normalizeForSearch(s)
        .substring(0, 1)
        .toUpperCase();

    return isChar(c) ? c : '#';
}

export class MemberDataSource {
    _data: SectionData;
    _sections: string[];

    constructor(
        private member: IMemberOverviewFragment[],
        private _filter: Predicate = Predicates.all,
        private sortByField = 'lastname',
        private groupByfield = 'lastname') {

        // this._flat = [];
        this._data = [];
        this._sections = [];

        this.update();
    }

    set filter(predicate: Predicate) {
        this._filter = predicate;
    }

    set groupBy(field: string) {
        this.groupByfield = field;
    }

    set sortBy(field: string) {
        this.sortByField = field;
    }

    section(s: string): IMemberOverviewFragment[] {
        return _(this._data)
            .filter(f => f.title == s)
            .map(t => t.data)
            .flatMap()
            .toArray()
            .value();
    }

    get sections(): string[] {
        return this._sections;
    }

    get data(): SectionData {
        return this._data;
    }

    update(member?: IMemberOverviewFragment[]) {
        this.member = member || this.member;
        this.calc();
    }

    calc() {
        // we preserve all array instances
        // only array, not instances are duplicated
        const old = [...this._data];

        this._data.splice(0, this._data.length);
        this._data.push(... _(this.member)
            .filter(this._filter || Predicates.all())
            .sortBy(t => (t[this.sortByField] || '').toUpperCase())
            .groupBy(t => sectionFrom(t[this.groupByfield]))
            .mapValues(t => {
                const newId = sectionFrom(t[0][this.groupByfield]);
                const section = _.find(old, s => s.title == newId) || {
                    title: newId,
                    data: [],
                };

                section.data.splice(0, section.data.length);
                section.data.push(...t);

                return section;
            })
            .sortBy(s => isChar(s.title) ? s.title : 'a') // A < a
            .toArray()
            .value(),
        );

        this._sections.splice(0, this._sections.length);
        this._sections.push(... _(this._data)
            .map(s => s.title)
            .toArray()
            .value(),
        );
    }
}
