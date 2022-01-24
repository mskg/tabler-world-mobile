import _ from 'lodash';
import React from 'react';
import { Query } from 'react-apollo';
import { Theme, withTheme } from 'react-native-paper';
import { FilterTag } from '../../components/FilterSection';
import { createApolloContext } from '../../helper/createApolloContext';
import { QueryFailedError } from '../../helper/QueryFailedError';
import { SearchDirectory, SearchDirectoryVariables, SearchDirectory_SearchDirectory_nodes } from '../../model/graphql/SearchDirectory';
import { SearchDirectoryQuery } from '../../queries/Search/SearchDirectoryQuery';
import { logger } from './logger';
import { StructureSearchList } from './StructureSearchList';

type State = {
};

type OwnProps = {
    theme: Theme,

    query: string,
    filterTags: FilterTag[],

    itemSelected: (item: SearchDirectory_SearchDirectory_nodes) => void,
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
            <Query<SearchDirectory, SearchDirectoryVariables>
                query={SearchDirectoryQuery}
                fetchPolicy="network-only"
                variables={{
                    text: this.props.query,
                    after: null,
                    families: this.props.filterTags.filter((f: FilterTag) => f.type === 'family').map((f: FilterTag) => f.id!),
                }}
                context={createApolloContext('OnlineSearchQuerybase')}
            >
                {({ loading, data, fetchMore, error, refetch }) => {
                    if (error) throw new QueryFailedError(error);

                    const result = data && data.SearchDirectory != null ? data.SearchDirectory : null;
                    const newData = result ? result.nodes : [];

                    return (
                        <StructureSearchList
                            data={newData}

                            onItemSelected={this.props.itemSelected}
                            refreshing={loading}
                            onRefresh={refetch}

                            onEndReached={() => {
                                logger.log('Cursor is', result?.pageInfo.hasNextPage);
                                if (!result?.pageInfo?.endCursor) return;

                                fetchMore({
                                    variables: {
                                        text: this.props.query,
                                        families: this.props.filterTags.filter((f: FilterTag) => f.type === 'family').map((f: FilterTag) => f.id!),
                                        after: result ? result.pageInfo.endCursor : null,
                                    },
                                    context: createApolloContext('OnlineSearchQuerybase-more'),

                                    updateQuery: (previousResult, { fetchMoreResult }) => {
                                        // Don't do anything if there weren't any new items
                                        if (!fetchMoreResult || fetchMoreResult.SearchDirectory.nodes.length === 0) {
                                            logger.log('no new data');
                                            return previousResult;
                                        }

                                        logger.log('appending', fetchMoreResult.SearchDirectory.nodes.length);

                                        return {
                                            // There are bugs that the calls are excuted twice
                                            // a lot of notes on the internet
                                            SearchDirectory: {
                                                ...fetchMoreResult.SearchDirectory,
                                                nodes:
                                                    _([...previousResult.SearchDirectory.nodes, ...fetchMoreResult.SearchDirectory.nodes])
                                                        .uniqBy((f) => `${f.__typename}::${f.id}`)
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

// tslint:disable-next-line: export-name
export const OnlineSearchQuery = withTheme(OnlineSearchQueryBase);
