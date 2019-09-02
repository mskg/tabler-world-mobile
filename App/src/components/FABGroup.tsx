import color from 'color';
import * as React from 'react';
import { Animated, SafeAreaView, StatusBar, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import { Card, FAB, IconSource, Theme, withTheme } from 'react-native-paper';

type Props = {
    actions: Array<{
      icon: IconSource,
      label?: string,
      color?: string,
      accessibilityLabel?: string,
      style?: any,
      onPress: () => any,
  }>,

    icon: IconSource,
    accessibilityLabel?: string,
    color?: string,
    onPress?: () => any,
    open: boolean,
    onStateChange: (state: { open: boolean }) => any,
    visible?: boolean,

    direction?: 'top-down' | 'bottom-up',
    hideBackdrop?: boolean,

    style?: any,
    fabStyle?: any,
    areaStyle?: any,

    theme: Theme,
};

type State = {
    backdrop: Animated.Value,
    animations: Animated.Value[],
};

class FABGroupBase extends React.Component<Props, State> {
    static displayName = 'FAB.Group';

    static getDerivedStateFromProps(nextProps, prevState) {
      return {
        animations: nextProps.actions.map(
        (_, i) =>
          prevState.animations[i] || new Animated.Value(nextProps.open ? 1 : 0),
      ),
    };
  }

    state = {
      backdrop: new Animated.Value(0),
      animations: [],
  };

    componentDidUpdate(prevProps) {
      if (this.props.open === prevProps.open) {
        return;
    }

      if (this.props.open) {
        Animated.parallel([
          Animated.timing(this.state.backdrop, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
        }),
          Animated.stagger(
          50,
          this.state.animations
            .map(animation =>
              Animated.timing(animation, {
                  toValue: 1,
                  duration: 150,
                  useNativeDriver: true,
              }),
            )
            .reverse(),
        ),
      ]).start();
    } else {
        Animated.parallel([
          Animated.timing(this.state.backdrop, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }),
          ...this.state.animations.map(animation =>
          Animated.timing(animation, {
              toValue: 0,
              duration: 150,
              useNativeDriver: true,
          }),
        ),
      ]).start();
    }
  }

    _close = () => this.props.onStateChange({ open: false });

    _toggle = () => this.props.onStateChange({ open: !this.props.open });

    render() {
      const {
      actions,
      icon,
      open,
      onPress,
      accessibilityLabel,
      theme,
      style,
      fabStyle,
      visible,
      areaStyle,
    } = this.props;
      const { colors } = theme;

      const labelColor = theme.dark
      ? colors.text
      : color(colors.text)
        .fade(0.54)
        .rgb()
        .string();
      const backdropOpacity = open
      ? this.state.backdrop.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 0.65],
      })
      : this.state.backdrop;

      const opacities = this.state.animations;
      const scales = opacities.map(
      opacity =>
        open
          ? opacity.interpolate({
              inputRange: [0, 1],
              outputRange: [0.8, 1],
          })
          : 1,
    );

      return (
      <View pointerEvents="box-none" style={[styles.container, style]}>
        {open ? <StatusBar barStyle="light-content" /> : null}
        <TouchableWithoutFeedback onPress={this._close}>
          <Animated.View
            pointerEvents={open ? 'auto' : 'none'}
            style={[
                styles.backdrop,
                this.props.hideBackdrop ? undefined : {
                  opacity: backdropOpacity,
                  backgroundColor: colors.backdrop,
              },
            ]}
          />
        </TouchableWithoutFeedback>
        <SafeAreaView pointerEvents="box-none" style={[styles.safeArea, areaStyle]}>
          {this.props.direction !== 'bottom-up' &&
            <FAB
              onPress={() => {
                  onPress && onPress();
                  this._toggle();
              }}
              icon={icon}
              color={this.props.color}
              accessibilityLabel={accessibilityLabel}
              accessibilityTraits="button"
              accessibilityComponentType="button"
              accessibilityRole="button"
              style={[styles.fab, fabStyle]}
              visible={visible}
            />
          }

          <View pointerEvents={open ? 'box-none' : 'none'}>
            {actions.map((it, i) => (
              <View
                key={i} // eslint-disable-line react/no-array-index-key
                style={styles.item}
                pointerEvents="box-none"
              >
                {it.label && (
                  <Card
                    style={[
                        styles.label,
                        {
                            transform: [{ scale: this.props.direction == 'bottom-up' ? scales[i] : scales[actions.length - 1 - i] }],
                            opacity: this.props.direction == 'bottom-up' ? opacities[i] : opacities[actions.length - 1 - i],
                        },
                    ]}
                    onPress={() => {
                        it.onPress();
                        this._close();
                    }}
                    accessibilityLabel={
                      it.accessibilityLabel !== 'undefined'
                        ? it.accessibilityLabel
                        : it.label
                    }
                    accessibilityTraits="button"
                    accessibilityComponentType="button"
                    accessibilityRole="button"
                  >
                    <Text style={{ color: labelColor }}>{it.label}</Text>
                  </Card>
                )}
                <FAB
                  small={true}
                  icon={it.icon}
                  color={it.color}
                  style={[
                      {
                          transform: [{ scale: this.props.direction == 'bottom-up' ? scales[i] : scales[actions.length - 1 - i] }],
                          opacity: this.props.direction == 'bottom-up' ? opacities[i] : opacities[actions.length - 1 - i],
                          backgroundColor: theme.colors.surface,
                      },
                      it.style,
                  ]}
                  onPress={() => {
                      it.onPress();
                      this._close();
                  }}
                  accessibilityLabel={
                    typeof it.accessibilityLabel !== 'undefined'
                      ? it.accessibilityLabel
                      : it.label
                  }
                  accessibilityTraits="button"
                  accessibilityComponentType="button"
                  accessibilityRole="button"
                />
              </View>
            ))}
          </View>
          {this.props.direction === 'bottom-up' &&
            <FAB
              onPress={() => {
                  onPress && onPress();
                  this._toggle();
              }}
              icon={icon}
              color={this.props.color}
              accessibilityLabel={accessibilityLabel}
              accessibilityTraits="button"
              accessibilityComponentType="button"
              accessibilityRole="button"
              style={[styles.fab, fabStyle]}
              visible={visible}
            />
          }
        </SafeAreaView>
      </View>
    );
  }
}

export const FABGroup = withTheme(FABGroupBase);

const styles = StyleSheet.create({
    safeArea: {
      alignItems: 'flex-start',
    // backgroundColor: "red",
  },
    container: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'flex-start',
  },
    fab: {
      marginHorizontal: 16,
      marginBottom: 16,
  },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
  },
    label: {
      borderRadius: 5,
      paddingHorizontal: 12,
      paddingVertical: 6,
      marginVertical: 8,
      marginHorizontal: 16,
      elevation: 2,
  },
    item: {
      marginHorizontal: 24,
      marginBottom: 16,
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
  },
});
