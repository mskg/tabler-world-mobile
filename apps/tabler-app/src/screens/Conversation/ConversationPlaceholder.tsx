import React from 'react';
import { View } from 'react-native';
import { Surface } from 'react-native-paper';
import { Line } from '../../components/Placeholder/Line';
import { Square } from '../../components/Placeholder/Square';

const Left = ({ children }) => (
    <View style={{ width: '100%', alignItems: 'flex-start' }}>
        {
            (Array.isArray(children) ? children : [children]).map((c, i, e) => React.cloneElement(c, {
                style: {
                    borderBottomLeftRadius: i === e.length - 1 ? undefined : 0,
                    borderTopLeftRadius: e.length > 1 && i > 0 ? 0 : undefined,
                    marginBottom: 2,
                },
            }))
        }
    </View>
);

const Right = ({ children }) => (
    <View style={{ width: '100%', alignItems: 'flex-end' }}>
        {
            (Array.isArray(children) ? children : [children]).map((c, i, e) => React.cloneElement(c, {
                style: {
                    borderBottomRightRadius: i === e.length - 1 ? undefined : 0,
                    borderTopRightRadius: e.length > 1 && i > 0 ? 0 : undefined,
                    marginBottom: 2,
                },
            }))
        }
    </View>
);

const Bubble = ({ width = 150, height = 50, style = {} }) => (
    <Square style={[{ borderRadius: 16 }, style]} width={width} height={height} />
);

const Day = () => (
    <View style={{ width: '100%', alignItems: 'center' }}>
        <Space />
        <Space />
        <Line width={125} />
        <Space />
        <Space />
    </View>
);

const Space = () => (
    <View style={{ height: 8 }} />
);

export const ConversationPlaceholder = () => (
    <Surface style={{ paddingVertical: 16, paddingHorizontal: 8 }}>
        <Left>
            <Bubble />
        </Left>
        <Space />

        <Right>
            <Bubble width={150} />
        </Right>
        <Space />

        <Left>
            <Bubble width={150} />
            <Bubble width={250} />
        </Left>
        <Space />

        <Right>
            <Bubble width={250} />
            <Bubble width={250} height={100} />
            <Bubble width={150} />
            <Bubble width={150} />
        </Right>
        <Space />

        <Day />

        <Left>
            <Bubble />
            <Bubble />
            <Bubble />
        </Left>

        <Day />

        <Right>
            <Bubble />
            <Bubble />
        </Right>
    </Surface>
);
