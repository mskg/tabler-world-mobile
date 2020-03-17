import React from 'react';

export class TimerLabel extends React.PureComponent<{
    format: () => any;
}> {
    timer?: number;

    async componentDidMount() {
        this.timer = setInterval(
            () => requestAnimationFrame(() => this.forceUpdate()),
            10000,
        );
    }

    componentWillUnmount() {
        if (this.timer) {
            clearInterval(this.timer);
        }
    }

    render() {
        return this.props.format();
    }
}
