import React from 'react';
import { MemberItemBaseProps } from './MemberItemBaseProps';

export type MemberItemProps = {
    title: React.ReactNode;
    subtitle: React.ReactNode;
} & MemberItemBaseProps;
