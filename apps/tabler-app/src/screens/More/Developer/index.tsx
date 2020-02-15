import React from 'react';
import { ScrollView, View } from 'react-native';
import { Theme, withTheme } from 'react-native-paper';
import { ScreenWithHeader } from '../../../components/Screen';
import { DeveloperSection } from './DeveloperSection';
import { TranslationSection } from './TranslationSection';

type Props = {
    theme: Theme,
};

type State = {
};

class DevelopmentScreenBase extends React.Component<Props, State> {
    render() {
        return (
            <ScreenWithHeader header={{ title: 'Developer', showBack: true }}>
                <ScrollView>
                    <DeveloperSection />
                    <TranslationSection />

                    <View style={{ height: 50 }} />
                </ScrollView>
            </ScreenWithHeader>
        );
    }
}

// tslint:disable-next-line: export-name
export const DevelopmentScreen = withTheme(DevelopmentScreenBase);
