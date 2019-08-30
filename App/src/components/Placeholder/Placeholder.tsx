import React from 'react';

type Props = {
    ready: boolean,
    previewComponent: React.ReactNode,
    children?: any,
}

export class Placeholder extends React.PureComponent<Props> {
    render() {
        if (this.props.ready) return this.props.children || null;
        return this.props.previewComponent;
    }
}