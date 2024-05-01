import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {
  RobotSettings,
  SmartSkillInstance,
  SmartSkillPresenter,
  SmartSkillsPresenterAPI
} from '@universal-robots/contribution-api';
import {TranslateService} from "@ngx-translate/core";
import {first} from "rxjs";

@Component({
    templateUrl: './<%= smartSkillName %>.component.html',
    styleUrls: ['./<%= smartSkillName %>.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class <%= smartSkillComponentName %>Component implements SmartSkillPresenter, OnChanges {
    @Input()
    instance: SmartSkillInstance;

    @Input()
    presenterAPI: SmartSkillsPresenterAPI;

    @Input()
    robotSettings: RobotSettings;

    constructor(
        protected readonly translateService: TranslateService,
        protected readonly cd: ChangeDetectorRef
    ) {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.robotSettings?.isFirstChange()) {
            this.translateService.setDefaultLang('en');
        }

        if (changes.robotSettings) {
            if (!changes.robotSettings.currentValue) {
                return;
            }

            if (this.robotSettings) {
                this.robotSettings.units.LENGTH = changes.robotSettings.currentValue.units.LENGTH;
                this.robotSettings.units.PLANE_ANGLE = changes.robotSettings.currentValue.units.PLANE_ANGLE;
                this.robotSettings.units.MASS = changes.robotSettings.currentValue.units.MASS;
            }

            this.translateService.use(changes.robotSettings.currentValue.language).pipe(first()).subscribe();
            this.cd.detectChanges();
        }
    }

    // Example of updating the node parameters from the component
    updateSmartSkillParameter(variable_name: string, value: unknown): void {
        this.presenterAPI.smartSkillInstanceService.updateInstance({
            ...this.instance,
            parameters: { ...this.instance.parameters, [variable_name]: value },
        });
    }
}
