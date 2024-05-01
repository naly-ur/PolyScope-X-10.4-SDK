/// <reference lib="webworker" />
import {
  ApplicationBehaviors,
  registerApplicationBehavior,
  ScriptBuilder
} from '@universal-robots/contribution-api';
import { XmlrpcGripperAppNode } from './xmlrpc-gripper-app.node';

const createApplicationNode = (): XmlrpcGripperAppNode => ({
  type: 'universal-robots-xmlrpc-gripper-web-xmlrpc-gripper-app',    // type is required
  version: '1.0.0'     // version is required
});

const generatePreambleScriptCode = () => {
  const builder = new ScriptBuilder();
  builder.addStatements(
    '\n' +
    '#### XmlRpc Gripper Preamble #######################\n' +
    'set_tool_voltage(24)\n' +
    'set_tool_communication(True, 1000000, 2, 1, 1.5, 3.5)\n' +
    'xmlrpc_gripper_var=rpc_factory("xmlrpc",' +
    ' "http://servicegateway/universal-robots/xmlrpc-gripper/xmlrpc-gripper-backend/xmlrpc/")\n' +
    '\n' +
    'def xmlrpc_gripper_wait_while_busy():\n' +
    '\tsleep(0.2)\n' +
    '\twhile (xmlrpc_gripper_var.is_busy()):\n' +
    '\t\tsleep(0.2)\n' +
    '\t\tsync()\n' +
    '\tend\n' +
    'end\n' +
    '\n' +
    'def is_xmlrpc_gripper_detected():\n' +
    '\tlocal xmlrpc_gripper_counter = 10\n' +
    '\twhile (xmlrpc_gripper_counter > 0):\n' +
    '\t\tif (xmlrpc_gripper_var.is_grip_detected()):\n' +
    '\t\t\treturn True\n' +
    '\t\tend\n' +
    '\t\txmlrpc_gripper_counter = xmlrpc_gripper_counter - 1\n' +
    '\t\tsleep(0.2)\n' +
    '\t\tsync()\n' +
    '\tend\n' +
    '\treturn False\n' +
    'end\n' +
    '#####################################################\n');
  return builder;
};

const behaviors: ApplicationBehaviors = {
  factory: createApplicationNode,
  generatePreamble: generatePreambleScriptCode
};

registerApplicationBehavior(behaviors);
