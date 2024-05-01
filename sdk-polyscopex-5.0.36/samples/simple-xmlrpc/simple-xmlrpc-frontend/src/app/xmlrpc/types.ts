export type XmlRpcValue = undefined | boolean | number | string | XmlRpcValue[] | XmlRpcStruct;

export type XmlRpcStruct = { [key: string]: XmlRpcValue };
