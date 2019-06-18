import { GetMemberQueryType_Role } from '../screens/Member/Queries';
export interface IMemberOverviewFragment {
    id: number;
    pic?: string;
    area: {
        id: string;
        name: string;
    };
    association: {
        name: string;
    };
    club: {
        name: string;
        id: string;
        club: number;
    };
    firstname: string;
    lastname: string;
    roles?: GetMemberQueryType_Role[];
}
