import { Force, ProgramNode, TabInputModel} from "@universal-robots/contribution-api";

export interface ToolForceDirection {
  enabled: boolean;
  force?: Force;
}

export interface SampleToolForceNode extends ProgramNode {
  type: "ur-sample-node-tool-force";
  parameters: {
    x: {
      isValid: boolean;
      model: TabInputModel<ToolForceDirection>;
    };
    y: {
      isValid: boolean;
      model: TabInputModel<ToolForceDirection>;
    };
    z: {
      isValid: boolean;
      model: TabInputModel<ToolForceDirection>;
    };
  };
}
