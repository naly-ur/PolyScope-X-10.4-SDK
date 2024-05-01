/// <reference lib="webworker" />
import {
    ProgramBehaviors,
    registerProgramBehavior,
    ScriptBuilder,
    ValidationResponse,
} from '@universal-robots/contribution-api';
import {SampleLoopNode} from "./loop.node";

const behaviors: ProgramBehaviors = {
    factory: async () => {
        return {
            type: "ur-sample-node-loop",
            version: '0.0.1',
            allowsChildren: true,
            parameters: {
                type: 'always',
                expression: '',
                xtimes: 1,
            },
        };
    },
    programNodeLabel: (node: SampleLoopNode): string => {
        switch (node.parameters.type) {
            case 'always':
                return `Always`;
            case 'xtimes':
                return `${node.parameters.xtimes} Times`;
            case 'expression':
                return `While ${node.parameters.expression}`;
            default:
                return '';
        }
    },
    validator: (node: SampleLoopNode): ValidationResponse => {
        switch (node.parameters.type) {
            case 'always':
                return { isValid: true };
            case 'xtimes':
                if (!node.parameters.xtimes || node.parameters.xtimes < 1 || !node.parameters.loopVariable) {
                    return { isValid: false, errorMessageKey: 'Missing required parameters' };
                }
                return { isValid: true };
            case 'expression':
                if (!node.parameters.expression) {
                    return { isValid: false, errorMessageKey: 'Missing expression' };
                }
                return { isValid: true };
        }
        return { isValid: false };
    },
    generateCodeBeforeChildren: (node: SampleLoopNode): ScriptBuilder => {
        const builder = new ScriptBuilder();

        switch (node.parameters.type) {
            case 'always':
                builder.beginWhileTrue();
                break;
            case 'xtimes':
                if (node.parameters.loopVariable?.name) {
                    builder.assign(node.parameters.loopVariable.name, '0');
                    builder.beginWhile(`${node.parameters.loopVariable.name} < ${node.parameters.xtimes}`);
                }
                break;
            case 'expression':
                if (node.parameters.expression !== undefined) {
                    builder.beginWhile(node.parameters.expression);
                }
                break;
        }
        return builder;
    },
    generateCodeAfterChildren: (node: SampleLoopNode): ScriptBuilder => {
        let builder: ScriptBuilder;

        if (node.parameters.type === 'xtimes' && node.parameters.loopVariable?.name) {
            builder = new ScriptBuilder('', ScriptBuilder.SINGLE_INDENT_LEVEL);
            builder.incrementVariable(node.parameters.loopVariable.name);
            builder.endBlock();
        } else {
            builder = new ScriptBuilder('');
        }

        return builder.end();
    },
};

registerProgramBehavior(behaviors);
