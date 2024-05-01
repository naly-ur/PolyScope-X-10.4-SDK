import {ProgramNode} from '@universal-robots/contribution-api';
import {GripperAction} from '../../RosHelper';

export interface GripperNode extends ProgramNode {
    type: 'ur-simple-gripper-node';
    parameters: {
        action: GripperAction;
        blocking: boolean;
        onSuccessCallback: string;
        onFailureCallback: string;
    };
}
