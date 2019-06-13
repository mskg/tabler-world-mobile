import React from 'react';
import { Fade } from './Fade';

type Props = {
    ready: boolean,
    previewComponent: React.ReactNode,
    children: any,
}

export class Placeholder extends React.PureComponent<Props> {
    render() {
        if (this.props.ready) return this.props.children || null;
        return (<Fade>
            {this.props.previewComponent}
        </Fade>);
    }
}