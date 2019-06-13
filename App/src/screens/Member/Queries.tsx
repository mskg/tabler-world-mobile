import gql from 'graphql-tag';

export const MembersOverviewFragment = gql`
    fragment MembersOverviewFragment on Member {
        id
        pic

        firstname
        lastname

        club {
           id
           name
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
    city?: string;
    country?: string;
    postal_code?: string;
    street1?: string;
    street2?: string;
};

export type GetMemberQueryType_Company = {
    name: string;
    email?: string;
    phone?: string;
    // sector?: string;
    function?: string;
    // begin_date?: Date;
    address: GetMemberQueryType_Address;
};

export type GetMemberQueryType_Education = {
    school: string;
    education: string;
    address: GetMemberQueryType_Address;
};

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
    name: string,

    level: string,
    group: string, // Board, VIP, etc.

    ref: {
        id: string,
        name: string,
        type: 'club' | 'assoc' | 'area',
    }
};

export type GetMemberQueryType_Member = {
    id: number;
    pic?: string;

    area: {
        name: string,
    },

    association: {
        name: string,
    },

    club: {
        name: string,
        id: string,
    },

    title: string;
    firstname: string;
    lastname: string;

    address?: GetMemberQueryType_Address;

    birthdate: string;

    phonenumbers?: GetMemberQueryType_Communication[];
    emails?: GetMemberQueryType_Communication[];

    rtemail: string;

    partner?: string;
    roles?: GetMemberQueryType_Role[];

    modifiedon: Date;

    companies?: GetMemberQueryType_Company[];
    educations?: GetMemberQueryType_Education[];

    socialmedia?: GetMemberQueryType_SocialMedia
};