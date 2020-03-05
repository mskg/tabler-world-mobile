
export const typeResolvers = {
    MemberListView: {
        __resolveType: () => 'Member',
    },

    JobResult: {
        __resolveType: () => 'JobError',
    },
};
