/// <reference lib="webworker" />
import {
    ApplicationBehaviors,
    registerApplicationBehavior
} from '@universal-robots/contribution-api';
import { SimpleRestApplicationNode } from './simple-rest-application-node.node';

// factory is required
const createApplicationNode = async (): Promise<SimpleRestApplicationNode> => ({
    type: 'ur-simple-rest-application-node',
    version: '1.0.0'
});

const behaviors: ApplicationBehaviors = {
    factory: createApplicationNode
};

registerApplicationBehavior(behaviors);
