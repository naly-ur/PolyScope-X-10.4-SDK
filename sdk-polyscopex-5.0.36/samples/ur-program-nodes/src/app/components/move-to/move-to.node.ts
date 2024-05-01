import {
  Acceleration,
  AngularAcceleration,
  AngularSpeed,
  Length,
  Speed,
  KinematicPosition,
  ProgramNode,
  TabInputModel,
  URVariable
} from "@universal-robots/contribution-api";

export type MoveType = 'moveJ' | 'moveL';
export type PointModel = { variable?: URVariable; position?: KinematicPosition };

export interface SampleMoveToNode extends ProgramNode {
  type: "ur-sample-node-move-to";
  parameters: {
    moveType: MoveType;
    point: TabInputModel<PointModel>;
    advanced: MoveToAdvancedSettings;
  };
}

export interface MoveToAdvancedSettings {
  speed: MoveToSpeedSettings;
  reference: MoveToReferenceSettings;
  transform: MoveToTransformSettings;
  blend: MoveToBlendSettings;
}

export interface MoveToSpeedSettings {
  speed: TabInputModel<Speed | AngularSpeed>;
  acceleration: TabInputModel<Acceleration | AngularAcceleration>;
}

export interface MoveToReferenceSettings {
  frame: {
    frameId: string;
    translationKey?: string;
  };
}

export interface MoveToBlendSettings {
  enabled: boolean;
  radius?: TabInputModel<Length>;
}

export interface MoveToTransformSettings {
  transform: boolean;
  poseVariable?: URVariable;
}
