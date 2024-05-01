/// <reference lib="webworker" />
import {
  ProgramBehaviors, ProgramNode,
  registerProgramBehavior,
  ScriptBuilder
} from '@universal-robots/contribution-api';
import {GripperAction, XmlrpcGripperPrgNode} from './xmlrpc-gripper-prg.node';

const createGripLabel = async (node: XmlrpcGripperPrgNode): Promise<string> => {
  const gripDetected = node.parameters.isGripDetected ? ` -> ${node.parameters.onGripDetected}` : '';
  const gripNotDetected = node.parameters.isGripNotDetected ? ` -> ${node.parameters.onGripNotDetected}` : '';

  return `Grip (${node.parameters.width},${node.parameters.force}) ${gripDetected}${gripNotDetected}`;
};
const createReleaseLabel = async (node: XmlrpcGripperPrgNode): Promise<string> =>
  `Release (${node.parameters.width})`;


const createProgramNodeLabel = async (node: XmlrpcGripperPrgNode): Promise<string> =>
  node.parameters.action === GripperAction.grip ? createGripLabel(node) : createReleaseLabel(node);

// factory is required
const createProgramNode = async (): Promise<XmlrpcGripperPrgNode> => ({
  type: 'universal-robots-xmlrpc-gripper-web-xmlrpc-gripper-prg',
  version: '1.0.0', // version is required
  lockChildren: false,
  allowsChildren: false,
  parameters: {
    action: GripperAction.grip,
    width: 50,
    force: 10,
    isGripDetected: false,
    onGripDetected: '',
    isGripNotDetected: false,
    onGripNotDetected: ''
  },
});

const generateGripCode = (node: XmlrpcGripperPrgNode) => {
  const builder = new ScriptBuilder();
  const width: number = node.parameters.width;
  const force: number = node.parameters.force;
  builder.addStatements(
    `xmlrpc_gripper_var.grip(${width},${force})\n` +
    'xmlrpc_gripper_wait_while_busy()\n'
  );
  if (node.parameters.isGripDetected && node.parameters.onGripDetected && node.parameters.onGripDetected.length>0) {
    builder.addStatements(
      'if (is_xmlrpc_gripper_detected()):\n' +
      `\t${node.parameters.onGripDetected}()\n` +
      'end\n'
    );
  }
  if (node.parameters.isGripDetected && node.parameters.onGripDetected && node.parameters.onGripDetected.length>0) {
    builder.addStatements(
      'if (is_xmlrpc_gripper_detected() == False):\n' +
      `\t${node.parameters.onGripNotDetected}()\n` +
      'end\n'
    );
  }
  return builder;
};

const generateReleaseCode = (node: XmlrpcGripperPrgNode) => {
  const builder = new ScriptBuilder();
  builder.addStatements(
    'xmlrpc_gripper_var.release(' + node.parameters.width + ')\n' +
    'xmlrpc_gripper_wait_while_busy()\n'
  );
  return builder;
};

const generateScriptCodeBefore = (node: XmlrpcGripperPrgNode): ScriptBuilder =>
  (node.parameters.action === GripperAction.grip) ? generateGripCode(node) : generateReleaseCode(node);

// Add upgrade implementation here
const nodeUpgrade = (loadedNode: ProgramNode): ProgramNode => loadedNode;

const behaviors: ProgramBehaviors = {
  programNodeLabel: createProgramNodeLabel,
  factory: createProgramNode,
  generateCodeBeforeChildren: generateScriptCodeBefore,
  upgradeNode: nodeUpgrade
};

registerProgramBehavior(behaviors);
