/// <reference lib="webworker" />
import {
    ApplicationContext,
    ProgramBehaviorAPI,
    ProgramBehaviors, ProgramNode,
    registerProgramBehavior,
    ScriptBuilder, ScriptContext,
    ValidationResponse
} from '@universal-robots/contribution-api';
import { GripDistanceProgramNode } from './gripdistance-program.node';
import { GripDistanceApplicationNode } from '../gripdistance-application/gripdistance-application.node';

const createProgramNodeLabel = (): string => 'Toggle Gripper';

const createGripDistanceProgramNode = (): GripDistanceProgramNode => ({
    type: 'ur-sample-gripdistance-program',
    version: '1.0.0', // version is required
    allowsChildren: false,
    parameters: {
        closedDistance: { value: 0, unit: 'mm' },
        openDistance: { value: 300, unit: 'mm' },
        gripperToggle: false
    },
});

const generateCode = async (node: GripDistanceProgramNode, scriptContext: ScriptContext, applicationContext: ApplicationContext): Promise<ScriptBuilder> => {
    const api = new ProgramBehaviorAPI(self);
    const applicationNode = await api.applicationService.getApplicationNode('ur-sample-gripdistance-application') as GripDistanceApplicationNode;
    const builder = new ScriptBuilder();
    if (node.parameters && Object.prototype.hasOwnProperty.call(node.parameters, 'gripperToggle')) {
        const gripDistance = node.parameters.gripperToggle
            ? applicationNode.openDistance.value
            : applicationNode.closedDistance.value;
        builder.addRaw(`setGripper(${ gripDistance })`);
    }
    return builder;
};

const nodeValidation = (node: GripDistanceProgramNode): ValidationResponse =>
    (node.parameters && Object.prototype.hasOwnProperty.call(node.parameters, 'gripperToggle'))
        ? { isValid: true }
        : { isValid: false, errorMessageKey: 'Missing required parameters' };

// Add upgrade implementation here
const nodeUpgrade = (loadedNode: ProgramNode): ProgramNode => loadedNode;

const behaviors: ProgramBehaviors = {
    programNodeLabel: createProgramNodeLabel,
    factory: createGripDistanceProgramNode,
    generateCodeBeforeChildren: generateCode,
    validator: nodeValidation,
    upgradeNode: nodeUpgrade
};

registerProgramBehavior(behaviors);
