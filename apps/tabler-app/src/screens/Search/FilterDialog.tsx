import React from 'react';
import { Modal, ScrollView, TouchableWithoutFeedback, View } from 'react-native';
import { Appbar, Divider, List, Theme, withTheme } from 'react-native-paper';
import { FilterTag, FilterTagType } from '../../components/FilterSection';
import ListSubheader from '../../components/ListSubheader';
import { I18N } from '../../i18n/translation';
import { Filters } from './Filters';
import { styles } from './styles';

type OwnProps = {
    theme: Theme,

    filterTags: FilterTag[],

    visible: boolean,
    hide: () => void,
    clear: () => void,

    toggleTag: (type: FilterTagType, value: string) => void,
    toggleAssociation: (type: FilterTagType, value: string) => void,
};

type StateProps = {
};

type DispatchPros = {
    // fetchPolicy: any,
};

type Props = OwnProps & StateProps & DispatchPros;

class FilterDialogBase extends React.Component<Props> {
    render() {

        return (
            <Modal
                visible={this.props.visible}
                transparent={true}
                onRequestClose={this.props.hide}
                animationType="fade"
            >
                <TouchableWithoutFeedback onPress={this.props.hide}>
                    <View
                        style={{
                            ...styles.overlay,
                            backgroundColor: this.props.theme.colors.backdrop,
                        }}
                    />
                </TouchableWithoutFeedback>

                <View
                    style={{
                        ...styles.popup,
                        backgroundColor: this.props.theme.colors.background,
                        borderColor: this.props.theme.colors.backdrop,
                    }}
                >
                    <List.Section>
                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                marginRight: 4,
                            }}
                        >
                            <ListSubheader>{I18N.Search.filter}</ListSubheader>
                            <Appbar.Action color={this.props.theme.colors.accent} icon={'clear'} onPress={this.props.clear} />
                        </View>
                        <ScrollView style={{ minHeight: '100%' }}>
                            <Divider />
                            <Filters
                                filterTags={this.props.filterTags}
                                toggleTag={this.props.toggleTag}
                                toggleAssociation={this.props.toggleAssociation}
                            />
                        </ScrollView>
                    </List.Section>
                </View>

                <View
                    style={{
                        ...styles.triangle,
                        borderBottomColor: this.props.theme.colors.background,
                    }}
                />
            </Modal>
        );
    }
}

export const FilterDialog = withTheme(FilterDialogBase);
