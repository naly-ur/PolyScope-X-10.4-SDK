import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnChanges, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { URVariable, VariableValueType } from '@universal-robots/contribution-api';
import { CommonProgramPresenterComponent } from '../common-program-presenter.component';
import { getExpressionValidator, getVariableNameValidator, getXTimesValidator } from '../validator-helper';
import { DropdownOption, InputValidator } from '@universal-robots/ui-models';
import {SampleLoopNode} from "./loop.node";

export enum LoopType {
    ALWAYS = 'always',
    XTIMES = 'xtimes',
    EXPRESSION = 'expression',
}
@Component({
    templateUrl: './loop.component.html',
    styleUrls: ['./loop.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoopComponent extends CommonProgramPresenterComponent<SampleLoopNode> implements OnChanges {
    validators: Array<InputValidator>;
    expressionValidator: InputValidator;
    xTimeValidator: InputValidator;
    loopOptions: Array<DropdownOption>;
    constructor(protected readonly translateService: TranslateService, protected readonly cd: ChangeDetectorRef) {
        super(translateService, cd);
        this.loopOptions = [
            {
                label: this.translateService.instant('presenter.loop.label_dropdown.loop_always'),
                value: LoopType.ALWAYS,
            },
            {
                label: this.translateService.instant('presenter.loop.label_dropdown.loop_xtimes'),
                value: LoopType.XTIMES,
            },
            {
                label: this.translateService.instant('presenter.loop.label_dropdown.expression'),
                value: LoopType.EXPRESSION,
            },
        ];
    }

    async setType(loopOption: DropdownOption & { value: LoopType }) {
        if (loopOption.value === LoopType.XTIMES) {
            this.contributedNode.parameters.loopVariable = await this.presenterAPI.symbolService.generateVariable(
                'Loop',
                VariableValueType.INTEGER
            );
        } else {
            delete this.contributedNode.parameters.loopVariable;
        }
        this.contributedNode.parameters.type = loopOption.value;
        this.saveNode();
        this.setValidators();
    }

    setXTimes(times: number) {
        this.contributedNode.parameters.xtimes = times;
        this.saveNode();
    }

    ngOnChanges(changes: SimpleChanges) {
        super.ngOnChanges(changes);
        if (this.translateService && this.presenterAPI && this.contributedNode) {
            this.setValidators();
        }
    }

    setValidators() {
        this.validators = [getVariableNameValidator.bind(this)(this.contributedNode?.parameters?.loopVariable?.name)];
        this.expressionValidator = getExpressionValidator.bind(this)();
        this.xTimeValidator = getXTimesValidator.bind(this)();
    }

    setVariable(name: string) {
        this.contributedNode.parameters.loopVariable = new URVariable(name, VariableValueType.INTEGER);
        this.saveNode();
    }

    setExpression(expression: string) {
        this.contributedNode.parameters.expression = expression;
        this.saveNode();
    }
}
