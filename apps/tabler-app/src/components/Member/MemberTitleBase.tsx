import React from 'react';
import { Text, Title } from 'react-native-paper';
import { styles } from './Styles';

// tslint:disable: jsx-wrap-multiline
export class MemberTitleBase extends React.PureComponent<{
    member;
    diplayFirstNameFirst;
    sortByLastName;
}> {
    render() {
        const { member, sortByLastName, diplayFirstNameFirst } = this.props;
        return diplayFirstNameFirst
            ? sortByLastName
                ? [
                    <Text key="1">{member?.firstname}</Text>,
                    <Title style={styles.title} key="2">
                        {' '}
                        {member?.lastname}
                    </Title>,
                    // <CountryFlag key="3" />,
                ]
                : [
                    <Title style={styles.title} key="1">
                        {member?.firstname}
                    </Title>,
                    <Text key="2"> {member?.lastname}</Text>,
                    // <CountryFlag key="3" />,
                ]
            : sortByLastName
                ? [
                    <Title style={styles.title} key="1">
                        {member.lastname}
                    </Title>,
                    <Text key="2"> {member?.firstname}</Text>,
                    // <CountryFlag key="3"  />,
                ]
                : [
                    <Text key="1">{member?.lastname}</Text>,
                    <Title style={styles.title} key="2">
                        {' '}
                        {member?.firstname}
                    </Title>,
                    // <CountryFlag key="3" />,
                ];
    }
}
