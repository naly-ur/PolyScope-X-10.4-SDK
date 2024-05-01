/// <reference lib="webworker" />
import {
    convertValue,
    CurrentUnit,
    CurrentUnits,
    ProgramBehaviorAPI,
    ProgramBehaviors,
    registerProgramBehavior,
    ScriptBuilder,
    SignalAnalogDomainValueEnum,
    TabInputModel,
    Time,
    ValidationResponse,
    VoltageUnit,
    VoltageUnits,
} from '@universal-robots/contribution-api';
import { SelectedInput } from '@universal-robots/ui-models';
import { SampleWaitNode } from "./wait.node";

const SINGLE_DAY_IN_SECONDS = 86400;
export const MAX_WAIT_TIME_IN_SI = SINGLE_DAY_IN_SECONDS;
export const MIN_WAIT_TIME_IN_SI = 0.01;
const behaviors: ProgramBehaviors = {
    programNodeLabel: async (node: SampleWaitNode): Promise<string> => {
        switch (node.parameters.type) {
            case 'time': {
                const time = node.parameters.time;
                if (!TabInputModel.isTabInputModel<Time>(time)) {
                    return '';
                }
                return time2Label(time);
            }
            case 'signalInput': {
                const signalInput = node.parameters.signalInput;
                if (signalInput?.signalID && signalInput?.sourceID && signalInput.value !== undefined) {
                    const api = new ProgramBehaviorAPI(self);
                    const labels = await api.sourceService.getSignalLabels(signalInput.sourceID);
                    const signalName = labels[signalInput.signalID] ?? signalInput.signalID;
                    if (typeof signalInput.value === 'boolean') {
                        const hiLow = signalInput.value ? 'HI' : 'LO';
                        return `${signalName}==${hiLow}`;
                    } else {
                        const input = signalInput.value;
                        const operator = signalInput.analogOperator;
                        return `${signalName}${operator}${input.value} ${input.unit}`;
                    }
                }
                return '';
            }
            default:
                return ``;
        }
    },
    factory: async (): Promise<SampleWaitNode> => {
        const time = new TabInputModel<Time>(
            {
                value: 1,
                unit: 's',
            },
            SelectedInput.VALUE,
            1
        );

        return {
            type: "ur-sample-node-wait",
            version: '0.0.1',
            parameters: {
                type: 'time',
                time,
            },
        } as SampleWaitNode;
    },
    validator: async (node: SampleWaitNode, _context): Promise<ValidationResponse> => {
        switch (node.parameters.type) {
            case 'time': {
                if (node.parameters?.time && !(await TabInputModel.isValid<Time>(node.parameters.time))) {
                    return { isValid: false };
                }

                if (!node.parameters?.time?.value) {
                    return { isValid: false };
                }
                const MILLIS_TO_SECONDS = 1000;
                const waitTime =
                    node.parameters.time?.entity.unit === 's'
                        ? Number(node.parameters.time?.value)
                        : node.parameters.time?.entity.value / MILLIS_TO_SECONDS;
                if (waitTime > MAX_WAIT_TIME_IN_SI) {
                    return { isValid: false, errorMessageKey: 'Time must be 24 hours or less' };
                }
                if (waitTime < MIN_WAIT_TIME_IN_SI) {
                    return { isValid: false, errorMessageKey: 'Time must be 10 ms or greater' };
                }
                break;
            }
            case 'signalInput': {
                const signalInput = node.parameters.signalInput;
                if (!signalInput?.sourceID || !signalInput?.signalID || signalInput?.value === undefined) {
                    return { isValid: false };
                }
                if (typeof signalInput.value !== 'boolean') {
                    const api = new ProgramBehaviorAPI(self);
                    const domains = await api.sourceService.getAnalogSignalDomains(signalInput.sourceID);
                    const currentDomain = domains[signalInput.signalID];
                    return { isValid: isUnitOfDomain(signalInput.value.unit, currentDomain) };
                }
                break;
            }
            default:
                return { isValid: false } as ValidationResponse;
        }
        return { isValid: true } as ValidationResponse;
    },
    allowedInContext: async (_context): Promise<boolean> => {
        return true;
    },
    generateCodeBeforeChildren: async (node: SampleWaitNode): Promise<ScriptBuilder> => {
        const builder = new ScriptBuilder();

        switch (node.parameters.type) {
            case 'signalInput': {
                const api = new ProgramBehaviorAPI(self);
                const signalInput = node.parameters.signalInput;
                if (!signalInput?.sourceID || !signalInput.signalID || signalInput.value === undefined) {
                    return builder;
                }
                if (typeof signalInput.value === 'boolean') {
                    const left = await api.sourceService.generateGetSignalScript(signalInput.sourceID, signalInput.signalID);
                    const right = signalInput.value ? 'False' : 'True';
                    builder.beginWhile(`${left} == ${right}`);
                    builder.sync();
                    builder.end();
                    break;
                } else {
                    const left = await api.sourceService.generateGetSignalScript(signalInput.sourceID, signalInput.signalID);
                    // The values returned from the controller are always in either Amperes or Voltages, so if the set unit is in mA we must convert
                    // if the value is in Voltages, we need no conversion
                    const right: number =
                        signalInput.value.unit === 'mA' ? convertValue(signalInput.value, 'A').value : signalInput.value.value;
                    builder.beginWhile(`${left} ${signalInput?.analogOperator} ${right}`);
                    builder.sync();
                    builder.end();
                    break;
                }
            }
            case 'time':
                if (node.parameters.time?.value) {
                    builder.sleep(node.parameters.time.value);
                }
                break;
        }

        return builder;
    },
};

const isUnitOfDomain = (unit: CurrentUnit | VoltageUnit, domain: SignalAnalogDomainValueEnum) => {
    if ((CurrentUnits as readonly string[]).includes(unit) && domain === SignalAnalogDomainValueEnum.CURRENT) {
        return true;
    }
    return (VoltageUnits as readonly string[]).includes(unit) && domain === SignalAnalogDomainValueEnum.VOLTAGE;
};

// Function to write different label based on SelectedType
const time2Label = (time: TabInputModel<Time>): string => {
    switch (time.selectedType) {
        case SelectedInput.VALUE:
            return `Value: ${Number(time.entity.value).toFixed(2)} ${time.entity.unit}`;
        case SelectedInput.VARIABLE:
            return `Variable: ${time.value}`;
        case SelectedInput.EXPRESSION:
            return `Expression: ${time.value}`;
        default:
            return '';
    }
};

registerProgramBehavior(behaviors);
