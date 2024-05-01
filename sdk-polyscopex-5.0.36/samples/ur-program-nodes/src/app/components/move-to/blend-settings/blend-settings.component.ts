import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
    convertValue,
    Length,
    MoveToBlendSettings,
    TabInputModel,
    URVariable,
    Value,
    valueRawConverter,
} from '@universal-robots/contribution-api';
import { DropdownOption, SelectedInput, TabInputValue } from '@universal-robots/ui-models';
import { TranslateService } from '@ngx-translate/core';
import { getConvertedTabInputValue } from '../../tabinput-helper';
import { getRangeErrorString } from '../../validator-helper';
import { Units } from '@universal-robots/utilities-units';

@Component({
    selector: 'ur-blend-settings',
    templateUrl: './blend-settings.component.html',
    styleUrls: ['./blend-settings.component.scss'],
})
export class BlendSettingsComponent {
    @Input()
    blendSettings: MoveToBlendSettings;

    @Input()
    units: Units;

    @Input()
    variables: URVariable[];

    @Output()
    blendSettingsChanged = new EventEmitter<MoveToBlendSettings>();

    blendOptions: DropdownOption[];

    constructor(private readonly translateService: TranslateService) {
        this.blendOptions = [
            {
                value: 'false',
                label: this.translateService.instant('presenter.move-to.blend.disabled'),
            },
            {
                value: 'true',
                label: this.translateService.instant('presenter.move-to.blend.enabled'),
            },
        ];
    }

    setBlendEnabled($event: 'true' | 'false') {
        this.blendSettings.enabled = $event === 'true';
        if (this.blendSettings.enabled) {
            this.blendSettings.radius = new TabInputModel<Length>({ value: 0.05, unit: 'm' }, 'VALUE', 0.05);
        } else {
            delete this.blendSettings.radius;
        }
        this.blendSettingsChanged.emit(this.blendSettings);
    }

    getRadius() {
        if (!this.blendSettings.radius) {
            return;
        }
        return getConvertedTabInputValue(this.blendSettings.radius, (value: Value) => valueRawConverter(value, this.units.LENGTH));
    }

    setRadius($event: TabInputValue) {
        if (!this.blendSettings.radius) {
            return;
        }

        const inputValue = $event.value;

        this.blendSettings.radius.selectedType = $event.selectedType;
        if ($event.selectedType === SelectedInput.VALUE) {
            const convertedSpeed = convertValue({ value: Number(inputValue), unit: this.units.LENGTH.label }, 'm');
            this.blendSettings.radius.entity = convertedSpeed;
            this.blendSettings.radius.value = convertedSpeed.value;
        } else {
            this.blendSettings.radius.value = inputValue;
        }

        this.blendSettingsChanged.emit(this.blendSettings);
    }

    blendValidator = (val): string | null => {
        return getRangeErrorString(val, { unit: 'm', lowerLimit: 0, upperLimit: 1 }, this.units, this.translateService);
    };
}
