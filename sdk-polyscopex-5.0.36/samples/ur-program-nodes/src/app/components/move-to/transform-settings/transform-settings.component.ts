import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    Output,
    SimpleChanges,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MoveToTransformSettings, URVariable, VariableValueType } from '@universal-robots/contribution-api';
import { DropdownOption } from '@universal-robots/ui-models';

@Component({
    selector: 'ur-move-to-transform-settings',
    templateUrl: './transform-settings.component.html',
    styleUrls: ['./transform-settings.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransformSettingsComponent implements OnChanges {
    @Input()
    transformSettings: MoveToTransformSettings;

    @Input()
    variables: URVariable[] = [];

    @Output()
    transformSettingsChanged = new EventEmitter<MoveToTransformSettings>();

    noneOption: DropdownOption;
    poseVariableOptions: DropdownOption[];
    selectedPoseVariableOption: DropdownOption;

    constructor(protected readonly translateService: TranslateService, protected readonly cd: ChangeDetectorRef) {
        this.noneOption = { label: this.translateService.instant('presenter.move-to.label.none'), details: 'none' };
        this.poseVariableOptions = [this.noneOption];
    }

    ngOnChanges(changes: SimpleChanges): void {
        if ((changes.variables && this.transformSettings) || (changes.transformSettings && this.variables)) {
            const vars: URVariable[] = changes.variables?.currentValue ?? this.variables;
            this.poseVariableOptions = [this.noneOption].concat(
                vars
                    .filter((v: URVariable) => v?.valueType === VariableValueType.POSE)
                    .map((va: URVariable) => {
                        return { label: va.name, invalid: va.suppressed } as DropdownOption;
                    })
            );
            const name =
                (changes.transformSettings?.currentValue as MoveToTransformSettings)?.poseVariable?.name ??
                this.transformSettings?.poseVariable?.name;
            const selectedVariable = vars.find((variable) => variable.name === name);
            const invalid = !selectedVariable || selectedVariable.suppressed;
            this.selectedPoseVariableOption = name ? ({ label: name, invalid } as DropdownOption) : this.noneOption;
        }
    }

    setSelectedTransformVariable(option: DropdownOption) {
        let poseVar;
        if (option.details === 'none') {
            this.transformSettings.transform = false;
        } else {
            this.transformSettings.transform = true;
            poseVar = new URVariable(option.label, VariableValueType.POSE, true);
        }
        this.transformSettings.poseVariable = poseVar;
        this.selectedPoseVariableOption = poseVar ? ({ label: option.label } as DropdownOption) : this.noneOption;
        this.transformSettingsChanged.emit(this.transformSettings);
    }
}
