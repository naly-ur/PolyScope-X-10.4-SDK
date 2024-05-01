const api = require('@universal-robots/contribution-api');
const { ScriptBuilder } = require('@universal-robots/contribution-api');

const programBehaviors = {
    programNodeLabel: createProgramNodeLabel,
    factory: createProgramNode,
    generateCodeBeforeChildren: generateScriptCodeBefore,
    generateCodeAfterChildren: generateScriptCodeAfter,
    generateCodePreamble: generatePreambleScriptCode,
    validator: validate,
    allowsChild: allowChildInsert,
    allowedInContext: allowedInsert,
    upgradeNode: nodeUpgrade
};

// programNodeLabel is required
async function createProgramNodeLabel(node) {
    return '<%= programNodeTitle %>';
}

// factory is required
async function createProgramNode() {
    return {
        type: '<%= programTagName %>',     // type is required
        version: '1.0.0',
        parameters: {
        }
    };
}

// generateCodeBeforeChildren is optional
async function generateScriptCodeBefore(node) {
    return new ScriptBuilder();
}

// generateCodeAfterChildren is optional
async function generateScriptCodeAfter(node) {
    return new ScriptBuilder();
}

// generateCodePreamble is optional
async function generatePreambleScriptCode(node) {
    return new ScriptBuilder();
}

// validator is optional
async function validate(node, context) {
    return {
      isValid: true
    };
}

// allowsChild is optional
async function allowChildInsert(parent, childType) {
    return true;
}

// allowedInContext is optional
async function allowedInsert(context) {
    return true;
}

// upgradeNode is optional
async function nodeUpgrade(loadedNode) {
  return loadedNode;
}

api.registerProgramBehavior(programBehaviors);

