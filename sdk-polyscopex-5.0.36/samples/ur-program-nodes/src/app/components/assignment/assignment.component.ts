import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnChanges, signal, SimpleChanges, WritableSignal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
    MoveScreenOptions,
    Pose,
    PositionType,
    TabInputModel,
    URVariable,
    VariableValueType,
} from '@universal-robots/contribution-api';
import { CommonProgramPresenterComponent } from '../common-program-presenter.component';
import { DropdownOption, InputValidator, SelectedInput, TabInputValue } from '@universal-robots/ui-models';
import { getVariableNameValidator } from '../validator-helper';
import {SampleAssignmentNode} from "./assignment.node";

@Component({
    templateUrl: './assignment.component.html',
    styleUrls: ['./assignment.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssignmentComponent extends CommonProgramPresenterComponent<SampleAssignmentNode> implements OnChanges {
    PositionType = PositionType;
    variables: URVariable[];
    variableOptions: DropdownOption[];
    valueTypeOpen = false;
    wayPointSources: DropdownOption[];
    expressionValidators: ((input: string) => any)[] = [];
    variableNameValidator: InputValidator;
    selectedVariableOption = signal<DropdownOption | undefined>(undefined);

    filteredVariables: WritableSignal<URVariable[]> = signal([]);

    isTabInput: WritableSignal<boolean> = signal(false);

    variableTypes = Object.values(VariableValueType).filter((val) => val !== VariableValueType.FRAME);

    popoverTranslations = {
        popoverHeader: '',
        createNewOption: '',
        placeholderText: '',
        createInputLabel: '',
    };

    constructor(protected readonly translateService: TranslateService, protected readonly cd: ChangeDetectorRef) {
        super(translateService, cd);
    }

    private async fetchVariables() {
        this.variables = (await this.presenterAPI.symbolService.getVariables()).filter(
            (variable) => variable.valueType !== VariableValueType.FRAME
        );
    }

    capitalizedLabel(label: string) {
        return label.charAt(0).toUpperCase() + label.slice(1);
    }

    updateFilteredVariables() {
        this.filteredVariables.set(
            this.variables.filter((variable) => {
                return variable.valueType !== VariableValueType.FRAME && variable.name !== this.contributedNode.parameters.variable?.name
                    ? variable
                    : '';
            })
        );
    }
    resetValues() {
        this.contributedNode.parameters.expression = '';
        TabInputModel.setTabInputValue(this.contributedNode.parameters.tabInputExpression, {
            selectedType: SelectedInput.VALUE,
            value: '',
        });
    }

    async ngOnChanges(changes: SimpleChanges) {
        super.ngOnChanges(changes);

        if (changes.presenterAPI?.firstChange) {
            this.wayPointSources = this.getWaypointSources();
        }

        if (changes.contributedNode) {
            this.updateIsTabInput();
        }
    }

    onSetRobotSettings() {
        super.onSetRobotSettings();
        this.setPopoverTranslations();
        this.setValidators();
    }

    async onSetContributedNode() {
        super.onSetContributedNode();

        // Set UI validation state:
        const tabInputExpression = this.contributedNode.parameters.tabInputExpression;

        if (tabInputExpression.selectedType === SelectedInput.VARIABLE || tabInputExpression?.selectedType === SelectedInput.EXPRESSION) {
            const isSuppressed = await this.presenterAPI.symbolService.isSuppressed(tabInputExpression.value as string);
            isSuppressed || (this.contributedNode.parameters.tabInputExpression.value as string).length < 1
                ? (this.contributedNode.parameters.isValid = false)
                : (this.contributedNode.parameters.isValid = true);
        }

        this.contributedNode.parameters.isValid = String(tabInputExpression.value).length > 0;

        // non-tabInput types validation:
        this.setValidators();

        // get latest variables list:
        await this.fetchVariables();

        // based on latest variables list, update dropdown items (& validation):
        await this.setVariablesOptions();

        this.updateFilteredVariables();

        await this.setSelectedVariable();

        this.cd.detectChanges();
    }

    private async setVariablesOptions() {
        this.variableOptions = await Promise.all(
            this.variables.map(async (variable) => {
                const isSuppressed = await this.presenterAPI.symbolService.isSuppressed(variable.name);
                const isValidVariable = await this.presenterAPI.symbolService.isRegisteredVariableName(variable.name);
                return {
                    label: variable.name,
                    value: variable.name,
                    invalid: isSuppressed || !isValidVariable,
                } as DropdownOption;
            })
        );

        // If this node is suppressed, do not reflect valid states in dropdown items.
        if (this.contributedNode.isSuppressed) {
            return;
        }
    }

    private async setSelectedVariable() {
        if (this.contributedNode.parameters.variable) {
            const variable = this.contributedNode.parameters.variable;
            const isSuppressed = await this.presenterAPI.symbolService.isSuppressed(variable.name);
            const isValidVariable = await this.presenterAPI.symbolService.isRegisteredVariableName(variable.name);
            this.selectedVariableOption.set({
                label: variable.name,
                value: variable.name,
                invalid: isSuppressed || !isValidVariable,
            } as DropdownOption);
        } else {
            this.selectedVariableOption.set(undefined);
        }
    }

    setPopoverTranslations() {
        this.popoverTranslations.popoverHeader = this.translateService.instant('presenter.assignment.label.pick_variable');
        this.popoverTranslations.placeholderText = this.translateService.instant('presenter.assignment.label.pick_variable_placeholder');
        this.popoverTranslations.createNewOption = this.translateService.instant('presenter.assignment.label.create_new_option');
        this.popoverTranslations.createInputLabel = this.translateService.instant('presenter.assignment.label.name');
    }

    setValidators() {
        this.expressionValidators = [
            (input: string) => {
                if (this.getWaypointSource() === PositionType.Expression && input.length === 0) {
                    return this.translateService.instant('presenter.assignment.empty_expression_error');
                }
                return null;
            },
            (input: string) => {
                if (!input) {
                    return this.translateService.instant('presenter.assignment.empty_expression_error');
                }
                return null;
            },
        ];

        this.variableNameValidator = getVariableNameValidator.bind(this)();
    }

    async setNewVariable(newVariable: unknown) {
        this.contributedNode.parameters.variable = await this.presenterAPI.symbolService.generateVariable(
            newVariable as string,
            this.contributedNode.parameters.variable.valueType ?? VariableValueType.STRING
        );
        this.saveNode();
    }

    async selectVariable(selectedVariableOption: unknown) {
        const selectedVariable = selectedVariableOption as DropdownOption;
        if (selectedVariable.label === this.contributedNode.parameters.variable.name) {
            return;
        }
        const referenceType = this.variables.find((variable) => variable.name === selectedVariable.label)?.valueType;
        this.contributedNode.parameters.variable = new URVariable(selectedVariable.label, referenceType, true);
        if (referenceType === VariableValueType.WAYPOINT) {
            this.contributedNode.parameters.waypointParameters = {
                waypointSource: PositionType.Teach,
            };
        }
        this.saveNode();
    }

    setExpression($event: string) {
        this.contributedNode.parameters.expression = $event;
        this.saveNode();
    }

    setTabInputExpression($event: TabInputValue) {
        TabInputModel.setTabInputValue(this.contributedNode.parameters.tabInputExpression, $event);
        this.contributedNode.parameters.tabInputExpression.value = String($event.value);

        this.saveNode();
    }

    getTabInputExpression() {
        const tabInputExpression = this.contributedNode.parameters.tabInputExpression;
        const tabInputExpressionValue = this.contributedNode.parameters.tabInputExpression.value;
        const valueType = this.contributedNode.parameters.variable.valueType;

        if ((valueType === VariableValueType.FLOAT || valueType === VariableValueType.INTEGER) && tabInputExpressionValue == 0) {
            this.contributedNode.parameters.isValid = true;
        }

        //this ensures that the display on the program page is correct for the value types
        if (valueType === VariableValueType.FLOAT && tabInputExpression.selectedType === SelectedInput.VALUE) {
            tabInputExpression.value = Number(tabInputExpressionValue).toFixed(2);
            return TabInputModel.getTabInputValue(tabInputExpression);
        }
        if (valueType === VariableValueType.INTEGER && tabInputExpression.selectedType === SelectedInput.VALUE) {
            tabInputExpression.value = Math.round(Number(tabInputExpressionValue));
            return TabInputModel.getTabInputValue(tabInputExpression);
        }

        return TabInputModel.getTabInputValue(tabInputExpression);
    }

    getTypes(): string[] {
        return Object.values(VariableValueType).filter((val) => val !== VariableValueType.FRAME);
    }

    getWaypointSources() {
        return [
            {
                label: this.translateService.instant('presenter.assignment.label.teach'),
                value: PositionType.Teach,
            },
            {
                label: this.translateService.instant('presenter.assignment.label.expression'),
                value: PositionType.Expression,
            },
        ];
    }

    setType($event: unknown) {
        this.resetValues();

        const value = $event as string;

        this.contributedNode.parameters.variable = {
            ...this.contributedNode.parameters.variable,
            valueType: VariableValueType[value.toUpperCase()],
        };

        if (value.toUpperCase() === 'WAYPOINT') {
            this.contributedNode.parameters.waypointParameters = {
                waypointSource: PositionType.Teach,
            };
        }
        if (value.toUpperCase() === 'FLOAT' || value.toUpperCase() === 'INTEGER') {
            TabInputModel.setTabInputValue(this.contributedNode.parameters.tabInputExpression, {
                selectedType: SelectedInput.VALUE,
                value: 0,
            });
        }

        this.saveNode();
        this.cd.detectChanges();

        this.updateIsTabInput();
    }

    getWaypointSourceLabel() {
        return this.translateService.instant(
            `presenter.assignment.label.${this.contributedNode.parameters.waypointParameters?.waypointSource?.toLowerCase()}`
        );
    }

    public async openMoveScreenClicked(): Promise<void> {
        window.parent.performance.mark('setWaypointStart');
        if (this.contributedNode.parameters.variable?.name && this.contributedNode.parameters.waypointParameters) {
            const options: MoveScreenOptions = {
                moveScreenTarget: 'waypoint',
                moveScreenTargetLabel: this.contributedNode.parameters.variable.name,
            };
            const position = await this.presenterAPI.robotMoveService.openMoveScreen(options);
            if (position) {
                this.contributedNode.parameters.waypointParameters.position = position.kinematicPosition;
                this.saveNode();
            }
        }
    }

    public async openAutoMoveScreen(): Promise<void> {
        window.parent.performance.mark('loadAutoMoveStart');
        if (this.isPositionSet()) {
            // TODO: get jointpositions from kinematics API
            const jointPositions = null;
            if (jointPositions) {
                await this.presenterAPI.robotMoveService.autoMove(jointPositions);
            }
        }
    }

    public isPositionSet(): boolean {
        const params = this.contributedNode?.parameters?.waypointParameters;
        return params?.position !== undefined && params.position.links !== undefined && params.position.jointVector !== undefined;
    }

    public getWaypointSource(): PositionType | undefined {
        return this.contributedNode.parameters.waypointParameters?.waypointSource;
    }

    public setWaypointSource($event: unknown) {
        this.resetValues();

        const option = $event as DropdownOption;

        if (this.contributedNode.parameters.waypointParameters) {
            this.contributedNode.parameters.waypointParameters.waypointSource = option.value as PositionType;
            this.saveNode();
        }
    }

    tickValueOpen() {
        setTimeout(() => {
            this.valueTypeOpen = false;
            this.cd.detectChanges();
        }, 100);
    }

    updateIsTabInput() {
        const { valueType } = this.contributedNode.parameters.variable;

        if (valueType === 'string' || valueType === 'integer' || valueType === 'float') {
            this.isTabInput.set(true);
        } else {
            this.isTabInput.set(false);
        }
    }
}
