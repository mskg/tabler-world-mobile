import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Query } from 'react-apollo';
import { Dimensions, View } from 'react-native';
import { FAB, Subheading, Surface, Theme, Title, withTheme } from 'react-native-paper';
import { NavigationInjectedProps, ScrollView } from 'react-navigation';
import { connect } from 'react-redux';
import { AuditedScreen } from '../../analytics/AuditedScreen';
import { AuditPropertyNames } from '../../analytics/AuditPropertyNames';
import { AuditScreenName } from '../../analytics/AuditScreenName';
import { withWhoopsErrorBoundary } from '../../components/ErrorBoundary';
import { HTMLView } from '../../components/HTMLView';
import { FullScreenLoading } from '../../components/Loading';
import { MemberAvatar } from '../../components/MemberAvatar';
import { ScreenWithHeader } from '../../components/Screen';
import { withCacheInvalidation } from '../../helper/cache/withCacheInvalidation';
import { I18N } from '../../i18n/translation';
import { NewsArticle, NewsArticleVariables } from '../../model/graphql/NewsArticle';
import { GetNewsArticleQuery } from '../../queries/News/GetNewsArticleQuery';
import { INewsArticleParams, showAlbum } from '../../redux/actions/navigation';
import { styles } from '../More/News/Styles';
import { QueryFailedError } from '../../helper/QueryFailedError';
import { createApolloContext } from '../../helper/createApolloContext';

// const logger = new Logger(Categories.Screens.News);

type State = {};

type Props = {
    theme: Theme,
    navigation: any,
    fetchPolicy: any,

    showAlbum: typeof showAlbum,
} & NavigationInjectedProps<INewsArticleParams>;

class NewsArticleScreenBase extends AuditedScreen<Props, State> {
    constructor(props) {
        super(props, AuditScreenName.NewsArticle);
    }

    componentDidMount() {
        const { id } = this.props.navigation.state.params as INewsArticleParams;

        this.audit.submit({
            [AuditPropertyNames.NewsArticle]: id.toString(),
        });
    }

    render() {
        const { id } = this.props.navigation.state.params as INewsArticleParams;

        return (
            <Query<NewsArticle, NewsArticleVariables>
                query={GetNewsArticleQuery}
                fetchPolicy={this.props.fetchPolicy}
                variables={{
                    id,
                }}
                context={createApolloContext('NewsArticleScreenBase')}
            >
                {({ error, data }) => {
                    if (error) throw new QueryFailedError(error);

                    return (
                        <ScreenWithHeader
                            header={{
                                // title: data != null && data.NewsArticle != null ? data.NewsArticle.name : I18N.News.title,
                                title: I18N.Screen_News.title,
                                showBack: true,
                            }}
                        >
                            <Surface style={[styles.outerContainer, { flexGrow: 1 }]}>
                                {!data || !data.NewsArticle &&
                                    <FullScreenLoading />
                                }

                                {data && data.NewsArticle &&
                                    <ScrollView>
                                        <Title>{data.NewsArticle.name}</Title>

                                        <View style={styles.author}>
                                            <MemberAvatar size={32} member={data.NewsArticle.createdby} />
                                            <Subheading style={styles.authorIcon}>
                                                {`${data.NewsArticle.createdby.firstname} ${data.NewsArticle.createdby.lastname}`}
                                            </Subheading>

                                            {data.NewsArticle.album &&
                                                <View style={styles.images}>
                                                    <FAB
                                                        icon={
                                                            ({ size, color }) => <Ionicons name="md-camera" size={size} color={color} />
                                                        }
                                                        onPress={
                                                            () => {
                                                                if (data && data.NewsArticle && data.NewsArticle.album) {
                                                                    this.props.showAlbum(data.NewsArticle.album.id);
                                                                }
                                                            }
                                                        }
                                                    />
                                                </View>
                                            }
                                        </View>
                                        <View style={styles.text}>
                                            <HTMLView
                                                maxWidth={Dimensions.get('window').width - 16 * 2}
                                                html={data.NewsArticle.description}
                                            />
                                        </View>
                                    </ScrollView>
                                }

                            </Surface>
                        </ScreenWithHeader>
                    );
                }}
            </Query>
        );
    }
}


// tslint:disable-next-line: export-name
export const NewsArticleScreen =
    withWhoopsErrorBoundary(
        withCacheInvalidation(
            'newsarticle',
            withTheme(
                connect(null, { showAlbum })(NewsArticleScreenBase))));
