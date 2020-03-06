import { EncryptedValue } from './EncryptedValue';

export interface IEncryptionWorker {
    encrypt(data: any): Promise<EncryptedValue>;
    decrypt<T>(data: EncryptedValue): Promise<T>;
}

export interface IEncryptionManager {
    createWorker(channel: string): Promise<IEncryptionWorker>;
}
