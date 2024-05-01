import { ChangeDetectionStrategy, ChangeDetectorRef, Component, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
    ApplicationNodeType,
    Frame,
    FramesNode,
    MoveScreenOptions,
    MoveType,
    PointModel,
    TabInputModel,
    URVariable,
    VariableValueType,
} from '@universal-robots/contribution-api';
import { CloseReason, DropdownOption, InputValidator, TabInputValue, TabInputVariable } from '@universal-robots/ui-models';
import { CommonProgramPresenterComponent } from '../common-program-presenter.component';
import { getVariableNameValidator } from '../validator-helper';
import { MoveToDialogModel } from './move-to-settings-dialog/move-to-dialog.model';
import {
    getDefaultJointAcceleration,
    getDefaultJointSpeed,
    getDefaultLinearAcceleration,
    getDefaultLinearSpeed,
} from './move-to.constants';
import { MoveToFieldValidation, MoveToValidationResponse, getDefaultMoveToValidation } from './move-to.validation.model';
import {SampleMoveToNode} from "./move-to.node";

@Component({
    templateUrl: './move-to.component.html',
    styleUrls: ['./move-to.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoveToComponent extends CommonProgramPresenterComponent<SampleMoveToNode> {
    moveTypes: DropdownOption[] = [];
    allVariables: URVariable[] = [];
    waypointVariables: TabInputVariable[] = [];
    variableNameValidator: InputValidator;

    fieldValidation: MoveToFieldValidation;
    advancedSettingsIsValid = true; // shared handle for all advanced settings properties.
    tabinputValue = signal<TabInputValue>({ selectedType: 'VALUE', value: '' });

    constructor(protected readonly translateService: TranslateService, protected readonly cd: ChangeDetectorRef) {
        super(translateService, cd);
        this.moveTypes = [
            { value: 'moveJ', label: this.translateService.instant('presenter.move-to.label.type_joint') },
            { value: 'moveL', label: this.translateService.instant('presenter.move-to.label.type_linear') },
        ];
    }

    async onSetContributedNode() {
        super.onSetContributedNode();

        this.allVariables = await this.presenterAPI.symbolService.getVariables();

        this.variableNameValidator = getVariableNameValidator.bind(this)(this.contributedNode.parameters?.point.entity?.variable?.name);
        this.waypointVariables =
            this.allVariables
                .filter((variable) => variable.valueType === VariableValueType.WAYPOINT)
                .map((variable) => {
                    return {
                        name: variable.name,
                        valueType: 'string',
                    };
                }) ?? [];
        const point = this.contributedNode.parameters.point;
        if (point.selectedType === 'VALUE') {
            this.waypointVariables = this.waypointVariables.filter(
                (variable) => variable.name !== this.contributedNode.parameters.point.entity.variable?.name
            );
            if (point.value !== point.entity.variable?.name) {
                // Ensure the tabinputmodel value is synced when copying the node
                if (point.entity?.variable) {
                    point.value = point.entity.variable.name;
                }
            }
        }
        this.tabinputValue.set(point);

        // Validity of advanced settings properties:
        await this.updateValidation();

        this.cd.detectChanges();
    }

    async setMoveType(moveType: MoveType) {
        this.contributedNode.parameters.moveType = moveType;
        const speed = moveType === 'moveJ' ? getDefaultJointSpeed() : getDefaultLinearSpeed();
        const acceleration = moveType === 'moveJ' ? getDefaultJointAcceleration() : getDefaultLinearAcceleration();
        this.contributedNode.parameters.advanced.speed = {
            speed,
            acceleration,
        };
        this.saveNode();
    }

    setPointType(point: TabInputValue) {
        let entity: PointModel = {};
        if (point.selectedType === 'VALUE') {
            entity = {
                variable: new URVariable(point.value as string, VariableValueType.WAYPOINT),
                position: this.contributedNode.parameters.point.entity?.position,
            };
        }
        if (point.selectedType === 'VARIABLE') {
            entity = {
                variable: new URVariable(point.value as string, VariableValueType.WAYPOINT, true),
            };
        }
        this.contributedNode.parameters.point = new TabInputModel<PointModel>(entity, point.selectedType, point.value);
        this.saveNode();
    }

    async openMoveScreenClicked(): Promise<void> {
        if (!this.contributedNode.parameters.point.entity.variable || this.contributedNode.parameters.point.entity.variable.reference) {
            return;
        }
        window.parent.performance.mark('setWaypointStart');
        const options: MoveScreenOptions = {
            moveScreenTarget: 'waypoint',
            moveScreenTargetLabel: this.contributedNode.parameters.point.entity.variable.name,
        };
        const position = await this.presenterAPI.robotMoveService.openMoveScreen(options);
        if (position) {
            // TODO: set frame of position.kinematicPosition
            this.contributedNode.parameters.point.entity.position = position.kinematicPosition;
            this.saveNode();
        }
    }

    async openAutoMoveScreen(): Promise<void> {
        window.parent.performance.mark('loadAutoMoveStart');
        const position = this.contributedNode.parameters.point.entity.position;
        if (position) {
            // TODO: get jointpositions from kinematics API
            const jointPositions = null;
            if (jointPositions) {
                await this.presenterAPI.robotMoveService.autoMove(jointPositions);
            }
        }
    }

    getWaypointFrame(): Promise<Frame> {
        const frameId = this.contributedNode.parameters.advanced.reference.frame.frameId || 'base';
        return this.getFrame(frameId);
    }

    async getFrame(frameId: string): Promise<Frame> {
        const framesList = await this.getFramesList();
        return framesList.find((frame) => frame.name.frameId === frameId) || ({} as Frame);
    }

    async getFramesList(): Promise<Frame[]> {
        return ((await this.presenterAPI.applicationService.getApplicationNode(ApplicationNodeType.FRAMES)) as FramesNode).framesList;
    }

    public async openAdvancedSettingsDialog() {
        const dialogData = await this.presenterAPI.dialogService.openCustomDialog<MoveToDialogModel>('ur-move-to-settings-dialog', {
            ...this.contributedNode.parameters.advanced,
            moveType: this.contributedNode.parameters.moveType,
            variables: this.allVariables,
            robotSettings: this.robotSettings,
            frames: (await this.getFramesList()).map((frame) => frame.name),
            fieldValidation: this.fieldValidation.advanced,
        });
        const { reason, returnData } = dialogData;
        if (reason === CloseReason.CANCELLED) {
            return;
        }

        if (returnData && Object.keys(returnData).length > 0) {
            this.contributedNode.parameters.advanced = {
                speed: returnData.speed,
                blend: returnData.blend,
                reference: returnData.reference,
                transform: returnData.transform,
            };
            this.saveNode();
        }
    }

    private async updateValidation() {
        const validation = (await this.presenterAPI.validationService.getValidationResponse()) as MoveToValidationResponse;
        if (!validation) {
            return;
        }
        this.fieldValidation = validation.fieldValidation ?? getDefaultMoveToValidation();

        this.advancedSettingsIsValid = !Object.values(this.fieldValidation.advanced).some((valid) => !valid);
    }
}
