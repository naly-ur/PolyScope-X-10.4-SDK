import { ApplicationNode } from '@universal-robots/contribution-api';

export interface SimpleWebsocketApplicationNode extends ApplicationNode {
  type: string;
  version: string;
}
