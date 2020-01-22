import React from 'react';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import { AssociationTabs } from './Structure/AssociationTabs';
import { StructureParams } from './Structure/StructureParams';
import { withTheme, Theme } from 'react-native-paper';
import { View } from 'react-native';

class StructureByAssociationBase extends React.Component<NavigationInjectedProps<StructureParams> & { theme: Theme }> {
    static router = AssociationTabs.router;

    constructor(props) {
        super(props);
    }

    // tslint:disable-next-line: no-empty
    componentDidMount() {
    }

    render() {
        return (
            <View style={{ flex: 1, backgroundColor: this.props.theme.colors.background }}>
                <AssociationTabs
                    navigation={this.props.navigation}
                    screenProps={{
                        association: this.props.navigation.getParam('association'),
                        associationName: this.props.navigation.getParam('associationName'),
                    }}
                />
            </View>
        );
    }
}

// tslint:disable-next-line: export-name
export default withNavigation(withTheme(StructureByAssociationBase));
