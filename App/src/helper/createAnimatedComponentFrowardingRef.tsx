import React from 'react';
import { Animated } from "react-native";
export default function createAnimatedComponentFrowardingRef<P, S>(Component: React.ComponentClass<P, S>) {
    return React.forwardRef<React.Component<P, S>, P>((props, ref) => {
        class Wrapper extends React.Component<P, S> {
            render() {
                return <Component {...this.props} ref={ref} />;
            }
        }
        const AnimatedWrapper = Animated.createAnimatedComponent(Wrapper);
        return <AnimatedWrapper {...props} />;
    });
}
