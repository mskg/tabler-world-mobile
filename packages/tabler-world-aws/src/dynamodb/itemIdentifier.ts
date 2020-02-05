import { BinaryAttributeValue, Converter, DocumentClient } from 'aws-sdk/clients/dynamodb';
import { WriteRequest } from './types';

// tslint:disable-next-line: no-var-requires

function bytes(str: string) {
    const result = [];

    // tslint:disable-next-line: no-increment-decrement
    for (let i = 0; i < str.length; i++) {
        const c = str.charCodeAt(i);
        if (c >= 0xd800 && c <= 0xdbff && i + 1 < str.length) {
            const cn = str.charCodeAt(i + 1);
            if (cn >= 0xdc00 && cn <= 0xdfff) {
                const pt = (c - 0xd800) * 0x400 + cn - 0xdc00 + 0x10000;

                result.push(
                    0xf0 + Math.floor(pt / 64 / 64 / 64),
                    0x80 + Math.floor(pt / 64 / 64) % 64,
                    0x80 + Math.floor(pt / 64) % 64,
                    0x80 + pt % 64,
                );
                i += 1;
                continue;
            }
        }
        if (c >= 2048) {
            result.push(
                0xe0 + Math.floor(c / 64 / 64),
                0x80 + Math.floor(c / 64) % 64,
                0x80 + c % 64,
            );
        } else if (c >= 128) {
            result.push(0xc0 + Math.floor(c / 64), 0x80 + c % 64);
        } else result.push(c);
    }

    return result;
}

export function itemIdentifier(
    tableName: string,
    { DeleteRequest, PutRequest }: WriteRequest,
): string {
    if (DeleteRequest) {
        return `${tableName}::delete::${serializeKeyTypeAttributes(DeleteRequest.Key)}`;
        // tslint:disable-next-line: no-else-after-return
    } else if (PutRequest) {
        return `${tableName}::put::${serializeKeyTypeAttributes(PutRequest.Item)}`;
    }

    throw new Error(`Invalid write request provided`);
}


function serializeKeyTypeAttributes(attributes: DocumentClient.AttributeMap): string {
    // tslint:disable-next-line: prefer-array-literal
    const keyTypeProperties: Array<string> = [];
    for (const property of Object.keys(attributes).sort()) {
        const attribute = Converter.input(attributes[property]);

        if (attribute.B) {
            keyTypeProperties.push(`${property}=${toByteArray(attribute.B)}`);
        } else if (attribute.N) {
            keyTypeProperties.push(`${property}=${attribute.N}`);
        } else if (attribute.S) {
            keyTypeProperties.push(`${property}=${attribute.S}`);
        }
    }

    return keyTypeProperties.join('&');
}

function toByteArray(value: BinaryAttributeValue): Uint8Array {
    if (ArrayBuffer.isView(value)) {
        return new Uint8Array(
            value.buffer,
            value.byteOffset,
            value.byteLength,
        );
    }

    if (typeof value === 'string') {
        return Uint8Array.from(bytes(value));
    }

    if (isArrayBuffer(value)) {
        return new Uint8Array(value);
    }

    throw new Error('Unrecognized binary type');
}

function isArrayBuffer(arg: any): arg is ArrayBuffer {
    return (typeof ArrayBuffer === 'function' && arg instanceof ArrayBuffer) ||
        Object.prototype.toString.call(arg) === '[object ArrayBuffer]';
}
