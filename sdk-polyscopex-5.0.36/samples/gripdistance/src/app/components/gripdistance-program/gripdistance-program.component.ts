import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
    convertValue,
    Length,
    ProgramPresenter,
    ProgramPresenterAPI,
    RobotSettings
} from '@universal-robots/contribution-api';
import { GripDistanceProgramNode } from './gripdistance-program.node';
import { GripDistanceApplicationNode } from '../gripdistance-application/gripdistance-application.node';
import { first } from 'rxjs/operators';


@Component({
    templateUrl: './gripdistance-program.component.html',
    styleUrls: ['./gripdistance-program.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})

export class GripDistanceProgramComponent implements OnChanges, ProgramPresenter {
    @Input() presenterAPI: ProgramPresenterAPI;
    unit: 'mm' | 'm' = 'mm';
    private _contributedNode: GripDistanceProgramNode;
    private _robotSettings: RobotSettings;

    constructor(
        protected readonly translateService: TranslateService,
        protected readonly cd: ChangeDetectorRef
    ) {
    }

    get contributedNode(): GripDistanceProgramNode {
        return this._contributedNode;
    }

    @Input()
    set contributedNode(value: GripDistanceProgramNode) {
        this._contributedNode = value;
        this.cd.detectChanges();
    }

    get robotSettings(): RobotSettings {
        return this._robotSettings;
    }

    @Input()
    set robotSettings(value) {
        this._robotSettings = value;

        if (!value) {
            return;
        }
        this.translateService
            .use(this._robotSettings.language)
            .pipe(first())
            .subscribe(() => {
                this.cd.detectChanges();
            });
    }

    async ngOnChanges(changes: SimpleChanges): Promise<void> {
        if (changes?.robotSettings) {
            if (!changes?.robotSettings?.currentValue) {
                return;
            }

            if (changes?.robotSettings?.isFirstChange()) {
                if (changes?.robotSettings?.currentValue) {
                    this.translateService.use(changes?.robotSettings?.currentValue?.language);
                }
                this.translateService.setDefaultLang('en');
            }

            this.translateService
                .use(changes?.robotSettings?.currentValue?.language)
                .pipe(first())
                .subscribe(() => {
                    this.cd.detectChanges();
                });
        }

        if (changes?.presenterAPI.isFirstChange() && this.presenterAPI) {
            const applicationNode = await this.presenterAPI.applicationService.getApplicationNode('ur-sample-gripdistance-application') as GripDistanceApplicationNode;
            if (applicationNode && this.contributedNode) {
                this.contributedNode.parameters.openDistance = applicationNode.openDistance;
                this.contributedNode.parameters.closedDistance = applicationNode.closedDistance;
            }

            this.cd.detectChanges();
        }
    }

    getGripperToggle() {
        return this.contributedNode.parameters.gripperToggle;
    }

    setGripperToggle(gripperToggle: boolean): void {
        this.contributedNode.parameters.gripperToggle = gripperToggle;
        this.saveNode();
    }

    async saveNode() {
        this.cd.detectChanges();
        await this.presenterAPI.programNodeService.updateNode(this.contributedNode);
    }

    getDisplayValue(length?: Length): string {
        if (this.robotSettings && length) {
            const {value, unit} = convertValue(length, this.unit);
            return `${value} ${unit}`;
        } else {
            return '';
        }
    }
}
