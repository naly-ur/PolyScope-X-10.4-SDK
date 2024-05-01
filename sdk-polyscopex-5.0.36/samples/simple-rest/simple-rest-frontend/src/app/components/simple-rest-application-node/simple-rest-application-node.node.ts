import { ApplicationNode } from '@universal-robots/contribution-api';

export interface SimpleRestApplicationNode extends ApplicationNode {
  type: string;
  version: string;
}
