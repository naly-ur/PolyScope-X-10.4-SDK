/// <reference lib="webworker" />
import {
    ApplicationNodeType,
    FramesNode,
    MoveToBlendSettings,
    MoveToSpeedSettings,
    NodeType,
    PointModel,
    ProgramBehaviorAPI,
    ProgramBehaviors,
    registerProgramBehavior,
    ScriptBuilder,
    TabInputModel,
    URVariable,
    VariableValueType,
} from '@universal-robots/contribution-api';
import { getDefaultJointAcceleration, getDefaultJointSpeed } from './move-to.constants';
import { getDefaultMoveToValidation, MoveToFieldValidation, MoveToValidationResponse } from './move-to.validation.model';
import {SampleMoveToNode} from "./move-to.node";

const behaviors: ProgramBehaviors = {
    programNodeLabel: (node: SampleMoveToNode): string => {
        const point = node.parameters.point;
        if (point.selectedType === 'VARIABLE' || point.selectedType === 'VALUE') {
            return `${point.entity.variable?.name} (${node.parameters.moveType === 'moveJ' ? 'Joint' : 'Linear'})`;
        } else if (point.selectedType === 'EXPRESSION') {
            return `${point.value} (${node.parameters.moveType === 'moveJ' ? 'Joint' : 'Linear'})`;
        } else {
            return '';
        }
    },
    factory: async (): Promise<SampleMoveToNode> => {
        const api = new ProgramBehaviorAPI(self);
        const pointName = await api.symbolService.generateVariable('Point', VariableValueType.WAYPOINT);
        const baseFrame = ((await api.applicationService.getApplicationNode(ApplicationNodeType.FRAMES)) as FramesNode).framesList.find(
            (frame) => frame.name.frameId === 'base'
        );
        return {
            version: '0.0.1',
            type: "ur-sample-node-move-to",
            allowsChildren: false,
            parameters: {
                moveType: 'moveJ',
                point: new TabInputModel<PointModel>({ variable: pointName }, 'VALUE', pointName.name),
                advanced: {
                    speed: {
                        speed: getDefaultJointSpeed(),
                        acceleration: getDefaultJointAcceleration(),
                    },
                    reference: {
                        frame: baseFrame?.name || { frameId: 'base', translationKey: 'application.nodes.ur-frames.name.base' },
                    },
                    blend: {
                        enabled: false,
                    },
                    transform: {
                        transform: false,
                        poseVariable: undefined,
                    },
                },
            },
        };
    },
    validator: async (node: SampleMoveToNode): Promise<MoveToValidationResponse> => {
        const api = new ProgramBehaviorAPI(self);
        const point = node.parameters.point;
        const fieldValidation: MoveToFieldValidation = getDefaultMoveToValidation();
        if (!point) {
            fieldValidation.point = false;
            return { isValid: false, fieldValidation };
        }

        if (point.selectedType === 'VALUE' && !point.entity?.position) {
            fieldValidation.position = false;
        }

        if (point.selectedType === 'VARIABLE') {
            if (!point.entity?.variable) {
                fieldValidation.point = false;
            } else {
                const variableExists = await isValidVariable(point.entity.variable.name, api);
                if (!variableExists) {
                    fieldValidation.point = false;
                }
            }
        }

        if (point.selectedType === 'EXPRESSION') {
            const expressionEmpty = (point.value as string).length === 0;
            if (expressionEmpty) {
                fieldValidation.point = false;
            }
        }

        const advanced = node.parameters.advanced;

        // If speed settings are set to variables they should be valid
        if (advanced.speed.speed.selectedType === 'VARIABLE') {
            const variableExists = await isValidVariable(advanced.speed.speed.value as string, api);
            if (!variableExists) {
                fieldValidation.advanced.speed = false;
            }
        }
        if (advanced.speed.acceleration.selectedType === 'VARIABLE') {
            const variableExists = await isValidVariable(advanced.speed.acceleration.value as string, api);
            if (!variableExists) {
                fieldValidation.advanced.acceleration = false;
            }
        }

        // If a pose is set for the Move node, it should be a valid variable name:
        if (advanced.transform?.transform && advanced.transform.poseVariable) {
            const poseVar = advanced.transform.poseVariable;
            const variableExists = await isValidVariable(poseVar.name, api);
            if (!variableExists) {
                fieldValidation.advanced.transform = false;
            }
        }

        // If a frame is selected, it should be a registered frame:
        if (advanced.reference?.frame.frameId) {
            const selectedFrameId = advanced.reference.frame.frameId;
            const framesList = ((await api.applicationService.getApplicationNode(ApplicationNodeType.FRAMES)) as FramesNode).framesList;
            const frameExists = !!framesList.some((frame) => frame.name.frameId === selectedFrameId);
            if (!frameExists) {
                fieldValidation.advanced.frame = false;
            }
        }

        // If blend radius is enabled and set to a variable, is should be a valid variable
        if (advanced.blend.enabled && advanced.blend.radius?.selectedType === 'VARIABLE') {
            const variableExists = await isValidVariable(advanced.blend.radius.value as string, api);
            if (!variableExists) {
                fieldValidation.advanced.blend = false;
            }
        }

        const hasInvalidField = [fieldValidation.point, fieldValidation.position, ...Object.values(fieldValidation.advanced)].some(
            (valid: boolean) => !valid
        );

        return { isValid: !hasInvalidField, fieldValidation };
    },
    generateCodeBeforeChildren: async (node: SampleMoveToNode): Promise<ScriptBuilder> => {
        const builder = new ScriptBuilder();

        const moveFunction = node.parameters.moveType === 'moveJ' ? builder.movej : builder.movel;

        const destination = await getDestinationString(node);
        const speed = getSpeed(node.parameters.advanced.speed);
        const acceleration = getAcceleration(node.parameters.advanced.speed);
        const blendRadius = getBlendRadius(node.parameters.advanced.blend);

        return moveFunction.call(builder, destination, acceleration, speed, undefined, blendRadius);
    },
    generateCodePreamble: async (node: SampleMoveToNode): Promise<ScriptBuilder> => {
        const builder = new ScriptBuilder();
        if (
            node.parameters.point.selectedType === 'VALUE' &&
            node.parameters.point.entity.variable?.name &&
            node.parameters.point.entity.position
        ) {
            // TODO: add global variable struct
        }
        return builder;
    },
};

async function getDestinationString(node: SampleMoveToNode): Promise<string> {
    if (node.parameters.point.selectedType === 'EXPRESSION') {
        return node.parameters.point.value as string;
    }

    const moveType = node.parameters.moveType;
    const variable = node.parameters.point.entity.variable as URVariable;
    let targetPoseString: string;

    const targetFrameId = node.parameters.advanced.reference.frame.frameId;
    if (targetFrameId === 'base') {
        targetPoseString = `${variable.name}.p`;
    } else {
        targetPoseString = `pose_trans(get_pose("${targetFrameId}", "base"), ${variable.name}.p)`;
    }

    if (node.parameters.advanced.transform.transform && node.parameters.advanced.transform.poseVariable?.name) {
        targetPoseString = `pose_trans(${targetPoseString}, ${node.parameters.advanced.transform.poseVariable.name})`;
    }

    if (moveType === 'moveL') {
        return targetPoseString;
    }
    if (moveType === 'moveJ') {
        return `get_inverse_kin(${targetPoseString}, qnear=${variable.name}.q)`;
    }

    return '';
}

function getSpeed(speedSettings: MoveToSpeedSettings) {
    return speedSettings.speed.value;
}

function getAcceleration(speedSettings: MoveToSpeedSettings) {
    return speedSettings.acceleration.value;
}

function getBlendRadius(blendSettings: MoveToBlendSettings) {
    if (blendSettings.enabled && blendSettings.radius) {
        return blendSettings.radius.value;
    }
    return undefined;
}

async function isValidVariable(variableName: string, api: ProgramBehaviorAPI): Promise<boolean> {
    const isRegistered = await api.symbolService.isRegisteredVariableName(variableName);
    const isSuppressed = await api.symbolService.isSuppressed(variableName);
    return isRegistered && !isSuppressed;
}

registerProgramBehavior(behaviors);
