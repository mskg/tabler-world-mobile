import { filter, orderBy, sortBy } from 'lodash';
import React from 'react';
import { Query } from 'react-apollo';
import { View } from 'react-native';
import { Divider, Theme, withTheme } from 'react-native-paper';
import { FilterSection, FilterTag, FilterTagType } from '../../components/FilterSection';
import { InlineLoading } from '../../components/Loading';
import { I18N } from '../../i18n/translation';
import { AssociationsAndRolesFiltersVariables, AssociationsAndRolesFilters } from '../../model/graphql/AssociationsAndRolesFilters';
import { GetAssociationsAndRolesFiltersQuery } from '../../queries/Search/GetAssociationsAndRolesFiltersQuery';
import { createApolloContext } from '../../helper/createApolloContext';
import { AssociationFilters } from './AssociationFilters';

// const logger = new Logger(Categories.Screens.Search);

type OwnProps = {
    theme: Theme,
    filterTags: FilterTag[],

    meAssociatonId: string,

    toggleAssociation: (type: FilterTagType, value: string) => void,
    toggleTag: (type: FilterTagType, value: string) => void,
};

type StateProps = {
};

type DispatchPros = {
    // fetchPolicy: any,
};

type Props = OwnProps & StateProps & DispatchPros;

class FamilyFiltersBase extends React.Component<Props> {
    render() {
        const family = this.props.filterTags.filter((t) => t.type === 'family');
        if (family.length !== 1) {
            return null;
        }

        return (
            <Query<AssociationsAndRolesFilters, AssociationsAndRolesFiltersVariables>
                query={GetAssociationsAndRolesFiltersQuery}
                fetchPolicy={'cache-and-network'}
                variables={{ family: family[0].id || '' }}
                context={createApolloContext('FamilyFiltersBase')}
            >
                {({ data, error }) => {
                    // ok for now
                    if (error) return null;

                    if (data == null
                        || data.Associations == null
                        || data.Roles == null) {
                        return (<View style={{ marginHorizontal: 16 }}><InlineLoading /></View>);
                    }

                    return (
                        <>
                            <FilterSection
                                title={I18N.pluralize(I18N.Screen_Search.associations, data.Associations.length)}
                                type="association"
                                filter={this.props.filterTags}
                                data={sortBy(data.Associations, (a) => a.id === this.props.meAssociatonId ? 'A' : a.name)}
                                onToggle={this.props.toggleAssociation}
                                theme={this.props.theme}
                            />
                            <Divider />

                            <AssociationFilters
                                filterTags={this.props.filterTags}
                                toggleTag={this.props.toggleTag}
                            />

                            <FilterSection
                                title={I18N.pluralize(I18N.Screen_Search.roles, data.Roles.length)}
                                type="role"
                                filter={this.props.filterTags}
                                data={data.Roles}
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

export const FamilyFilters = withTheme(FamilyFiltersBase);
