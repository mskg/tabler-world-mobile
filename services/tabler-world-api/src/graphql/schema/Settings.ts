import { gql } from "apollo-server-lambda";

export const Settings = gql`
    scalar SettingValue

    enum SettingName {
        favorites
        nearbymembers
        language
    }

    input SettingInput {
        name: SettingName!
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

    extend type Mutation {
        "Removes a setting from the users profile"
        removeSetting(name: String!): Boolean

        "Updates a setting"
        putSetting(setting: SettingInput!): Boolean
    }
`;
