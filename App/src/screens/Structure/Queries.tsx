import gql from 'graphql-tag';

const MemberFragment = gql`
    fragment MemberDetails on Member {
        id
        pic
        firstname
        lastname
    }
`;

export const GetAssociationsQuery = gql`
  query GetAssociationsQuery {
    Associations {
        association
        name

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

    Me {
        association {
            association
        }

        id
    }
  }

  ${MemberFragment}
`;

type ClubMember = {
    id: number,
    pic?: string,
    firstname: string,
    lastname: string,
}

export type GetAssociationsQueryType_Association = {
    association: string,
    name: string,

    board: {
        role: string,
        member: ClubMember,
    }[]

    boardassistants: {
        role: string,
        member: ClubMember,
    }[]
};

export type GetAssociationsQueryType = {
    Associations: GetAssociationsQueryType_Association[],

    Me: {
        association: {
            association: string,
        },
    }
}

export const GetAreasQuery = gql`
  query GetAreasQuery {
    Areas {
        association {
            name
            association
        }

        name
        area
        id

        board {
            role
            member {
                ...MemberDetails
            }
        }

        clubs {
            id
            name
            club
        }
    }

    Me {
        area {
            id
            area
        }

        id
    }
  }

  ${MemberFragment}
`;

export type GetAreasQueryType_Area = {
    association: {
        association: string,
        name: string,
    },

    name: string,
    area: number,
    id: string,

    board: {
        role: string,
        member: ClubMember,
    }[]

    clubs: {
        id: string,
        name: string,
        club: number,
    }[]
};

export type GetAreasQueryType = {
    Areas: GetAreasQueryType_Area[],

    Me: {
        area: {
            id: string,
            area: number,
        },
    }
}

export const ClubOverviewFragment = gql`
    fragment ClubOverviewDetails on Club {
        id
        name
        club
        logo

        area {
            name
            area
        }

        association {
            name
            association
        }
    }
`;

export const GetClubsQuery = gql`
  query GetClubsQuery {
    Clubs {
        ...ClubOverviewDetails

        # board {
        #     role
        #     member {
        #         ...MemberDetails
        #     }
        # }

        # boardassistants {
        #     role
        #     member {
        #         ...MemberDetails
        #     }
        # }
    }

    Me {
        id
        club {
            id
            name
        }
    }
  }

  ${"" /*MemberFragment*/}
  ${ClubOverviewFragment}
`;

export type GetClubsQueryType_Club = {
    association: {
        name: string,
    },

    area: {
        name: string,
        area: number,
    },

    logo: string,
    name: string,
    id: string,
    club: number,

    // board: {
    //     role: string,
    //     member: ClubMember,
    // }[]

    // boardassistants: {
    //     role: string,
    //     member: ClubMember,
    // }[]

};

export type GetClubsQueryType = {
    Clubs: GetClubsQueryType_Club[],

    Me: {
        club: {
            id: string,
            club: number,
        },
    }
}