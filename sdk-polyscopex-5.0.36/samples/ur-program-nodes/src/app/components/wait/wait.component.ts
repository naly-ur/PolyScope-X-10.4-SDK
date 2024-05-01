import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnChanges, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
    Signal,
    SignalAnalogDomainValueEnum,
    SignalDirectionEnum,
    SignalValueTypeEnum,
    TabInputModel,
    Time,
    URVariable,
} from '@universal-robots/contribution-api';
import { CommonProgramPresenterComponent } from '../common-program-presenter.component';
import { SelectedInput, TabInputValue } from '@universal-robots/ui-models';
import { SampleWaitNode } from "./wait.node";

@Component({
    templateUrl: './wait.component.html',
    styleUrls: ['./wait.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaitComponent extends CommonProgramPresenterComponent<SampleWaitNode> implements OnChanges {
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
    private readonly SINGLE_DAY_IN_SECONDS = 86400;
    readonly TIME_CONSTRAINTS = {
        lowerLimit: 0.01,
        upperLimit: this.SINGLE_DAY_IN_SECONDS,
        unit: 's',
    };

    public variables: URVariable[] = [];
    public timeValidators = [(val) => this.validateTime(val)];

    public signals: Signal[] = [];
    public sources: string[] = [];
    public SignalValueType = SignalValueTypeEnum;
    public analogValueValidators = [(val) => this.validateAnalogValue(val)];
    public analogOperators: string[] = ['<', '>'];

    private domains: { [signalID: string]: SignalAnalogDomainValueEnum };
    public domain: SignalAnalogDomainValueEnum = SignalAnalogDomainValueEnum.CURRENT;
    public typeSelection: { label: any; value: string }[];
    public digitalValueOptions: { label: any; value: string }[];

    signalLabels: { [key: string]: string };

    constructor(protected readonly translateService: TranslateService, protected readonly cd: ChangeDetectorRef) {
        super(translateService, cd);
        this.typeSelection = [
            {
                label: this.translateService.instant('presenter.wait.label.time'),
                value: 'time',
            },
            {
                label: this.translateService.instant('presenter.wait.label.signalInput'),
                value: 'signalInput',
            },
        ];
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

    async fetchVariables() {
        this.variables = await this.presenterAPI.symbolService.getVariables();
    }

    async ngOnChanges(changes: SimpleChanges) {
        super.ngOnChanges(changes);
        if (changes.contributedNode?.isFirstChange()) {
            await this.initParamType();
            this.cd.detectChanges();
        }

        if (changes.presenterAPI?.isFirstChange()) {
            await this.fetchVariables();
            this.cd.detectChanges();
        }
    }

    private async initParamType() {
        if (this.contributedNode.parameters.type === 'signalInput') {
            delete this.contributedNode.parameters.time;
            this.sources = await this.presenterAPI.sourceService.getSources();

            this.sources.sort();
            if (!this.contributedNode.parameters.signalInput) {
                this.contributedNode.parameters.signalInput = {};
                return;
            }
            const signalInput = this.contributedNode.parameters.signalInput;
            if (signalInput.sourceID) {
                this.signals = await this.presenterAPI.sourceService.getSignals(signalInput.sourceID, {
                    direction: SignalDirectionEnum.IN,
                });

                this.domains = await this.presenterAPI.sourceService.getAnalogSignalDomains(signalInput.sourceID);
                this.signalLabels = await this.presenterAPI.sourceService.getSignalLabels(signalInput.sourceID);
                if (signalInput.signalID) {
                    this.domain = this.domains[signalInput.signalID];
                }
            }
        } else if (this.contributedNode.parameters.type === 'time') {
            delete this.contributedNode.parameters.signalInput;
            if (!this.contributedNode.parameters.time) {
                this.contributedNode.parameters.time = new TabInputModel<Time>(
                    {
                        value: 1,
                        unit: 's',
                    },
                    SelectedInput.VALUE,
                    1
                );
            }
        }
    }

    public getSignalIDs(): string[] {
        return this.signals
            ? this.signals.filter((signal): signal is Required<Signal> => !!signal.signalID).map((signal) => signal.signalID)
            : [];
    }

    public getValueTypeForSignal() {
        return this.signals.find((signal) => signal.signalID === this.contributedNode.parameters.signalInput?.signalID)?.valueType;
    }

    async setType({ value }) {
        if (value !== this.contributedNode.parameters.type) {
            this.contributedNode.parameters.type = value;
            await this.initParamType();
            this.saveNode();
        }
    }

    public getTime() {
        if (!this.contributedNode.parameters.time)
            return {
                selectedType: SelectedInput.VALUE,
                value: '1',
            };

        return TabInputModel.getTabInputValue<Time>(this.contributedNode.parameters.time);
    }

    public setTime($event: TabInputValue): void {
        if (this.contributedNode.parameters.time) {
            const time = this.contributedNode.parameters.time;
            TabInputModel.setTabInputValue(time, $event);
            time.entity.value = Number($event.value);
            this.contributedNode.parameters.time = time;
            this.saveNode();
        }
    }

    public async setSourceID($event) {
        if (!this.contributedNode.parameters.signalInput) {
            return;
        }
        this.contributedNode.parameters.signalInput.sourceID = $event;
        this.contributedNode.parameters.signalInput.signalID = undefined;
        this.contributedNode.parameters.signalInput.value = undefined;
        this.signals = await this.presenterAPI.sourceService.getSignals($event, { direction: SignalDirectionEnum.IN });
        this.signals.filter((signal): signal is Required<Signal> => !!signal.signalID).sort((a, b) => a.signalID.localeCompare(b.signalID));
        this.domains = await this.presenterAPI.sourceService.getAnalogSignalDomains($event);
        this.signalLabels = await this.presenterAPI.sourceService.getSignalLabels($event);
        this.saveNode();
    }

    public setSignalID($event) {
        if (!this.contributedNode.parameters.signalInput) {
            return;
        }
        this.contributedNode.parameters.signalInput.signalID = $event.signalID;
        this.domain = this.domains[$event.signalID];
        const valueType = this.getValueTypeForSignal();
        if (valueType === 'FLOAT') {
            this.contributedNode.parameters.signalInput.analogOperator = '>';
            if (this.domain === SignalAnalogDomainValueEnum.CURRENT) {
                this.contributedNode.parameters.signalInput.value = {
                    value: this.CURRENT_CONSTRAINTS.lowerLimit,
                    unit: this.CURRENT_CONSTRAINTS.unit,
                };
            }
            if (this.domain === SignalAnalogDomainValueEnum.VOLTAGE) {
                this.contributedNode.parameters.signalInput.value = {
                    value: this.VOLTAGE_CONSTRAINTS.lowerLimit,
                    unit: this.VOLTAGE_CONSTRAINTS.unit,
                };
            }
        }
        if (valueType === 'BOOLEAN') {
            this.contributedNode.parameters.signalInput.value = true;
        }

        this.saveNode();
    }

    public getSourceLabel() {
        return this.contributedNode.parameters.signalInput?.sourceID ?? this.translateService.instant('select');
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

    getSelectedSignal() {
        return this.contributedNode.parameters?.signalInput?.signalID;
    }

    public getValueLabel() {
        const value = this.contributedNode.parameters.signalInput?.value;
        if (typeof value === 'boolean') {
            return value ? this.translateService.instant('high') : this.translateService.instant('low');
        }

        if (!value) {
            return;
        }

        return `${value.value} ${value.unit}`;
    }

    public setAnalogValue($event: number) {
        if ($event && this.contributedNode.parameters.signalInput) {
            if (this.domain === SignalAnalogDomainValueEnum.CURRENT) {
                this.contributedNode.parameters.signalInput.value = { value: $event, unit: this.CURRENT_CONSTRAINTS.unit };
            }
            if (this.domain === SignalAnalogDomainValueEnum.VOLTAGE) {
                this.contributedNode.parameters.signalInput.value = { value: $event, unit: this.VOLTAGE_CONSTRAINTS.unit };
            }
            this.saveNode();
        }
    }

    public setDigitalValue($event: string) {
        if (!this.contributedNode.parameters.signalInput) {
            return;
        }
        this.contributedNode.parameters.signalInput.value = $event === 'high';
        this.saveNode();
    }

    public setAnalogOperator($event: string) {
        if (!this.contributedNode.parameters.signalInput) {
            return;
        }
        if ($event === '>' || $event === '<') {
            this.contributedNode.parameters.signalInput.analogOperator = $event;
            this.saveNode();
        }
    }

    public getAnalogUnit() {
        if (this.domain === SignalAnalogDomainValueEnum.CURRENT) {
            return this.CURRENT_CONSTRAINTS.unit;
        }
        if (this.domain === SignalAnalogDomainValueEnum.VOLTAGE) {
            return this.VOLTAGE_CONSTRAINTS.unit;
        }
        return undefined;
    }

    public validateAnalogValue(val) {
        if (this.domain === SignalAnalogDomainValueEnum.CURRENT) {
            return this.getRangeErrorString(val, this.CURRENT_CONSTRAINTS);
        }
        if (this.domain === SignalAnalogDomainValueEnum.VOLTAGE) {
            return this.getRangeErrorString(val, this.VOLTAGE_CONSTRAINTS);
        }
        return undefined;
    }

    public validateTime(val) {
        return this.getRangeErrorString(val, this.TIME_CONSTRAINTS);
    }
}
