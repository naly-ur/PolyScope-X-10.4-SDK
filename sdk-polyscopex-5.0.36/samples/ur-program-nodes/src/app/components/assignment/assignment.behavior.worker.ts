/// <reference lib="webworker" />
import {
    isVariable,
    PositionType,
    ProgramBehaviorAPI,
    ProgramBehaviors,
    registerProgramBehavior,
    ScriptBuilder,
    TabInputModel,
    ValidationResponse,
    VariableValueType,
} from '@universal-robots/contribution-api';
import { SelectedInput } from '@universal-robots/ui-models';
import {SampleAssignmentNode} from "./assignment.node";

const behaviors: ProgramBehaviors = {
    programNodeLabel: generateLabel,
    factory: createAssignmentProgramNode,
    generateCodeBeforeChildren: generateCode,
    validator,
    upgradeNode,
};

function generateLabel(node: SampleAssignmentNode) {
    if (node.parameters.variable) {
        if (
            node.parameters.waypointParameters !== undefined &&
            node.parameters.variable.valueType === VariableValueType.WAYPOINT &&
            node.parameters.waypointParameters.waypointSource === PositionType.Teach
        ) {
            return `Waypoint: ${node.parameters.variable.name}`;
        }
        if (isTabInput(node)) {
            return `${node.parameters.variable.name} = ${node.parameters.tabInputExpression.value}`;
        } else {
            return `${node.parameters.variable.name} = ${node.parameters.expression}`;
        }
    }
    return '';
}

async function createAssignmentProgramNode(): Promise<SampleAssignmentNode> {
    const api = new ProgramBehaviorAPI(self);
    return {
        type: "ur-sample-node-assignment",
        version: '0.0.1',
        allowsChildren: false,
        parameters: {
            isValid: false,
            variable: await api.symbolService.generateVariable('var', VariableValueType.STRING),
            isNewVariable: true,
            expression: '',
            tabInputExpression: new TabInputModel('', SelectedInput.VALUE, ''),
        },
    };
}

async function validator(node: SampleAssignmentNode, _context): Promise<ValidationResponse> {
    const isValidVariable = await variableValidator(node);
    if (!isValidVariable.isValid) {
        return isValidVariable;
    }

    if (isTabInput(node)) {
        const validationResponse = tabInputValueValidator(node);
        return !validationResponse.isValid ? validationResponse : await suppressedNodeValidator(node);
    }

    if (isWaypointAndTeach(node)) {
        return { isValid: node.parameters.waypointParameters?.position !== undefined };
    }

    let validationResponse = emptyExpressionInput(node);
    if (!validationResponse.isValid) {
        return validationResponse;
    }

    validationResponse = parameterValidator(node);
    if (!validationResponse.isValid) {
        return validationResponse;
    }
    return isValidVariable;
}
function isTabInput(node: SampleAssignmentNode) {
    return (
        node.parameters.variable?.valueType === VariableValueType.FLOAT ||
        node.parameters.variable?.valueType === VariableValueType.INTEGER ||
        node.parameters.variable?.valueType === VariableValueType.STRING
    );
}
function isWaypointAndTeach(node: SampleAssignmentNode) {
    return node.parameters.variable?.valueType === 'waypoint' && node.parameters.waypointParameters?.waypointSource === PositionType.Teach;
}

function parameterValidator(node: SampleAssignmentNode): ValidationResponse {
    if (!node.parameters || !node.parameters.variable || !isVariable(node.parameters.variable)) {
        return { isValid: false, errorMessageKey: 'Missing required parameters' };
    }
    return { isValid: true };
}

function emptyExpressionInput(node: SampleAssignmentNode): ValidationResponse {
    if (!node.parameters.expression) {
        return { isValid: false, errorMessageKey: 'Missing expression' };
    }
    return { isValid: true };
}

async function suppressedNodeValidator(node: SampleAssignmentNode): Promise<ValidationResponse> {
    const api = new ProgramBehaviorAPI(self);
    const isSuppressed = await api.symbolService.isSuppressed(String(node.parameters.tabInputExpression?.value));
    return isSuppressed || String(node.parameters.tabInputExpression?.value).length < 1
        ? { isValid: false, errorMessageKey: 'Variable is suppressed' }
        : { isValid: true };
}

function tabInputValueValidator(node: SampleAssignmentNode): ValidationResponse {
    if (!String(node.parameters.tabInputExpression?.value) && node.parameters.tabInputExpression?.selectedType === SelectedInput.VALUE) {
        return { isValid: false, errorMessageKey: 'Missing expression' };
    }
    return { isValid: true };
}

function validateWaypoint(node: SampleAssignmentNode) {
    const waypointParameters = node.parameters.waypointParameters;
    if (
        waypointParameters !== undefined &&
        node.parameters.variable?.valueType === VariableValueType.WAYPOINT &&
        waypointParameters.waypointSource === PositionType.Teach &&
        waypointParameters.position === undefined
    ) {
        return { isValid: false };
    }
    return { isValid: true };
}

async function validateVariableName(node: SampleAssignmentNode) {
    const { variable } = node.parameters;
    if (variable?.reference) {
        const api = new ProgramBehaviorAPI(self);
        const isRegisteredVariableName = await api.symbolService.isRegisteredVariableName(variable.name);
        if (!isRegisteredVariableName) {
            return { isValid: false };
        }
        const isSuppressed = await api.symbolService.isSuppressed(variable.name);
        if (isSuppressed) {
            return { isValid: false };
        }
    }
    return { isValid: true };
}

async function variableValidator(node: SampleAssignmentNode): Promise<ValidationResponse> {
    const wayPointResult = validateWaypoint(node);
    if (!wayPointResult?.isValid) {
        return wayPointResult;
    }

    const variableNameResult = await validateVariableName(node);
    if (!variableNameResult?.isValid) {
        return variableNameResult;
    }

    return { isValid: true };
}

async function generateCode(node: SampleAssignmentNode): Promise<ScriptBuilder> {
    const builder: ScriptBuilder = new ScriptBuilder();
    const varName: string = node.parameters.variable?.name;
    const tabInputExpression: string = node.parameters.tabInputExpression.value as string;
    let expression: string = node.parameters.expression as string;

    if (node.parameters.waypointParameters !== undefined && isWaypointAndTeach(node) && node.parameters.waypointParameters.position) {
        // TODO: create struct expression
    }

    const expressionInput = isTabInput(node) ? tabInputExpression : expression;

    return node.parameters.isNewVariable ? builder.globalVariable(varName, expressionInput) : builder.assign(varName, expressionInput);
}

function upgradeNode(loadedNode: SampleAssignmentNode): SampleAssignmentNode {
    if (!loadedNode?.version) {
        loadedNode.version = '0.0.1';
        if (!loadedNode.parameters.tabInputExpression) {
            loadedNode.parameters = {
                ...loadedNode.parameters,
                tabInputExpression: {
                    entity: '',
                    selectedType: SelectedInput.VALUE,
                    value: '',
                },
            };
        }
        if (
            'expression' in loadedNode.parameters &&
            !loadedNode.parameters.tabInputExpression?.value &&
            (loadedNode.parameters.variable?.valueType === VariableValueType.STRING ||
                loadedNode.parameters.variable?.valueType === VariableValueType.INTEGER ||
                loadedNode.parameters.variable?.valueType === VariableValueType.FLOAT)
        ) {
            loadedNode.parameters = {
                ...loadedNode.parameters,
                tabInputExpression: {
                    entity: '',
                    selectedType: 'VALUE',
                    value: loadedNode.parameters.expression,
                },
            };
        }
        if (
            loadedNode.parameters.tabInputExpression?.value !== '' &&
            loadedNode.parameters.expression === '' &&
            loadedNode.parameters.variable?.valueType !== VariableValueType.STRING &&
            loadedNode.parameters.variable?.valueType !== VariableValueType.INTEGER &&
            loadedNode.parameters.variable?.valueType !== VariableValueType.FLOAT
        ) {
            loadedNode.parameters = {
                ...loadedNode.parameters,
                expression: loadedNode.parameters.tabInputExpression.value.toString(),
            };
        }
    }
    return loadedNode;
}

registerProgramBehavior(behaviors);
