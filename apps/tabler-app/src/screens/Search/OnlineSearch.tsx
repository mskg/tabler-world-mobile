import _ from 'lodash';
import React from 'react';
import { Query } from 'react-apollo';
import { Theme, withTheme } from 'react-native-paper';
import { FilterTag } from '../../components/FilterSection';
import { MemberList } from '../../components/MemberList';
import { I18N } from '../../i18n/translation';
import { CompanySector } from '../../model/graphql/globalTypes';
import { SearchMember, SearchMemberVariables } from '../../model/graphql/SearchMember';
import { SearchMemberQuery } from '../../queries/SearchMemberQuery';
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
};

type Props = OwnProps & StateProps & DispatchPros;

class OnlineSearchQueryBase extends React.Component<Props, State> {
    _keyExtractor = (item: string) => item;

    render() {
        return (
            <Query<SearchMember, SearchMemberVariables> query={SearchMemberQuery} fetchPolicy="network-only" variables={{
                text: this.props.query,
                after: null,
                areas: this.props.filterTags.filter((f: FilterTag) => f.type === 'area').map((f: FilterTag) => f.value),
                clubs: this.props.filterTags.filter((f: FilterTag) => f.type === 'table').map((f: FilterTag) => f.value),
                roles: this.props.filterTags.filter((f: FilterTag) => f.type === 'role').map((f: FilterTag) => f.value),
                sectors: this.props.filterTags.filter((f: FilterTag) => f.type === 'sector').map((f: FilterTag) =>
                    _(I18N.Search.sectorNames).findKey(v => v == f.value) as CompanySector,
                ),
            }}
            >
                {({ loading, data, fetchMore, error, refetch }) => {
                    if (error) throw error;

                    const result = data && data.SearchMember != null ? data.SearchMember : null;
                    const newData = result ? result.nodes : [];

                    return (
                        <MemberList
                            data={newData}

                            onItemSelected={this.props.itemSelected}
                            refreshing={loading}
                            onRefresh={refetch}

                            onEndReached={() => {
                                logger.log('Cursor is', result ? result.pageInfo : null);

                                fetchMore({
                                    variables: {
                                        text: this.props.query,
                                        after: result ? result.pageInfo.endCursor : null,
                                        areas: this.props.filterTags.filter((f: FilterTag) => f.type === 'area').map((f: FilterTag) => f.value),
                                        clubs: this.props.filterTags.filter((f: FilterTag) => f.type === 'table').map((f: FilterTag) => f.value),
                                        roles: this.props.filterTags.filter((f: FilterTag) => f.type === 'role').map((f: FilterTag) => f.value),
                                        sectors: this.props.filterTags.filter((f: FilterTag) => f.type === 'sector').map((f: FilterTag) =>
                                            _(I18N.Search.sectorNames).findKey(v => v == f.value) as CompanySector,
                                        ),
                                    },

                                    updateQuery: (previousResult, { fetchMoreResult }) => {
                                        // Don't do anything if there weren't any new items
                                        if (!fetchMoreResult || fetchMoreResult.SearchMember.nodes.length == 0) {

                                            logger.log('no new data');
                                            return previousResult;
                                        }

                                        logger.log('appending', fetchMoreResult.SearchMember.nodes.length);

                                        return {
                                            // There are bugs that the calls are excuted twice
                                            // a lot of notes on the internet
                                            SearchMember: {
                                                ...fetchMoreResult.SearchMember,
                                                nodes:
                                                    _([...previousResult.SearchMember.nodes, ...fetchMoreResult.SearchMember.nodes])
                                                        .uniqBy(f => f.id)
                                                        .toArray()
                                                        .value(),
                                            },
                                        };
                                    },
                                });
                            }}
                        />
                    );
                }}
            </Query>
        );

    }
}

export const OnlineSearchQuery = withTheme(OnlineSearchQueryBase);
