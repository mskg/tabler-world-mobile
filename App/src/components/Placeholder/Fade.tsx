import React from 'react';
import { Animated } from 'react-native';

const START_VALUE = 0.5;
const END_VALUE = 1;
const DURATION = 500;
const useNativeDriver = true;

type Props = {
  children: any,
  style?: any
};

const animation = new Animated.Value(START_VALUE);
let running = 0;

function start() {
  Animated.sequence([
    Animated.timing(animation, {
      toValue: END_VALUE,
      duration: DURATION,
      useNativeDriver,
    }),
    Animated.timing(animation, {
      toValue: START_VALUE,
      duration: DURATION,
      useNativeDriver,
    }),
  ]).start((e) => {
    if (e.finished) {
      if (running !== 0) {
        start();
      }
    }
  });
}

export class Fade extends React.PureComponent<Props> {
  componentWillUnmount() {
    running--;
  }

  componentDidMount() {
    if (++running === 1) {
      start();
    }
  }

  render() {
    const customStyle = { opacity: animation };

    return (
      <Animated.View style={[this.props.style, customStyle]}>
        {this.props.children}
      </Animated.View>
    );
  }
}