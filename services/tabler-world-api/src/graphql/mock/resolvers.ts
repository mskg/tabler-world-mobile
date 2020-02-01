
export const resolvers = {
    MemberListView: {
        __resolveType: () => 'Member',
    },

    JobResult: {
        __resolveType: () => 'JobError',
    },

    // SearchDirectoryResult: {
    //     __resolveType: () => ,
    // },
};
