import { ApplicationNode } from '@universal-robots/contribution-api';

export interface SimpledockerApplicationNodeNode extends ApplicationNode {
  type: string;
  version: string;
}
