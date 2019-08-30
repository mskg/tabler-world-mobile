import React from 'react';

type Props = {
    ready: boolean,
    previewComponent: React.ReactNode,
    children?: any,
}

const TEST_PLACHOLDERS = false;

export class Placeholder extends React.PureComponent<Props> {
    render() {
        if (!TEST_PLACHOLDERS && this.props.ready) return this.props.children || null;
        return this.props.previewComponent;
    }
}