/// <reference lib="webworker" />
import {
    ProgramBehaviorAPI,
    ProgramBehaviors,
    registerProgramBehavior,
    ScriptBuilder,
    TabInputModel,
    ToolForceDirection,
    ValidationResponse,
    VariableValueType,
} from '@universal-robots/contribution-api';
import { SelectedInput } from '@universal-robots/ui-models';
import {SampleToolForceNode} from "./tool-force.node";

export function toTabModel(obj: ToolForceDirection) {
    return new TabInputModel<typeof obj>(
        {
            force: {
                value: 0,
                unit: 'N',
            },
            enabled: false,
        },
        SelectedInput.VALUE,
        obj?.force?.value ?? 0
    );
}

const behaviors: ProgramBehaviors = {
    factory: (): SampleToolForceNode => {
        return {
            type: "ur-sample-node-tool-force",
            version: '0.0.1',
            allowsChildren: true,
            parameters: {
                x: {
                    isValid: false,
                    model: toTabModel({ force: { value: 0, unit: 'N' }, enabled: false }),
                },
                y: {
                    isValid: false,
                    model: toTabModel({ force: { value: 0, unit: 'N' }, enabled: false }),
                },
                z: {
                    isValid: false,
                    model: toTabModel({ force: { value: 0, unit: 'N' }, enabled: false }),
                },
            },
        };
    },
    programNodeLabel: (node: SampleToolForceNode): string => {
        const x = { name: 'X', value: node.parameters.x };
        const y = { name: 'Y', value: node.parameters.y };
        const z = { name: 'Z', value: node.parameters.z };

        return [x, y, z]
            .filter((axis) => axis.value.model.entity.enabled)
            .reduce((res, current) => {
                let label;
                label = `${current.name}: ${current.value.model.value}`;
                if (current.value.model.selectedType === SelectedInput.VALUE) {
                    label = `${current.name}: ${current.value.model.value} N`;
                }

                if (res) {
                    return `${res} | ${label}`;
                }
                return label;
            }, '');
    },
    validator: async (node, context): Promise<ValidationResponse> => {
        let isValid = false;

        // Force node must have at least one child to be valid
        let notSuppressedNodesCount = 0;
        for await (const child of context.traverse.children) {
            if (!child.isSuppressed) {
                notSuppressedNodesCount++;
            }
        }
        if (notSuppressedNodesCount === 0) {
            return {
                isValid: false,
                errorMessageKey: 'Tool force has no nodes',
            };
        }

        const x = { name: 'X', value: node?.parameters?.x };
        const y = { name: 'Y', value: node?.parameters?.y };
        const z = { name: 'Z', value: node?.parameters?.z };

        const api = new ProgramBehaviorAPI(self);
        const variables = await api.symbolService.getVariables();

        if (!node.parameters) {
            return { isValid };
        }
        const enabledNodes = [x, y, z].filter((item) => item.value.model?.entity?.enabled);

        //For of is needed because of the async await.
        for (const axis of enabledNodes) {
            if (axis.value.model?.selectedType === SelectedInput.VARIABLE) {
                const isSuppressed = await api.symbolService.isSuppressed(axis.value.model?.value);
                const isRegistered = await api.symbolService.isRegisteredVariableName(axis.value.model?.value);

                if (isSuppressed || !isRegistered) {
                    return { isValid };
                }

                const variable = variables.find((urVariable) => urVariable.name === axis.value.model?.value);

                if (variable?.valueType === VariableValueType.FLOAT && !isSuppressed && isRegistered) {
                    isValid = true;
                }
            }

            isValid = String(axis.value.model?.value).length > 0;
        }

        return { isValid };
    },
    generateCodeBeforeChildren,
    generateCodeAfterChildren,
    upgradeNode(loadedNode: SampleToolForceNode): SampleToolForceNode {
        const oldNode = { ...loadedNode } as any;
        if (!loadedNode?.version) {
            return {
                ...loadedNode,
                version: '0.0.1',
                parameters: {
                    ...loadedNode.parameters,
                    x: {
                        isValid: !!oldNode.parameters.x.force,
                        model: {
                            entity: {
                                force: {
                                    ...oldNode.parameters.x.force,
                                },
                                enabled: oldNode.parameters.x.enabled,
                            },
                            selectedType: SelectedInput.VALUE,
                            value: oldNode.parameters.x.force?.value,
                        },
                    },
                    y: {
                        isValid: !!oldNode.parameters.y.force,
                        model: {
                            entity: {
                                force: {
                                    ...oldNode.parameters.y.force,
                                },
                                enabled: oldNode.parameters.y.enabled,
                            },
                            selectedType: SelectedInput.VALUE,
                            value: oldNode.parameters.y.force?.value,
                        },
                    },
                    z: {
                        isValid: !!oldNode.parameters.z.force,
                        model: {
                            entity: {
                                force: {
                                    ...oldNode.parameters.z.force,
                                },
                                enabled: oldNode.parameters.z.enabled,
                            },
                            selectedType: SelectedInput.VALUE,
                            value: oldNode.parameters.z.force?.value,
                        },
                    },
                },
            };
        }
        return loadedNode;
    },
};

function generateCodeBeforeChildren(node: SampleToolForceNode): ScriptBuilder {
    const builder = new ScriptBuilder();

    const { x, y, z } = node.parameters;
    if (!(x.model.entity.enabled || y.model.entity.enabled || z.model.entity.enabled)) {
        return builder;
    }

    const zero = 'zero_ftsensor()';
    builder.addStatements(zero);

    // Frame is always tool
    const taskFrame = 'get_actual_tcp_pose()';

    // 1 or 0 to enable [x, y, z, rx, ry, rz]
    const selectionVector = `[${x?.model.entity.enabled ? 1 : 0}, ${y?.model.entity.enabled ? 1 : 0}, ${
        z?.model.entity.enabled ? 1 : 0
    }, 0, 0, 0]`;

    // Force in N [x, y, z, rx, ry, rz]
    const wrench = `[${x.model.value ?? '0.0'}, ${y.model.value ?? '0.0'}, ${z.model.value ?? '0.0'}, 0.0, 0.0, 0.0]`;

    // don't transform the force frame
    const forceType = 2;

    // max motion in mm/s [x, y, z, rx, ry, rz]
    const limits = '[0.15, 0.15, 0.15, 0.3, 0.3, 0.3]';

    /* From the script manual on force_mode:
     * Note: Avoid movements parallel to compliant axes and high deceleration (consider inserting a short
     * sleep command of at least 0.02s) just before entering force mode. Avoid high acceleration in force
     * mode as this decreases the force control accuracy
     */
    builder.sleep(0.02);
    const enableForceMode = `force_mode(${taskFrame}, ${selectionVector}, ${wrench}, ${forceType}, ${limits})`;
    builder.addStatements(enableForceMode);

    return builder;
}

function generateCodeAfterChildren(node): ScriptBuilder {
    const builder = new ScriptBuilder();

    const { x, y, z } = node.parameters;
    if (!(x.model.entity.enabled || y.model.entity.enabled || z.model.entity.enabled)) {
        return builder;
    }
    builder.addStatements('end_force_mode()');
    return builder;
}

registerProgramBehavior(behaviors);
