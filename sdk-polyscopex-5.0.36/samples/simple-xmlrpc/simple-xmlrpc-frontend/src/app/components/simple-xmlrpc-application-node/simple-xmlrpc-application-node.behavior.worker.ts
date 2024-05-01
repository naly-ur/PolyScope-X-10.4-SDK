/// <reference lib="webworker" />
import {
    ApplicationBehaviors,
    registerApplicationBehavior,
    ScriptBuilder,
} from '@universal-robots/contribution-api';
import {SimpleXmlrpcApplicationNode} from './simple-xmlrpc-application-node.node';

const createApplicationNode = async (): Promise<SimpleXmlrpcApplicationNode> => ({
    type: 'ur-simple-xmlrpc-application-node',
    version: '1.0.0'
});

const generatePreambleScriptCode = () => {
    const url = 'servicegateway/universal-robots/simple-xmlrpc/simple-xmlrpc-backend/xmlrpc';
    const builder = new ScriptBuilder();
    builder.addStatements(`xmlrpc_handle = rpc_factory("xmlrpc","${location.protocol}//${url}/")`);
    builder.addStatements(`global xmlrpc_response = xmlrpc_handle.echo_string_method("Hello World!")`);
    return builder;
};

const behaviors: ApplicationBehaviors = {
    factory: createApplicationNode,
    generatePreamble: generatePreambleScriptCode,
};

registerApplicationBehavior(behaviors);
