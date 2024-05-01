import { ValidationResponse } from '@universal-robots/contribution-api';

export type MoveToValidationResponse = ValidationResponse & { fieldValidation: MoveToFieldValidation };

export interface MoveToFieldValidation {
    position: boolean;
    point: boolean;
    advanced: {
        speed: boolean;
        acceleration: boolean;
        transform: boolean;
        frame: boolean;
        blend: boolean;
    };
}

export const getDefaultMoveToValidation = (): MoveToFieldValidation => {
    return {
        position: true,
        point: true,
        advanced: {
            blend: true,
            transform: true,
            frame: true,
            acceleration: true,
            speed: true,
        },
    };
};
