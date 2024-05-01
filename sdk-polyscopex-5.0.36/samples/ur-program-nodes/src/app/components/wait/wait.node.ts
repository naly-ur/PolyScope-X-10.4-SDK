import {ProgramNode, TabInputModel, Time} from "@universal-robots/contribution-api";

export interface SampleWaitNode extends ProgramNode {
  type: "ur-sample-node-wait";
  parameters: {
    type: 'time' | 'signalInput';
    time?: TabInputModel<Time>;
    signalInput?: {
      sourceID?: string;
      signalID?: string;
      analogOperator?: '<' | '>';
      value?;
    };
  };
}
