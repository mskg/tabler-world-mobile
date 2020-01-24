import React from 'react';

type State = {
    isRefreshing: boolean,
};

type CreateFunc<T> = (func: () => Promise<any>) => () => Promise<T>;

type RenderFunc<T> = (
    args: {
        isRefreshing: boolean,

        // setLoading: (isLoading: boolean) => void,
        createRunRefresh: CreateFunc<T>,
    },
) => any;

type Props<T> = {
    children: RenderFunc<T>;
};

/**
 * Keeps track of loading and refresh actions
 */
export class RefreshTracker<T = void> extends React.PureComponent<Props<T>, State> {
    state: State = {
        isRefreshing: false,
    };

    createRunLoading<RT>(func: () => Promise<any>): () => Promise<RT> {
        return async () => {
            this.setState({ isRefreshing: true });
            try {
                return await func();
            } finally {
                this.setState({ isRefreshing: false });
            }
        };
    }

    // _setIsLoading = (isLoading) => this.setState({ isLoading });

    render() {
        return this.props.children({
            isRefreshing: this.state.isRefreshing,
            // setLoading: this._setIsLoading,
            createRunRefresh: this.createRunLoading.bind(this),
        });
    }
}
