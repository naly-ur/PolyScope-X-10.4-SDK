/// <reference lib="webworker" />
import {
    ProgramBehaviors,
    ProgramNode,
    registerProgramBehavior,
    ScriptBuilder
} from '@universal-robots/contribution-api';
import {GripperNode} from './gripper.node';
import {closedStatus, GripperAction, openStatus} from '../../RosHelper';

const generateCode = (node: GripperNode): ScriptBuilder => node.parameters.action === GripperAction.close ? generateCloseCode(node) :
    generateOpenCode(node);

const createGripperNode = (): GripperNode => ({
    type: 'ur-simple-gripper-node',
    version: '1.0.0', // version is required
    allowsChildren: false,
    parameters: {
        action: GripperAction.close,
        blocking: true,
        onSuccessCallback: '',
        onFailureCallback: '',
    },
});

const createProgramNodeLabel = (node: GripperNode): string => {
    const type = node.parameters.action === GripperAction.close ? 'Close' : 'Open';
    return `${type} (blocking=${node.parameters.blocking})`;
};

// Add upgrade implementation here
const nodeUpgrade = (loadedNode: ProgramNode): ProgramNode => loadedNode;

const behaviors: ProgramBehaviors = {
    programNodeLabel: createProgramNodeLabel,
    factory: createGripperNode,
    generateCodeBeforeChildren: generateCode,
    upgradeNode: nodeUpgrade
};

const generateCloseCode = (node: GripperNode): ScriptBuilder => {
    const blocking = node.parameters.blocking ? 'True' : 'False';
    const builder = new ScriptBuilder();
    builder.addRaw(`ur_sg_open_close(action="${node.parameters.action}", blocking=${blocking})`);
    if (node.parameters.onSuccessCallback || node.parameters.onFailureCallback) {
        const wantedStatus = node.parameters.action === GripperAction.close ? closedStatus : openStatus;
        builder.ifCondition(`gripper_status == "${wantedStatus}"`);
    }
    if (node.parameters.onSuccessCallback) {
        builder.addStatements(`${node.parameters.onSuccessCallback}()`);
    }
    if (node.parameters.onFailureCallback) {
        builder.else();
        builder.addStatements(`${node.parameters.onFailureCallback}()`);
    }
    if (node.parameters.onSuccessCallback || node.parameters.onFailureCallback) {
        builder.end();
    }
    return builder;
};

const generateOpenCode = (node: GripperNode): ScriptBuilder => {
    const blocking = node.parameters.blocking ? 'True' : 'False';
    const builder = new ScriptBuilder();
    builder.addRaw(`ur_sg_open_close(action="${GripperAction.open}", blocking=${blocking})`);
    return builder;
};

registerProgramBehavior(behaviors);
