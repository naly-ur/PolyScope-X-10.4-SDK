import { ApplicationNode } from '@universal-robots/contribution-api';

export interface XmlrpcGripperAppNode extends ApplicationNode {
  type: string;
  version: string;
}
