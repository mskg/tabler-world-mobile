
import React from 'react';
import { AppearanceProvider } from 'react-native-appearance';

export function withAppearanceProvider(WrappedComponent) {
    return () => {
        return (
            <AppearanceProvider>
                <WrappedComponent />
            </AppearanceProvider>
        );
    };
}
