import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnChanges, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CommonProgramPresenterComponent } from '../common-program-presenter.component';
import { TabInputModel, URVariable, VariableValueType } from '@universal-robots/contribution-api';
import { InputValidator, SelectedInput, TabInputValue } from '@universal-robots/ui-models';
import {SampleToolForceNode} from "./tool-force.node";

type AXIS = 'x' | 'y' | 'z';

@Component({
    templateUrl: './tool-force.component.html',
    styleUrls: ['./tool-force.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolForceComponent extends CommonProgramPresenterComponent<SampleToolForceNode> implements OnChanges {
    maxToolForce: number;
    variableType = VariableValueType;
    variables: URVariable[] = [];
    axes: AXIS[] = ['x', 'y', 'z'];

    validators: Array<InputValidator>;
    // Feature flag for the test mode
    testModeEnabled = false;

    constructor(protected readonly translateService: TranslateService, protected readonly cd: ChangeDetectorRef) {
        super(translateService, cd);
        this.validators = [
            (value) => {
                value = Number(value);
                if (value > this.maxToolForce || value < -this.maxToolForce) {
                    return this.translateService.instant('presenter.tool-force.validation-error', { lim: this.maxToolForce });
                }
                return null;
            },
        ];
    }

    async fetchVariables() {
        return await this.presenterAPI.symbolService.getVariables();
    }

    async ngOnChanges(changes: SimpleChanges): Promise<void> {
        super.ngOnChanges(changes);
        if (changes.presenterAPI?.firstChange) {
            this.maxToolForce = await this.presenterAPI.safetyService.getMaxToolForce();
            this.variables = await this.fetchVariables();
            this.cd.detectChanges();
        }
    }

    async onSetContributedNode() {
        super.onSetContributedNode();
        const variables = await this.fetchVariables();
        const enabledAxes = Object.values(this.contributedNode.parameters).filter((item) => item.model.entity.enabled);
        const notEnabledAxes = Object.values(this.contributedNode.parameters).filter((item) => !item.model.entity.enabled);

        for (const singleNode of notEnabledAxes) {
            singleNode.isValid = true;
        }

        //Validate all enabled nodes
        for (const singleNode of enabledAxes) {
            const isSuppressed = await this.presenterAPI.symbolService.isSuppressed(singleNode.model.value as string);
            const isRegistered = await this.presenterAPI.symbolService.isRegisteredVariableName(singleNode.model.value as string);

            singleNode.isValid = String(singleNode.model.value).length > 0;

            //If variable is chosen.
            if (singleNode.model.selectedType === SelectedInput.VARIABLE) {
                const variable = variables.find((urVariable) => urVariable.name === singleNode.model.value);
                if (variable && variable.valueType === VariableValueType.FLOAT && !isSuppressed && isRegistered) {
                    singleNode.isValid = true;
                }

                if (isSuppressed || !isRegistered) {
                    singleNode.isValid = false;
                }
            }
        }

        this.cd.detectChanges();
    }

    toggle(axis: AXIS) {
        const toggledAxis = this.contributedNode.parameters[axis].model.entity;
        toggledAxis.enabled = !toggledAxis.enabled;
        if (toggledAxis.enabled && !toggledAxis.force) {
            toggledAxis.force = {
                value: 0.0,
                unit: 'N',
            };
        }
        this.saveNode();
    }

    setForce(axis: AXIS, $event: TabInputValue) {
        const tabInput = this.contributedNode.parameters[axis];
        if (tabInput.model.entity.force) {
            TabInputModel.setTabInputValue(tabInput.model, $event);
            this.saveNode();
        }

        this.cd.detectChanges();
    }
    getToolForce(axis: AXIS) {
        return TabInputModel.getTabInputValue(this.contributedNode.parameters[axis].model);
    }

    getLabel(axis: AXIS) {
        const forceString = this.translateService.instant('presenter.tool-force.force');
        return `${forceString} ${axis.toUpperCase()}`;
    }
}
