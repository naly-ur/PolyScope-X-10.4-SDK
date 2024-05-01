import { Length, ProgramNode } from '@universal-robots/contribution-api';

export interface GripDistanceProgramNode extends ProgramNode {
    type: 'ur-sample-gripdistance-program';
    parameters: {
        closedDistance: Length;
        openDistance: Length;
        gripperToggle: boolean;
    };
}
