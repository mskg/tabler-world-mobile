import { gql } from 'apollo-server-lambda';

export const Settings = gql`
    scalar SettingValue

    enum SettingName {
        favorites
    }

    input SettingInput {
        name: String!
        value: SettingValue!
    }

    type Setting {
        name: SettingName!
        value: SettingValue!
    }

    extend type Query {
        Settings: [Setting!]
        Setting (name: SettingName!): SettingValue
    }
`;
