import _ from 'lodash';
import React from 'react';
import { Query } from 'react-apollo';
import { Theme, withTheme } from 'react-native-paper';
import { connect } from 'react-redux';
import { FilterTag } from '../../components/FilterSection';
import { MemberList } from '../../components/MemberList';
import { OfflineMembers } from '../../model/graphql/OfflineMembers';
import { IAppState } from '../../model/IAppState';
import { GetOfflineMembersQuery } from '../../queries/Member/GetOfflineMembersQuery';
import { Predicates } from '../Members/Predicates';
import { logger } from './logger';

type State = {
};

type OwnProps = {
    theme: Theme,

    filterTags: FilterTag[],
    query: string,

    itemSelected: (item) => void,
};

type StateProps = {
};

type DispatchPros = {
    sortby: string,
};

type Props = OwnProps & StateProps & DispatchPros;

class OfflineSearchQueryBase extends React.Component<Props, State> {
    _keyExtractor = (item: string) => item;

    memoize(func: (data: OfflineMembers | undefined) => any) {
        let result;
        let cachedData: OfflineMembers;

        return (newData: OfflineMembers | undefined) => {
            if (newData != null && (cachedData == null
                || newData.OwnTable != cachedData.OwnTable
                || newData.FavoriteMembers != cachedData.FavoriteMembers
            )) {
                logger.log('calculating new data');

                result = func(newData);
                cachedData = newData;
            }

            return result;
        };
    }

    render() {
        const result = this.memoize(
            (data) => {
                const finalResult: any[] = [];
                if (data && data.OwnTable) { finalResult.push(...data.OwnTable); }
                if (data && data.FavoriteMembers) { finalResult.push(...data.FavoriteMembers); }

                const roles = this.props.filterTags.filter((r) => r.type === 'role').reduce((p, v) => { p[v.value] = true; return p; }, {});
                const tables = this.props.filterTags.filter((r) => r.type === 'table').reduce((p, v) => { p[v.value] = true; return p; }, {});
                const areas = this.props.filterTags.filter((r) => r.type === 'area').reduce((p, v) => { p[v.value] = true; return p; }, {});
                const associations = this.props.filterTags.filter((r) => r.type === 'association').reduce((p, v) => { p[v.value] = true; return p; }, {});

                // const newData = result
                const predicate = Predicates.and(
                    Predicates.text(this.props.query),
                    Object.keys(roles).length > 0 ? Predicates.role(roles) : null,
                    Object.keys(tables).length > 0 ? Predicates.table(tables) : null,
                    Object.keys(areas).length > 0 ? Predicates.area(areas) : null,
                    Object.keys(associations).length > 0 ? Predicates.association(associations) : null,
                );

                return _(finalResult)
                    .filter(predicate)
                    .uniqBy((m) => m.id)
                    .sortBy(this.props.sortby)
                    .toArray()
                    .value();
            });

        return (
            <Query<OfflineMembers>
                query={GetOfflineMembersQuery}
                fetchPolicy="cache-only"
            >
                {({ data, error }) => {
                    if (error) throw error;

                    return (
                        <MemberList
                            data={result(data)}
                            onItemSelected={this.props.itemSelected}
                        />
                    );
                }}
            </Query>
        );

    }
}

// tslint:disable-next-line: export-name
export const OfflineSearchQuery =
    connect((state: IAppState) => ({
        sortby: state.settings.sortByLastName ? 'lastname' : 'firstname',
    }))(withTheme(OfflineSearchQueryBase))
    ;
