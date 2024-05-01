import {ProgramNode} from '@universal-robots/contribution-api';


export enum GripperAction {
  grip = 'grip',
  release = 'release',
}

export interface XmlrpcGripperPrgNode extends ProgramNode {
    type: 'universal-robots-xmlrpc-gripper-web-xmlrpc-gripper-prg';
    parameters: {
        action: GripperAction;
        width: number;
        force: number;
        isGripDetected: boolean;
        onGripDetected: string;
        isGripNotDetected: boolean;
        onGripNotDetected: string;
    };
}
