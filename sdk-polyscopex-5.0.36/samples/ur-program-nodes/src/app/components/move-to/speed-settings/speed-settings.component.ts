import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { convertValue, MoveToSpeedSettings, MoveType, URVariable, Value, valueRawConverter } from '@universal-robots/contribution-api';
import { SelectedInput, TabInputValue } from '@universal-robots/ui-models';
import { CONCEPT_UNITS, UnitEnum, Units } from '@universal-robots/utilities-units';
import { getConvertedTabInputValue } from '../../tabinput-helper';
import { getRangeErrorString } from '../../validator-helper';
import { MoveConstraints } from '../move-to.constants';

@Component({
    selector: 'ur-move-to-speed-settings',
    templateUrl: './speed-settings.component.html',
    styleUrls: ['./speed-settings.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpeedSettingsComponent implements OnChanges {
    @Input()
    speedSettings: MoveToSpeedSettings;

    @Input()
    moveType: MoveType;

    @Input()
    units: Units;

    @Input()
    variables: URVariable[];

    @Output()
    speedSettingsChanged = new EventEmitter<MoveToSpeedSettings>();

    speedUnit;
    accelerationUnit;

    constructor(private readonly translateService: TranslateService) {}

    ngOnChanges(changes: SimpleChanges) {
        if ((changes.moveType && this.units) || (changes.units && this.moveType)) {
            this.speedUnit = changes.moveType.currentValue === 'moveJ' ? this.units.ANGULAR_SPEED : this.units.SPEED;
            this.accelerationUnit = changes.moveType.currentValue === 'moveJ' ? this.units.ANGULAR_ACCELERATION : this.units.ACCELERATION;
        }
    }

    getSpeed() {
        return getConvertedTabInputValue(this.speedSettings.speed, (value: Value) => valueRawConverter(value, this.speedUnit));
    }

    getAcceleration() {
        return getConvertedTabInputValue(this.speedSettings.acceleration, (value: Value) =>
            valueRawConverter(value, this.accelerationUnit)
        );
    }

    setSpeed($event: TabInputValue) {
        const inputValue = $event.value;

        const SI_UNIT = this.moveType === 'moveJ' ? 'rad/s' : 'm/s';

        this.speedSettings.speed.selectedType = $event.selectedType;
        if ($event.selectedType === SelectedInput.VALUE) {
            const convertedSpeed = convertValue({ value: Number(inputValue), unit: this.speedUnit.label }, SI_UNIT);
            this.speedSettings.speed.entity = convertedSpeed;
            this.speedSettings.speed.value = convertedSpeed.value;
        } else {
            this.speedSettings.speed.value = inputValue;
        }

        this.speedSettingsChanged.emit(this.speedSettings);
    }

    setAcceleration($event: TabInputValue) {
        const inputValue = $event.value;

        const SI_UNIT = this.moveType === 'moveJ' ? 'rad/s^2' : 'm/s^2';

        this.speedSettings.acceleration.selectedType = $event.selectedType;
        if ($event.selectedType === SelectedInput.VALUE) {
            const convertedAcceleration = convertValue({ value: Number(inputValue), unit: this.accelerationUnit.label }, SI_UNIT);
            this.speedSettings.acceleration.entity = convertedAcceleration;
            this.speedSettings.acceleration.value = convertedAcceleration.value;
        } else {
            this.speedSettings.acceleration.value = inputValue;
        }

        this.speedSettingsChanged.emit(this.speedSettings);
    }

    public validateSpeed = (val) => {
        return getRangeErrorString(val, MoveConstraints[this.moveType].speed, this.units, this.translateService);
    };

    public validateAcceleration = (val) => {
        return getRangeErrorString(val, MoveConstraints[this.moveType].acceleration, this.units, this.translateService);
    };

    public getInputLabelText(unit: UnitEnum) {
        return this.translateService.instant('presenter.move.label.input_help') + ' ' + CONCEPT_UNITS[unit].symbol;
    }
}
