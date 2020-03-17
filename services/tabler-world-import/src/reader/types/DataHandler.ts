import { ChangePointer } from './ChangePointer';

export type DataHandler = (data: any[]) => Promise<ChangePointer[]>;
