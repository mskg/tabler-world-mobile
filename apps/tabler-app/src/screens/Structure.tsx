import React from 'react';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import { AssociationTabs } from './Structure/AssociationTabs';
import { StructureParams } from './Structure/StructureParams';

class StructureByAssociationBase extends React.Component<NavigationInjectedProps<StructureParams>> {
    static router = AssociationTabs.router;

    constructor(props) {
        super(props);
    }

    // tslint:disable-next-line: no-empty
    componentDidMount() {
    }

    render() {
        return (
            <AssociationTabs
                navigation={this.props.navigation}
                screenProps={{
                    association: this.props.navigation.getParam('association'),
                    associationName: this.props.navigation.getParam('associationName'),
                }}
            />
        );
    }
}

// tslint:disable-next-line: export-name
export default withNavigation(StructureByAssociationBase);
