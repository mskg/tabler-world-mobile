import gql from 'graphql-tag';
import React from 'react';
import { Query } from 'react-apollo';
import { withCacheInvalidation } from '../../helper/cache/withCacheInvalidation';
import { sortGroupRoles } from '../../helper/sortRoles';
import { Accordion } from '../Accordion';
import { InlineLoading } from '../Loading';
import { RoleCard } from './RoleCard';

type Props = {
    group: string,
    groupDetails: "board" | "boardassistants",
    expanded?: boolean,
    club: string,
    fetchPolicy: any,
};

type State = {
};

const MemberFragment = gql`
    fragment MemberDetails on Member {
        id
        pic
        firstname
        lastname
    }
`;

const RolesQuery = gql`
    query Roles($id: String!) {
        Club(id: $id) {
            id

            board {
                role
                member {
                    ...MemberDetails
                }
            }

            boardassistants {
                role
                member {
                    ...MemberDetails
                }
            }
        }
    }

    ${MemberFragment}
`;

class RoleAccordionSectionBase extends React.Component<Props, State> {
    render() {
        return (
            <Accordion title={this.props.group} expanded={this.props.expanded}>
                <Query query={RolesQuery} variables={{id: this.props.club}} fetchPolicy={this.props.fetchPolicy}>
                    {({ loading, data, /*error, data, */refetch }) => {
                        if (!loading && data != null) {
                            const grouped = sortGroupRoles(data.Club[this.props.groupDetails]);
                            if (grouped == null) return null;
                            const len = grouped.length;

                            return grouped.map((r, i) => (
                                <RoleCard
                                    key={r.member + r.role}
                                    member={r.member}
                                    role={r.role}
                                    separator={i !== len - 1}
                                />
                            ));
                        }

                        return <InlineLoading />
                    }}
                </Query>
            </Accordion>
        );
    }
}

export const RoleAccordionSection = withCacheInvalidation("clubs", RoleAccordionSectionBase);