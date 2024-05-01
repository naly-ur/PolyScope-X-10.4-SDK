import { ApplicationNode } from '@universal-robots/contribution-api';

export interface GripperApplicationNode extends ApplicationNode {
    type: 'ur-simple-gripper-application';
    force: number;
}
