import { Updates } from 'expo';
import _ from 'lodash';
import React from 'react';
import { Alert, Platform, StyleSheet, View } from 'react-native';
import { Divider, List, Portal, Theme, withTheme } from 'react-native-paper';
import { cachedAolloClient } from '../../../apollo/bootstrapApollo';
import { FullScreenLoading } from '../../../components/Loading';
import { Categories, Logger } from '../../../helper/Logger';
import { refreshOverridenLanguage } from '../../../i18n/override/refreshOverridenLanguage';
import { clearOverridenLanguage, getOverridenLanguage, setOverridenLanguage } from '../../../i18n/overrideLanguage';
import { I18N } from '../../../i18n/translation';
import { GetMyRoles } from '../../../model/graphql/GetMyRoles';
import { UserRole } from '../../../model/graphql/globalTypes';
import { Languages } from '../../../model/graphql/Languages';
import { GetLanguagesQuery } from '../../../queries/Admin/GetLanguagesQuery';
import { GetMyRolesQuery } from '../../../queries/Admin/GetMyRolesQuery';
import { Action } from '../Settings/Action';
import { Element } from '../Settings/Element';
import { SelectionList } from '../Settings/SelectionList';

const logger = new Logger(Categories.Screens.Setting);

type State = {
    language: string,
    overriden: boolean,
    isDeveloper: boolean,
    languages?: any[] | null,
    wait?: boolean,
};

type OwnProps = {
    theme: Theme,
};

type StateProps = {
};

type DispatchPros = {
};

type Props = OwnProps & StateProps & DispatchPros;


class TranslationSectionBase extends React.Component<Props, State> {
    state: State = {
        isDeveloper: false,
        language: I18N.id,
        overriden: false,
        languages: [{
            label: I18N.id,
            value: I18N.id,
            key: I18N.id,
        }],
    };

    async componentDidMount() {
        try {
            const client = cachedAolloClient();
            const roles = await client.query<GetMyRoles>({
                query: GetMyRolesQuery,
                fetchPolicy: 'cache-first',
            });

            if (roles.data && roles.data.MyRoles && roles.data.MyRoles.find((i) => i === UserRole.i18n)) {
                this.setState({ isDeveloper: true });
            }
        } catch { }

        try {
            const client = cachedAolloClient();
            const data = await client.query<Languages>({
                query: GetLanguagesQuery,
            });

            if (data.data && data.data.Languages) {
                this.setState({
                    languages: _(data.data.Languages)
                        .sort()
                        .map((l) => ({
                            label: l,
                            value: l,
                            key: l,
                        }))
                        .value(),
                });
            }
        } catch { }

        this.setState({
            overriden: await getOverridenLanguage() != null,
        });
    }

    _refreshCurrentLanguage = () => this.refreshLanguage(I18N.id);

    async refreshLanguage(lang: string) {
        this.setState({ wait: true });

        logger.log('_changeLang', lang);
        try {
            await refreshOverridenLanguage(lang);

            Alert.alert(
                `Downloaded latest translations for language '${lang}'`,
                'Press OK to reload App',
                [
                    {
                        text: 'Cancel',
                        style: 'cancel',
                        onPress: () => {
                            this.setState({ language: I18N.id, wait: false });
                        },
                    },
                    {
                        text: 'OK',
                        style: 'destructive',
                        onPress: async () => {
                            await setOverridenLanguage(lang);
                            await Updates.reloadFromCache();
                        },
                    },
                ],
            );
        } catch (e) {
            logger.error(e, '_refreshLanguage');
            Alert.alert('Failed');

            this.setState({ wait: false, language: I18N.id });
        }
    }

    _changeLanguage = (language: string) => {
        this.setState({ language }, () => {
            // android does not fire OnClose
            if (Platform.OS === 'android') {
                this._setLanguage();
            }
        });
    }

    _setLanguage = () => {
        logger.log('_changeLang', this.state.language);

        if (this.state.language === I18N.id) { return; }
        this.refreshLanguage(this.state.language);
    }

    _resetLanguages = () => {
        Alert.alert(
            'Reset Language to Default?',
            'Press OK to reload App',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'OK',
                    style: 'destructive',
                    onPress: async () => {
                        await clearOverridenLanguage();
                        await Updates.reloadFromCache();
                    },
                },
            ],
        );
    }

    render() {
        return (
            <>
                {this.state.wait && (
                    <Portal>
                        <>
                            <View style={[StyleSheet.absoluteFill, { backgroundColor: this.props.theme.colors.backdrop, opacity: 0.8 }]} />
                            <FullScreenLoading />
                        </>
                    </Portal>
                )}

                {this.state.isDeveloper && (
                    <List.Section title={'Translation Settings'}>
                        <Element
                            theme={this.props.theme}
                            field={'Overriden?'}
                            text={this.state.overriden.toString()}
                        />
                        <Divider />

                        <SelectionList
                            theme={this.props.theme}
                            field={'Override Language'}
                            items={this.state.languages}
                            value={this.state.language}
                            onChange={this._changeLanguage}
                            onClose={this._setLanguage}
                        />
                        <Divider />

                        <Action theme={this.props.theme} text={'Refresh Current Translations'} onPress={this._refreshCurrentLanguage} />
                        <Divider />

                        <Action theme={this.props.theme} text={'Reset Translations to Default'} onPress={this._resetLanguages} />
                        <Divider />

                    </List.Section>
                )}
            </>
        );
    }
}

export const TranslationSection = withTheme(TranslationSectionBase);
