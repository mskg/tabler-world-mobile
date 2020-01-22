import { sortBy, values } from 'lodash';
import React from 'react';
import { Query } from 'react-apollo';
import { View } from 'react-native';
import { Divider, Theme, withTheme } from 'react-native-paper';
import { FilterSection, FilterTag, FilterTagType } from '../../components/FilterSection';
import { InlineLoading } from '../../components/Loading';
import { I18N } from '../../i18n/translation';
import { AssociationsAndRolesFilters } from '../../model/graphql/AssociationsAndRolesFilters';
import { GetAssociationsAndRolesFiltersQuery } from '../../queries/Search/GetAssociationsAndRolesFiltersQuery';
import { AssociationFilters } from './AssociationFilters';
import { logger } from './logger';

type OwnProps = {
    theme: Theme,
    filterTags: FilterTag[],

    toggleTag: (type: FilterTagType, value: string) => void,
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
            <Query<AssociationsAndRolesFilters> query={GetAssociationsAndRolesFiltersQuery} fetchPolicy={this.props.fetchPolicy}>
                {({ data, error }) => {
                    // ok for now
                    if (error) {
                        logger.error(error, 'failed to query filter');
                        return null;
                    }

                    if (data == null
                        || data.Associations == null
                        || data.Roles == null
                    ) {
                        return (<View style={{ marginHorizontal: 16 }}><InlineLoading /></View>);
                    }

                    return (
                        <>
                            <FilterSection
                                title={I18N.Search.associations(data.Associations.length)}
                                type="association"
                                filter={this.props.filterTags}
                                data={sortBy(data.Associations, (a) => a.id === data?.Me.association.id ? 'A' : a.name)}
                                onToggle={this.props.toggleAssociation}
                                theme={this.props.theme}
                            />
                            <Divider />

                            <AssociationFilters
                                filterTags={this.props.filterTags}
                                toggleTag={this.props.toggleTag}
                            />

                            <FilterSection
                                title={I18N.Search.roles(data.Roles.length)}
                                type="role"
                                filter={this.props.filterTags}
                                data={data.Roles}
                                onToggle={this.props.toggleTag}
                                theme={this.props.theme}
                            />
                            <Divider />

                            <FilterSection
                                title={I18N.Search.sectors(Object.keys(I18N.Search.sectorNames).length)}
                                type="sector"
                                filter={this.props.filterTags}
                                data={values(I18N.Search.sectorNames).sort()}
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
