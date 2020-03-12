import gql from 'graphql-tag';
import { MemberOverviewFragment } from './MemberOverviewFragment';

export const MemberDetailsFragment = gql`
    fragment MemberDetailsFragment on Member {
        LastSync @client

        ...MemberOverviewFragment

        birthdate
        datejoined

        partner
        availableForChat

        emails {
            type
            value
        }

        association {
            isocode
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

            location {
                longitude
                latitude
            }
        }

        companies {
            name
            email
            phone
            function
            sector
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

        sharesLocation
    }

    ${MemberOverviewFragment}
`;
