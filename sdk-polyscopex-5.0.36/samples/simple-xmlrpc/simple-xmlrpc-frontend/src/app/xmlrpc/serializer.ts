import {XmlRpcStruct, XmlRpcValue} from './types';

export function serializeMethodCall(method: string, parameters: XmlRpcValue[] = []): string {
    if (parameters.length === 0) return `<?xml version="1.0"?><methodCall><methodName>${method}</methodName></methodCall>`;
    return `<?xml version="1.0"?><methodCall><methodName>${method}</methodName><params>${serializeParameters(
        parameters
    )}</params></methodCall>`;
}

function serializeParameters(parameters: XmlRpcValue[]): string {
    let serializedParameters: string = '';
    for (const parameter of parameters) {
        serializedParameters += `<param>${serializeValue(parameter)}</param>`;
    }
    return serializedParameters;
}

function serializeValue(value: XmlRpcValue): string | undefined {
    switch (typeof value) {
        case 'boolean':
            return createBoolean(value);
        case 'string':
            return createString(value);
        case 'number':
            return createNumber(value);
        case 'object':
            if (Array.isArray(value)) {
                return createArray(value);
            }
            return createStruct(value);
    }
}

function createBoolean(value: boolean): string {
    return `<value><boolean>${value}</boolean></value>`;
}

function createString(value: string): string {
    return `<value><string>${value}</string></value>`;
}

function createNumber(value: number): string {
    if (value % 1 === 0) {
        return `<value><int>${value}</int></value>`;
    }
    if (value === Infinity) {
        return `<value><double>inf</double></value>`;
    }
    if (value === -Infinity) {
        return `<value><double>-inf</double></value>`;
    }
    if (isNaN(value)) {
        return `<value><double>nan</double></value>`;
    }
    return `<value><double>${value}</double></value>`;
}

function createArray(array: XmlRpcValue[]): string {
    let serializedArray: string = '<array><data>';
    for (const value of array) {
        serializedArray += serializeValue(value);
    }
    return (serializedArray += '</data></array>');
}

function createStruct(struct: XmlRpcStruct): string {
    let serializedStruct: string = '<struct>';
    for (const [key, value] of Object.entries(struct)) {
        serializedStruct += `<member><name>${key}</name>${serializeValue(value)}</member>`;
    }
    return (serializedStruct += '</struct>');
}
