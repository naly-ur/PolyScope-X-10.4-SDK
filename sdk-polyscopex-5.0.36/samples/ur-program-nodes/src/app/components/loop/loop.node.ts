import { ProgramNode, URVariable } from "@universal-robots/contribution-api";

export interface SampleLoopNode extends ProgramNode {
  type: "ur-sample-node-loop";
  parameters: {
    type: 'always' | 'xtimes' | 'expression';
    expression?: string;
    loopVariable?: URVariable;
    xtimes?: number;
  };
}
