
export const resolvers = {
    MemberListView: {
        __resolveType: () => 'Member',
    },

    JobResult: {
        __resolveType: () => 'JobError',
    },
};
