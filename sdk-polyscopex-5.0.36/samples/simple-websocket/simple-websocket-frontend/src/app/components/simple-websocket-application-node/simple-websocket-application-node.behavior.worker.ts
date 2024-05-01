/// <reference lib="webworker" />
import {
    ApplicationBehaviors,
    registerApplicationBehavior
} from '@universal-robots/contribution-api';
import { SimpleWebsocketApplicationNode } from './simple-websocket-application-node.node';

const createApplicationNode = async (): Promise<SimpleWebsocketApplicationNode> => ({
    type: 'ur-simple-websocket-application-node',
    version: '1.0.0'
});

const behaviors: ApplicationBehaviors = {
    factory: createApplicationNode,
};

registerApplicationBehavior(behaviors);
