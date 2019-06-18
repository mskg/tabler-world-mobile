import { IAddress } from './IAddress';
export interface ICompany {
    name: string;
    email?: string;
    phone?: string;
    // sector?: string;
    // begin_date?: Date;
    function?: string;
    address: IAddress;
}
