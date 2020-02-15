import React from 'react';
import { Query } from 'react-apollo';
import { Dimensions, ScrollView, View } from 'react-native';
import { List, Theme, withTheme } from 'react-native-paper';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import { RoleAvatar } from '../../components/Club/RoleAvatar';
import { withCacheInvalidation } from '../../helper/cache/withCacheInvalidation';
import { I18N } from '../../i18n/translation';
import { LRUMembers } from '../../model/graphql/LRUMembers';
import { IAppState } from '../../model/IAppState';
import { GetLRUMembersQuery } from '../../queries/Search/GetLRUMembersQuery';
import { showProfile } from '../../redux/actions/navigation';
import _ from 'lodash';

// const logger = new Logger(Categories.Screens.Search);

type OwnProps = {
    navigation: any,
    theme: Theme,
};

type StateProps = {
    lru: number[],
};

type DispatchPros = {
    showProfile: typeof showProfile;
    fetchPolicy: any,
};

type Props = OwnProps & StateProps & DispatchPros;

const widthMax = Dimensions.get('window').width / 2 - 32 - 18;

class LRUBase extends React.Component<Props> {
    render() {
        if (this.props.lru == null || this.props.lru.length === 0) {
            return null;
        }

        return (
            <Query<LRUMembers>
                query={GetLRUMembersQuery}
                variables={{
                    ids: this.props.lru,
                }}
                fetchPolicy={this.props.fetchPolicy}
            >
                {({ data }) => {
                    if (data && data.Members != null && data.Members.length > 0) {
                        return (
                            <List.Section title={I18N.Screen_Search.lru}>
                                <View style={{ backgroundColor: this.props.theme.colors.surface }}>
                                    <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={{ marginLeft: 16, paddingTop: 8 }}>
                                        {
                                            // we must resort them based on the LRU list as they come
                                            // in named order from the server
                                            _(data.Members).sortBy((e) => this.props.lru.indexOf(e.id)).map((r) => (
                                                <View style={{ marginRight: 16, marginTop: 4, marginBottom: 12 }} key={r.id}>
                                                    <RoleAvatar
                                                        member={r}
                                                        role={r.club.name}
                                                        width={widthMax}
                                                    />
                                                </View>
                                            )).value()
                                        }
                                    </ScrollView>
                                </View>
                            </List.Section>
                        );
                    }

                    return null;
                }}
            </Query>
        );
    }
}

export const LRU = connect(
    (state: IAppState) => ({
        lru: state.searchHistory.lru,
    }),
    { showProfile },
)(
    withCacheInvalidation(
        'members',
        withNavigation(
            withTheme(LRUBase))));
