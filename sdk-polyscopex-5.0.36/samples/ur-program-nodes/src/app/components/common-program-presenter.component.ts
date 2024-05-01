import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { first, tap, throttleTime } from 'rxjs/operators';
import {
    Angle,
    ApplicationContext,
    convertValue,
    Length,
    Mass,
    ProgramNode,
    ProgramPresenter,
    ProgramPresenterAPI,
    RobotSettings,
    TreeContext,
} from '@universal-robots/contribution-api';
import { asyncScheduler, Subject, Subscription } from 'rxjs';
import * as fromValidatorHelper from './validator-helper';

const THROTTLE_TIME = 500;
const THROTTLE_CONFIG = {
    leading: true,
    trailing: true,
};

interface ValueConstraints {
    lowerLimit: number;
    upperLimit: number;
    unit: string;
}

@Component({
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommonProgramPresenterComponent<T extends ProgramNode = ProgramNode> implements ProgramPresenter, OnChanges, OnDestroy {
    @Input() presenterAPI: ProgramPresenterAPI;
    @Input() programTree: TreeContext;
    limits = {
        m: { lowerLimit: -10, upperLimit: 10 },
        mm: { lowerLimit: -1000, upperLimit: 1000 },
        rad: { lowerLimit: -6.2832, upperLimit: 6.2832 },
        deg: { lowerLimit: -360, upperLimit: 360 },
    };

    private readonly changesSubject = new Subject<ProgramNode>();
    private readonly subscriptions$ = new Subscription();

    constructor(protected readonly translateService: TranslateService, protected readonly cd: ChangeDetectorRef) {
        this.subscriptions$.add(
            this.changesSubject
                .pipe(
                    throttleTime(THROTTLE_TIME, asyncScheduler, THROTTLE_CONFIG),
                    tap(async (node: ProgramNode) => {
                        await this.presenterAPI.programNodeService.updateNode(node);
                        this.cd.detectChanges();
                    })
                )
                .subscribe()
        );
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.contributedNode?.isFirstChange()) {
            this.presenterAPI.logPerformanceService.logPerformanceMetrics(`load${changes.contributedNode.currentValue?.type}`);
            this.presenterAPI.logPerformanceService.logPerformanceMetrics(`add${changes.contributedNode.currentValue?.type}`);
        }
        if (changes.contributedNode) {
            this.onSetContributedNode();
            this.cd.detectChanges();
        }

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

            this.translateService
                .use(changes.robotSettings.currentValue.language)
                .pipe(first())
                .subscribe(() => {
                    this.onSetRobotSettings();
                    this.cd.detectChanges();
                });
            this.cd.detectChanges();
        }

        if (changes.applicationContext) {
            this.cd.detectChanges();
        }
    }

    ngOnDestroy(): void {
        this.subscriptions$.unsubscribe();
    }

    @Input() contributedNode: T;

    onSetContributedNode(): void {
        // Override this method if you have local variables that derive state from the contributed node
        // It is important to do it here, as well as the init, otherwise features like undo/redo won't work correctly
    }

    /**
     * @deprecated Please use the ApplicationAPI
     */
    @Input() applicationContext: ApplicationContext;

    @Input() robotSettings: RobotSettings;

    onSetRobotSettings() {
        // Override this method if you have instantly translated values that need to change when language changes
        // It is important to do it here, as well as the init, otherwise features like undo/redo won't work correctly
    }

    public saveNode() {
        this.changesSubject.next(this.contributedNode);
    }

    // Using Mass object as this function will usually be called with a dataModel value
    convertValueFromSIMass(mass: Mass) {
        if (this.robotSettings.units.MASS) {
            return convertValue(mass, this.robotSettings.units.MASS.label).value;
        }
        return 0;
    }

    // Using number as this function will usually be called with an input field value
    convertValueToSIMass(mass: number) {
        return convertValue({ value: mass, unit: this.robotSettings.units.MASS.label }, 'kg').value;
    }

    // Using Length object as this function will usually be called with a dataModel value
    convertValueFromSILength(length: Length) {
        if (this.robotSettings.units.LENGTH) {
            return convertValue(length, this.robotSettings.units.LENGTH.label).value;
        }
        return 0;
    }

    // Using number as this function will usually be called with an input field value
    convertValueToSILength(length: number) {
        return convertValue({ value: length, unit: this.robotSettings.units.LENGTH.label }, 'm').value;
    }

    // Using Angle object as this function will usually be called with a dataModel value
    convertValueFromSIAngle(angle: Angle) {
        if (this.robotSettings.units.PLANE_ANGLE) {
            return convertValue(angle, this.robotSettings.units.PLANE_ANGLE.label).value;
        }
        return 0;
    }

    // Using number as this function will usually be called with an input field value
    convertValueToSIAngle(angle: number) {
        return convertValue({ value: angle, unit: this.robotSettings.units.PLANE_ANGLE.label }, 'rad').value;
    }

    // Using number as this function will usually be called with an input field value
    convertValueToSISpeed(speed: number) {
        return convertValue({ value: speed, unit: this.robotSettings.units.SPEED.label }, 'm/s');
    }

    // Using number as this function will usually be called with an input field value
    convertValueToSIAngularSpeed(speed: number) {
        return convertValue({ value: speed, unit: this.robotSettings.units.ANGULAR_SPEED.label }, 'rad/s');
    }

    // Using number as this function will usually be called with an input field value
    convertValueToSIAcceleration(acceleration: number) {
        return convertValue({ value: acceleration, unit: this.robotSettings.units.ACCELERATION.label }, 'm/s^2');
    }

    // Using number as this function will usually be called with an input field value
    convertValueToSIAngularAngularAcceleration(acceleration: number) {
        return convertValue({ value: acceleration, unit: this.robotSettings.units.ANGULAR_ACCELERATION.label }, 'rad/s^2');
    }

    // Using number as this function will usually be called with an input field value
    convertValueToSITime(time: number) {
        return convertValue({ value: time, unit: this.robotSettings.units.TIME.label }, 's');
    }

    getRangeErrorString(val: number, constraints: ValueConstraints): string {
        return fromValidatorHelper.getRangeErrorString(val, constraints, this.robotSettings.units, this.translateService);
    }
}
