import { gql } from 'apollo-server-lambda';

export const Settings = gql`
    scalar SettingValue

    enum SettingNames {
        club
        assoc
        area
    }

    input SettingInput {
        name: String!
        value: SettingValue!
    }

    type Setting {
        name: String!
        value: SettingValue!
    }
`;