import gql from 'graphql-tag';
import React from 'react';
import { Query } from 'react-apollo';
import { isRecordValid } from '../../helper/cache/withCacheInvalidation';
import { sortGroupRoles } from '../../helper/sortRoles';
import { Accordion } from '../Accordion';
import { Placeholder } from '../Placeholder/Placeholder';
import { RoleCard } from './RoleCard';
import { RolesPlaceholder } from "./RolesPlaceholder";

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
            LastSync @client
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
                <Query query={RolesQuery} variables={{ id: this.props.club }}>
                    {({ loading, data, refetch }) => {
                        if (data && data.Club != null) {
                            if (!isRecordValid("club", data.Club.LastSync)) {
                                setTimeout(() => refetch({ id: this.props.club }));
                            }
                        }

                        let grouped: any = null;
                        let len = 0;

                        if (!loading && data != null) {
                            grouped = sortGroupRoles(data.Club[this.props.groupDetails]);
                            len = grouped ? grouped.length : 0;
                        }

                        return (
                            <Placeholder ready={!loading && data != null} previewComponent={<RolesPlaceholder count={3} />}>
                                {
                                    grouped && grouped.map((r, i) => (
                                        <RoleCard
                                            key={r.member + r.role}
                                            member={r.member}
                                            role={r.role}
                                            separator={i !== len - 1}
                                        />
                                    ))
                                }
                            </Placeholder>
                        );
                    }}
                </Query>
            </Accordion>
        );
    }
}

export const RoleAccordionSection = RoleAccordionSectionBase;
