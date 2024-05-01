import {ProgramNode, TabInputModel,KinematicPosition, URVariable} from "@universal-robots/contribution-api";

export enum PositionType {
  Teach = 'teach',
  Expression = 'expression',
}

export interface SampleAssignmentNode extends ProgramNode {
  type: "ur-sample-node-assignment";
  parameters: {
    waypointOptions?: 'edit' | 'set';
    isValid?: boolean;
    variable: URVariable;
    isNewVariable: boolean;
    expression: string;
    tabInputExpression: TabInputModel<string>;
    waypointParameters?: {
      waypointSource: PositionType;
      position?: KinematicPosition;
    };
  };
}
