import { WatchQueryFetchPolicy } from 'apollo-client';
import { sortBy, values } from 'lodash';
import React from 'react';
import { Query } from 'react-apollo';
import { View } from 'react-native';
import { Divider, Theme, withTheme } from 'react-native-paper';
import { FilterSection, FilterTag, FilterTagType } from '../../components/FilterSection';
import { InlineLoading } from '../../components/Loading';
import { createApolloContext } from '../../helper/createApolloContext';
import { I18N } from '../../i18n/translation';
import { MeAnFamiliesFilter } from '../../model/graphql/MeAnFamiliesFilter';
import { GetMeAnFamiliesFilterQuery } from '../../queries/Search/GetMeAnFamiliesFilterQuery';
import { FamilyFilters } from './FamilyFilters';
import { logger } from './logger';

type OwnProps = {
    theme: Theme,
    filterTags: FilterTag[],
    fetchPolicy?: WatchQueryFetchPolicy,

    toggleTag: (type: FilterTagType, value: string) => void,
    toggleFamily: (type: FilterTagType, value: string) => void,
    toggleAssociation: (type: FilterTagType, value: string) => void,
};

type StateProps = {
};

type DispatchPros = {
    // fetchPolicy: any,
};

type Props = OwnProps & StateProps & DispatchPros;

class FiltersBase extends React.Component<Props> {
    render() {

        return (
            <Query<MeAnFamiliesFilter>
                query={GetMeAnFamiliesFilterQuery}
                fetchPolicy={this.props.fetchPolicy}
                context={createApolloContext('FamilyFilters')}
            >
                {({ data, error }) => {
                    // ok for now
                    if (error) {
                        logger.log('failed to query filter', error);
                        return null;
                    }

                    if (data == null
                        || data.Families == null
                    ) {
                        return (<View style={{ marginHorizontal: 16 }}><InlineLoading /></View>);
                    }

                    return (
                        <>
                            <FilterSection
                                title={I18N.pluralize(I18N.Screen_Search.families, data.Families.length)}
                                type="family"
                                filter={this.props.filterTags}
                                data={sortBy(data.Families, (a) => a.id === data?.Me.family.id ? 'A' : a.name)}
                                onToggle={this.props.toggleFamily}
                                theme={this.props.theme}
                            />
                            <Divider />

                            <FamilyFilters
                                meAssociatonId={data.Me.association.id}
                                filterTags={this.props.filterTags}
                                toggleTag={this.props.toggleTag}
                                toggleAssociation={this.props.toggleAssociation}
                            />

                            <FilterSection
                                title={I18N.pluralize(I18N.Screen_Search.sectors, Object.keys(I18N.Sectors).length)}
                                type="sector"
                                filter={this.props.filterTags}
                                data={values(I18N.Sectors).sort()}
                                onToggle={this.props.toggleTag}
                                theme={this.props.theme}
                            />
                            <Divider />
                        </>
                    );
                }}
            </Query>
        );
    }
}

export const Filters = withTheme(FiltersBase);
