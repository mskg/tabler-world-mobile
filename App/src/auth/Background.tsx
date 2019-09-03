import React from 'react';
import { Image, ImageBackground, View } from 'react-native';
import { Headline, Subheading } from 'react-native-paper';
import Assets from '../Assets';
import { styles } from './Styles';

export const Background = ({ children }) => (
    <ImageBackground source={Assets.images.background} resizeMode="cover" style={{ width: '100%', height: '100%' }}>
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
