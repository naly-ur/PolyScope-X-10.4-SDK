import { ApplicationNode, Length } from '@universal-robots/contribution-api';

export interface GripDistanceApplicationNode extends ApplicationNode {
    type: 'ur-sample-gripdistance-application';
    closedDistance: Length;
    openDistance: Length;
}
