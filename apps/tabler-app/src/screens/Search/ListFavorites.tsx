import _ from 'lodash';
import React from 'react';
import { Query } from 'react-apollo';
import { List, Theme, withTheme, Divider } from 'react-native-paper';
import { connect } from 'react-redux';
import { MemberList } from '../../components/MemberList';
import { OfflineMembers } from '../../model/graphql/OfflineMembers';
import { IAppState } from '../../model/IAppState';
import { GetOfflineMembersQuery } from '../../queries/Member/GetOfflineMembersQuery';
import { logger } from './logger';
import { I18N } from '../../i18n/translation';

type State = {
};

type OwnProps = {
    theme: Theme,
    itemSelected: (item) => void,
    contentContainerStyle?: any,
};

type StateProps = {
};

type DispatchPros = {
    sortby: string,
};

type Props = OwnProps & StateProps & DispatchPros;

class ListFavoritesBase extends React.Component<Props, State> {
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
                // if (data && data.OwnTable) { finalResult.push(...data.OwnTable); }
                if (data && data.FavoriteMembers) { finalResult.push(...data.FavoriteMembers); }

                return _(finalResult)
                    .filter((d) => d.availableForChat)
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
                    if (error) return null;

                    const r = result(data);
                    if (r.length === 0) {
                        return null;
                    }

                    return (
                        <List.Section style={{ flex: 1, flexBasis: '40%', }} title={I18N.Search.favorites}>
                            <Divider />
                            <MemberList
                                data={r}
                                onItemSelected={this.props.itemSelected}
                                contentContainerStyle={{ flexGrow: 1, paddingBottom: 16 }}
                            />
                        </List.Section>
                    );
                }}
            </Query>
        );

    }
}

// tslint:disable-next-line: export-name
export const ListFavorites =
    connect((state: IAppState) => ({
        sortby: state.settings.sortByLastName ? 'lastname' : 'firstname',
    }))(withTheme(ListFavoritesBase))
    ;
