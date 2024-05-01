import { Current, Voltage, ProgramNode } from "@universal-robots/contribution-api";

export type SignalValue = boolean | Current | Voltage;

export interface SampleSetNode extends ProgramNode {
  type: "ur-sample-node-set";
  parameters: {
    signalOutput?: {
      sourceID?: string;
      signalID?: string;
      value?: SignalValue;
    };
  };
}
