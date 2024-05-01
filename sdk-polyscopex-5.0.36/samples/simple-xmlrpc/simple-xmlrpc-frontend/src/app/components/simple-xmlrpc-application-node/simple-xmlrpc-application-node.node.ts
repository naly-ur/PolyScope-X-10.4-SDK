import {ApplicationNode} from '@universal-robots/contribution-api';

export interface SimpleXmlrpcApplicationNode extends ApplicationNode {
    type: string;
    version: string;
}
