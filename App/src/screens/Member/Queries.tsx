import gql from 'graphql-tag';
import { IAddress } from "../../model/IAddress";
import { ICompany } from "../../model/ICompany";
import { IEducation } from "../../model/IEducation";
import { IMemberOverviewFragment } from '../../model/IMemberOverviewFragment';
import { IRole } from '../../model/IRole';

export const MembersOverviewFragment = gql`
    fragment MembersOverviewFragment on Member {
        id
        pic

        firstname
        lastname

        club {
           id
           name
           club
       }

       area {
           id
           name
       }

       association {
            association
            name
       }

        roles {
            name
            level
            group

            ref {
                id
                name
                type
            }
        }
    }
`;

export const GetMemberQuery = gql`
  query Member($id: Int!) {
    Member(id: $id) {
        ...MembersOverviewFragment

       birthdate
       partner

       emails {
           type
           value
       }

       phonenumbers {
           type
           value
       }

       rtemail

       partner

       address {
           postal_code
           city
           country
           street1
           street2
       }

       companies {
           name
           email
           phone
           function
           address {
                postal_code
                city
                country
                street1
                street2
           }
       }

       educations {
           school
           education
           address {
                postal_code
                city
                country
                street1
                street2
           }
       }

        socialmedia {
            twitter
            linkedin
            facebook
            instagram
        }
    }
  }

  ${MembersOverviewFragment}
`;

export type GetMemberQueryType = {
    Member: GetMemberQueryType_Member,
};

export type GetMemberQueryType_Address = {
} & IAddress;

export type GetMemberQueryType_Company = {
    address: GetMemberQueryType_Address;
} & ICompany;

export type GetMemberQueryType_Education = {
    school: string;
    education: string;
    address: GetMemberQueryType_Address;
} & IEducation;

export type GetMemberQueryType_Communication = {
    type: string;
    value: string;
};

export type GetMemberQueryType_SocialMedia = {
    twitter: string,
    linkedin: string,
    facebook: string,
    instagram: string,
}

export type GetMemberQueryType_Role = {
} & IRole;

;

export type GetMemberQueryType_Member = {
    title: string;

    address?: GetMemberQueryType_Address;

    birthdate: string;

    phonenumbers?: GetMemberQueryType_Communication[];
    emails?: GetMemberQueryType_Communication[];

    rtemail: string;

    partner?: string;

    modifiedon: Date;

    companies?: GetMemberQueryType_Company[];
    educations?: GetMemberQueryType_Education[];

    socialmedia?: GetMemberQueryType_SocialMedia
} & IMemberOverviewFragment;