import React from 'react';
import { Theme } from 'react-native-paper';
import { IMemberOverviewFragment } from '../../model/IMemberOverviewFragment';

export type MemberItemBaseProps = {
    theme: Theme;
    member: IMemberOverviewFragment;

    onPress?: (member: IMemberOverviewFragment) => void;

    right?: (props: { size: number; }) => React.ReactNode;
    bottom?: (member: IMemberOverviewFragment) => React.ReactNode;

    height?: number,
};
