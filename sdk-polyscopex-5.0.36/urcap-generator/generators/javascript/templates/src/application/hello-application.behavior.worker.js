const api = require('@universal-robots/contribution-api');
const { ScriptBuilder } = require('@universal-robots/contribution-api');

const applicationBehaviors = {
    factory: createApplicationNode,
    generatePreamble: generatePreambleScriptCode,
    upgradeNode: upgradeApplicationNode,
    downgradeNode: downgradeApplicationNode
};

// factory is required
async function createApplicationNode() {
    return {
        type: '<%= applicationTagName %>',    // type is required
        version: '1.0.0'                      // version is mandatory
    };
}

// generatePreamble is optional
 function generatePreambleScriptCode(node, context) {
    const builder = new ScriptBuilder();
    return builder;
}

// upgradeNode is optional
function upgradeApplicationNode(loadedNode, defaultNode, context) {
    return defaultNode;
}

// downgradeNode is optional
function downgradeApplicationNode(loadedNode, defaultNode, context) {
    return defaultNode;
}

api.registerApplicationBehavior(applicationBehaviors);
