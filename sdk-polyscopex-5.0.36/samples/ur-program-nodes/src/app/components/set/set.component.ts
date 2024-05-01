import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnChanges, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Signal, SignalAnalogDomainValueEnum, SignalDirectionEnum, SignalValueTypeEnum } from '@universal-robots/contribution-api';
import { CommonProgramPresenterComponent } from '../common-program-presenter.component';
import { DropdownOption } from '@universal-robots/ui-models';
import { SampleSetNode } from "./set.node";

@Component({
    templateUrl: './set.component.html',
    styleUrls: ['./set.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SetComponent extends CommonProgramPresenterComponent<SampleSetNode> implements OnChanges {
    readonly CURRENT_CONSTRAINTS = {
        lowerLimit: 4,
        upperLimit: 20,
        unit: 'mA',
    };
    readonly VOLTAGE_CONSTRAINTS = {
        lowerLimit: 0,
        upperLimit: 10,
        unit: 'V',
    };

    public sources: string[];
    public signals: Signal[] = [];
    public SignalValueType = SignalValueTypeEnum;
    public valueValidators = [this.validateValue.bind(this)];

    private domains: { [signalID: string]: SignalAnalogDomainValueEnum };
    public domain: SignalAnalogDomainValueEnum = SignalAnalogDomainValueEnum.CURRENT;
    public digitalValueOptions: Array<DropdownOption>;
    signalLabels: { [key: string]: string };

    constructor(protected readonly translateService: TranslateService, protected readonly cd: ChangeDetectorRef) {
        super(translateService, cd);
        this.digitalValueOptions = [
            {
                label: this.translateService.instant('high'),
                value: 'high',
            },
            {
                label: this.translateService.instant('low'),
                value: 'low',
            },
        ];
    }

    async ngOnChanges(changes: SimpleChanges) {
        super.ngOnChanges(changes);

        if (changes.presenterAPI?.firstChange) {
            this.sources = await this.presenterAPI.sourceService.getSources();
            this.sources.sort();
        }

        if (changes.contributedNode) {
            const signalOutput = changes.contributedNode.currentValue.parameters.signalOutput;
            if (signalOutput?.sourceID) {
                this.signals = await this.presenterAPI.sourceService.getSignals(signalOutput.sourceID, {
                    direction: SignalDirectionEnum.OUT,
                });
                this.signals
                    .filter((signal): signal is Required<Signal> => !!signal.signalID)
                    .sort((a, b) => a.signalID.localeCompare(b.signalID));
                this.signalLabels = await this.presenterAPI.sourceService.getSignalLabels(signalOutput.sourceID);
                this.domains = await this.presenterAPI.sourceService.getAnalogSignalDomains(signalOutput.sourceID);
                if (signalOutput.signalID) {
                    this.domain = this.domains[signalOutput.signalID];
                }
            }
            this.cd.detectChanges();
        }
    }

    public getSignalIDs(): string[] {
        return this.signals
            ? this.signals.filter((signal): signal is Required<Signal> => !!signal.signalID).map((signal) => signal.signalID)
            : [];
    }

    public getSignalLabels(): { [key: string]: string } {
        const labelMap = {};

        this.signals.forEach((signal) => {
            if (!signal.signalID) {
                return;
            }
            const signalLabel = this.signalLabels[signal.signalID];
            labelMap[signal.signalID] = signalLabel ? `${signalLabel} (${signal.signalID})` : signal.signalID;
        });

        return labelMap;
    }

    public getSignalLabel = (signal: Signal) => {
        const { signalID } = signal;
        if (!signalID) {
            return '';
        }
        if (this.signalLabels && this.signalLabels[signalID]) {
            const label = this.signalLabels[signalID];
            return `${label} (${signalID})`;
        }
        return signalID;
    };

    public getValueLabel() {
        const value = this.contributedNode.parameters.signalOutput?.value;
        if (typeof value === 'boolean') {
            return value ? this.translateService.instant('high') : this.translateService.instant('low');
        }

        if (!value) {
            return;
        }

        return `${value.value} ${value.unit}`;
    }

    public getValueTypeForSignal() {
        return this.signals.find((signal) => signal.signalID === this.contributedNode.parameters.signalOutput?.signalID)?.valueType;
    }

    public async setSourceID($event) {
        if (!this.contributedNode.parameters.signalOutput) {
            return;
        }
        this.contributedNode.parameters.signalOutput.sourceID = $event;
        this.contributedNode.parameters.signalOutput.signalID = undefined;
        this.contributedNode.parameters.signalOutput.value = undefined;
        this.signals = await this.presenterAPI.sourceService.getSignals($event, { direction: SignalDirectionEnum.OUT });
        this.signals.filter((signal): signal is Required<Signal> => !!signal.signalID).sort((a, b) => a.signalID.localeCompare(b.signalID));
        this.domains = await this.presenterAPI.sourceService.getAnalogSignalDomains($event);
        this.signalLabels = await this.presenterAPI.sourceService.getSignalLabels($event);
        this.saveNode();
    }

    public setSignalID($event) {
        if (!this.contributedNode.parameters.signalOutput) {
            return;
        }
        this.contributedNode.parameters.signalOutput.signalID = $event.signalID;
        this.domain = this.domains[$event.signalID];
        const valueType = this.getValueTypeForSignal();
        if (valueType === 'FLOAT') {
            if (this.domain === SignalAnalogDomainValueEnum.CURRENT) {
                this.contributedNode.parameters.signalOutput.value = {
                    value: this.CURRENT_CONSTRAINTS.lowerLimit,
                    unit: this.CURRENT_CONSTRAINTS.unit,
                };
            }
            if (this.domain === SignalAnalogDomainValueEnum.VOLTAGE) {
                this.contributedNode.parameters.signalOutput.value = {
                    value: this.VOLTAGE_CONSTRAINTS.lowerLimit,
                    unit: this.VOLTAGE_CONSTRAINTS.unit,
                };
            }
        }
        if (valueType === 'BOOLEAN') {
            this.contributedNode.parameters.signalOutput.value = true;
        }
        this.saveNode();
    }

    public setAnalogValue($event: string) {
        if (this.contributedNode.parameters.signalOutput) {
            if (this.domain === SignalAnalogDomainValueEnum.CURRENT) {
                this.contributedNode.parameters.signalOutput.value = { value: Number($event), unit: this.CURRENT_CONSTRAINTS.unit };
            }
            if (this.domain === SignalAnalogDomainValueEnum.VOLTAGE) {
                this.contributedNode.parameters.signalOutput.value = { value: Number($event), unit: this.VOLTAGE_CONSTRAINTS.unit };
            }
            this.saveNode();
        }
    }

    public setDigitalValue(option: DropdownOption) {
        if (!this.contributedNode.parameters.signalOutput) {
            return;
        }
        this.contributedNode.parameters.signalOutput.value = option?.value === 'high';
        this.saveNode();
    }

    public getAnalogUnit() {
        if (this.domain === SignalAnalogDomainValueEnum.CURRENT) {
            return this.CURRENT_CONSTRAINTS.unit;
        }
        if (this.domain === SignalAnalogDomainValueEnum.VOLTAGE) {
            return this.VOLTAGE_CONSTRAINTS.unit;
        }
        return null;
    }

    public validateValue(val) {
        if (this.domain === SignalAnalogDomainValueEnum.CURRENT) {
            return this.getRangeErrorString(val, this.CURRENT_CONSTRAINTS);
        }
        if (this.domain === SignalAnalogDomainValueEnum.VOLTAGE) {
            return this.getRangeErrorString(val, this.VOLTAGE_CONSTRAINTS);
        }
        return null;
    }
}
