import { FrameName, MoveToAdvancedSettings, MoveType, RobotSettings, URVariable } from '@universal-robots/contribution-api';
import { MoveToFieldValidation } from '../move-to.validation.model';

export interface MoveToDialogModel extends MoveToAdvancedSettings {
    moveType: MoveType;
    variables: URVariable[];
    robotSettings: RobotSettings;
    frames: FrameName[];
    fieldValidation: MoveToFieldValidation['advanced'];
}
