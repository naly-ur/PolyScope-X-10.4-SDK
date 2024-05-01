/// <reference lib="webworker" />
import { ApplicationBehaviors, registerApplicationBehavior, ScriptBuilder, } from '@universal-robots/contribution-api';
import { GripDistanceApplicationNode } from './gripdistance-application.node';

const behaviors: ApplicationBehaviors = {
    factory: (): GripDistanceApplicationNode => ({
        type: 'ur-sample-gripdistance-application',
        closedDistance: { value: 0, unit: 'mm' },
        openDistance: { value: 300, unit: 'mm' },
        version: '1.0.0' // version is required
    }),
    generatePreamble: (): ScriptBuilder => {
        const builder = new ScriptBuilder();
        builder.defineFunction('setGripper', 'grip_distance');
        builder.localVariable('gripper_pin', '1');
        builder.localVariable('grip_min_dist', '0');
        builder.localVariable('grip_max_dist', '300');
        builder.localVariable('min_analog', '0');
        builder.localVariable('max_analog', '24');
        builder.localVariable('target_analog', '(grip_distance - min_analog) / (grip_max_dist - grip_min_dist)');
        builder.addStatements('set_analog_out(gripper_pin, target_analog)');
        builder.end();

        return builder;
    }
};

registerApplicationBehavior(behaviors);
