/// <reference lib="webworker" />
import {
    CurrentUnit,
    CurrentUnits,
    ProgramBehaviorAPI,
    ProgramBehaviors,
    registerProgramBehavior,
    ScriptBuilder,
    SignalAnalogDomainValueEnum,
    ValidationResponse,
    VoltageUnit,
    VoltageUnits,
} from '@universal-robots/contribution-api';
import {SampleSetNode} from "./set.node";

const behaviors: ProgramBehaviors = {
    factory: (): SampleSetNode => {
        return {
            type: "ur-sample-node-set",
            version: '0.0.2',
            allowsChildren: false,
            parameters: {
                signalOutput: {},
            },
        };
    },
    async programNodeLabel(node: SampleSetNode): Promise<string> {
        if (node.parameters.signalOutput) {
            const signalOutput = node.parameters.signalOutput;
            const sourceID = signalOutput.sourceID;
            const signalID = signalOutput.signalID;
            const value = signalOutput.value;
            if (sourceID && signalID && value !== undefined) {
                const api = new ProgramBehaviorAPI(self);
                const labels = await api.sourceService.getSignalLabels(sourceID);
                const signalName = labels[signalID] ?? signalID;
                if (typeof value === 'boolean') {
                    return `${signalName}=${value ? 'HI' : 'LO'}`;
                }
                return `${signalName}=${value.value.toFixed(1)} ${value.unit}`;
            } else if (signalID) {
                return `${signalID}`;
            }
        }
        return ``;
    },
    validator: async (node: SampleSetNode): Promise<ValidationResponse> => {
            const signalOutput = node.parameters.signalOutput;
            if (!signalOutput?.sourceID || !signalOutput.signalID || signalOutput.value === undefined) {
                return { isValid: false };
            }
            if (typeof signalOutput.value !== 'boolean') {
                const api = new ProgramBehaviorAPI(self);
                const domains = await api.sourceService.getAnalogSignalDomains(signalOutput.sourceID);
                const currentDomain = domains[signalOutput.signalID];
                return { isValid: isUnitOfDomain(signalOutput.value.unit, currentDomain) };
            }
        return { isValid: true };
    },
    generateCodeBeforeChildren: async (node: SampleSetNode): Promise<ScriptBuilder> => {
            const api = new ProgramBehaviorAPI(self);
            const signalOutput = node.parameters.signalOutput;
            const builder = new ScriptBuilder();
            if (!signalOutput?.sourceID || !signalOutput.signalID || signalOutput.value === undefined) {
                return builder;
            }
            const script = await api.sourceService.generateSetSignalScript(
                signalOutput.sourceID,
                signalOutput.signalID,
                signalOutput.value
            );
            builder.addRaw(script);
            return builder;
    },
    upgradeNode: (loadedNode) => {
        if (loadedNode.version === '0.0.1') {
            loadedNode.version = '0.0.2';
            delete (loadedNode.parameters as any).type;
        }
        return loadedNode;
    },
};

const isUnitOfDomain = (unit: CurrentUnit | VoltageUnit, domain: SignalAnalogDomainValueEnum) => {
    if ((CurrentUnits as readonly string[]).includes(unit) && domain === SignalAnalogDomainValueEnum.CURRENT) {
        return true;
    }
    return (VoltageUnits as readonly string[]).includes(unit) && domain === SignalAnalogDomainValueEnum.VOLTAGE;
};

registerProgramBehavior(behaviors);
