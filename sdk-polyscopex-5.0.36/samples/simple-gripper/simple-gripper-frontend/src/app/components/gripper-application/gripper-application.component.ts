import { TranslateService } from '@ngx-translate/core';
import { first } from 'rxjs/operators';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    OnChanges,
    OnDestroy,
    SimpleChanges
} from '@angular/core';
import { GripperApplicationNode } from './gripper-application.node';
import {
    closedStatus,
    GripperAction, openStatus,
    RosHelper,
} from '../../RosHelper';
import { Subscription} from 'rxjs';
import {
    ApplicationPresenter,
    ApplicationPresenterAPI,
    RobotSettings,
    Ros2Client
} from "@universal-robots/contribution-api";


@Component({
    templateUrl: './gripper-application.component.html',
    styleUrls: ['./gripper-application.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GripperApplicationComponent implements ApplicationPresenter, OnChanges, OnDestroy {
    @Input() applicationAPI: ApplicationPresenterAPI;
    // robotSettings is optional
    @Input() robotSettings: RobotSettings;

    @Input() applicationNode: GripperApplicationNode;

    public readonly forceValueConstraints = { lowerLimit: 0.0, upperLimit: 100.0 };
    public readonly close = GripperAction.close;
    public readonly open = GripperAction.open;
    private ros2Client: Ros2Client;
    private status: string;
    private subscription: Subscription | undefined;

    constructor(
        protected readonly translateService: TranslateService,
        protected readonly cd: ChangeDetectorRef
    ) {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.applicationAPI?.firstChange) {
            this.ros2Client = this.applicationAPI.ros2Client;
            this.subscription = RosHelper.subscribeToStatusTopic(this.ros2Client).subscribe(
                (msg) => {
                    this.status = msg.data;
                    this.cd.detectChanges();
                }
            );
        }

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
    }

    ngOnDestroy(): void {
        this.subscription?.unsubscribe();
    }

    setForceValue(newValue: number): void {
        if (newValue !== this.applicationNode.force) {
            this.applicationNode.force = newValue;
            this.saveNode();
        }
    }

    async saveNode() {
        this.cd.detectChanges();
        await this.applicationAPI.applicationNodeService.updateNode(this.applicationNode);
    }

    onOpenClose(action: GripperAction) {
        RosHelper.callSetForceService(this.ros2Client, this.applicationNode.force);
        RosHelper.callOpenCloseService(this.ros2Client, action);
    }

    canClose() {
        return this.status === openStatus;
    }


    canOpen() {
        return this.status === closedStatus;
    }

    getGripperState() {
        return this.status;
    }
}
