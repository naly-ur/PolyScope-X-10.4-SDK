import { ApplicationNode } from '@universal-robots/contribution-api';

export interface <%= applicationComponentName %>Node extends ApplicationNode {
  type: string;
  version: string;
}
