/// <reference lib="webworker" />
import {
    ApplicationBehaviors, ApplicationNode,
    registerApplicationBehavior,
    ScriptBuilder
} from '@universal-robots/contribution-api';
import { SimpledockerApplicationNodeNode } from './simple-docker-application-node.node';

// factory is required
const createApplicationNode = async (): Promise<SimpledockerApplicationNodeNode> => ({
    type: 'ur-sample-simple-docker-application',    // type is required
    version: '1.0.0' // version is required
});

// generatePreamble is optional
const generatePreambleScriptCode = () => {
    const builder = new ScriptBuilder();
    return builder;
};

// upgradeNode is optional
const upgradeApplicationNode
  = (loadedNode: ApplicationNode, defaultNode: SimpledockerApplicationNodeNode): SimpledockerApplicationNodeNode =>
      defaultNode;

// downgradeNode is optional
const downgradeApplicationNode
  = (loadedNode: ApplicationNode, defaultNode: SimpledockerApplicationNodeNode): SimpledockerApplicationNodeNode =>
      defaultNode;

const behaviors: ApplicationBehaviors = {
    factory: createApplicationNode,
    generatePreamble: generatePreambleScriptCode,
    upgradeNode: upgradeApplicationNode,
    downgradeNode: downgradeApplicationNode
};

registerApplicationBehavior(behaviors);
