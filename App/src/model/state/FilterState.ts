import { HashMap } from '../Maps';

export type FilterState = {
    member: {
        showFavorites: boolean;
        showOwntable: boolean;

        showAssociationBoard: boolean;
        showAreaBoard: boolean;

        favorites: HashMap<boolean>;
        area: HashMap<boolean, string> | null;
    };
};
