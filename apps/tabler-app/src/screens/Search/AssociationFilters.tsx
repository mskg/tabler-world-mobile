import { filter, orderBy } from 'lodash';
import React from 'react';
import { Query } from 'react-apollo';
import { View } from 'react-native';
import { Divider, Theme, withTheme } from 'react-native-paper';
import { FilterSection, FilterTag, FilterTagType } from '../../components/FilterSection';
import { InlineLoading } from '../../components/Loading';
import { I18N } from '../../i18n/translation';
import { AreasAndClubsFilters, AreasAndClubsFiltersVariables, AreasAndClubsFilters_Clubs } from '../../model/graphql/AreasAndClubsFilters';
import { GetAreasAndClubsFiltersQuery } from '../../queries/Search/GetAreasAndClubsFiltersQuery';
import { createApolloContext } from '../../helper/createApolloContext';

// const logger = new Logger(Categories.Screens.Search);

type OwnProps = {
    theme: Theme,
    filterTags: FilterTag[],
    toggleTag: (type: FilterTagType, value: string) => void,
};

type StateProps = {
};

type DispatchPros = {
    // fetchPolicy: any,
};

type Props = OwnProps & StateProps & DispatchPros;

class AssociationFiltersBase extends React.Component<Props> {
    render() {
        const association = this.props.filterTags.filter((t) => t.type === 'association');
        if (association.length !== 1) {
            return null;
        }

        const areas = this.props.filterTags.filter((t) => t.type === 'area');

        return (
            <Query<AreasAndClubsFilters, AreasAndClubsFiltersVariables>
                query={GetAreasAndClubsFiltersQuery}
                fetchPolicy={'cache-and-network'}
                variables={{ association: association[0].id || '' }}
                context={createApolloContext('AssociationFilterBase')}
            >
                {({ data, error }) => {
                    // ok for now
                    if (error) return null;

                    if (data == null
                        || data.Areas == null
                        || data.Clubs == null) {
                        return (<View style={{ marginHorizontal: 16 }}><InlineLoading /></View>);
                    }

                    const filteredClubs = orderBy(
                        filter(
                            data.Clubs,
                            (c: AreasAndClubsFilters_Clubs) => areas.length === 0 || areas.find((a) => a.id === c.area.id) != null,
                        ),
                        (a: AreasAndClubsFilters_Clubs) => a.name.substring(a.name.indexOf(' ')),
                    );

                    return (
                        <>
                            <FilterSection
                                title={I18N.pluralize(I18N.Screen_Search.areas, data.Areas.length)}
                                type="area"
                                filter={this.props.filterTags}
                                data={data.Areas}
                                onToggle={this.props.toggleTag}
                                theme={this.props.theme}
                            />

                            <Divider />
                            <FilterSection
                                title={I18N.pluralize(I18N.Screen_Search.tables, filteredClubs.length)}
                                type="table"
                                filter={this.props.filterTags}
                                data={filteredClubs}
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

export const AssociationFilters = withTheme(AssociationFiltersBase);
