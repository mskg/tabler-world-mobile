import React from 'react';
import { Image, ImageBackground, View } from 'react-native';
import { Headline, Subheading } from 'react-native-paper';
import Assets from '../Assets';
import { styles } from './Styles';

export const Background = ({ children, color }) => (
    <ImageBackground
        source={Assets.images.background}
        resizeMode="cover"
        style={{ width: '100%', height: '100%', backgroundColor: color }}
    >
        {children}
    </ImageBackground>
);

export const Logo = () => (
    <View style={styles.heading}>
        <Image
            source={Assets.images.logo}
            style={styles.headingImage}
            resizeMode="contain"
        />
    </View>
);

export const Greeting = ({ title, subtitle }) => (
    <React.Fragment>
        <Headline style={styles.greeting}>{title}</Headline>
        <Subheading style={styles.greeting2}>{subtitle}</Subheading>
    </React.Fragment>
);

export const EMail = ({ subtitle }) => (
    <React.Fragment>
        <Subheading style={{...styles.greeting2, paddingTop: 10}}>{subtitle}</Subheading>
    </React.Fragment>
);
