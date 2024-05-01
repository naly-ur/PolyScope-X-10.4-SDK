import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {ProgramPresenter, ProgramPresenterAPI, RobotSettings, Ros2Client} from '@universal-robots/contribution-api';
import { GripperNode } from './gripper.node';
import { first } from 'rxjs/operators';
import { GripperAction, RosHelper } from '../../RosHelper';

@Component({
    templateUrl: './gripper-node.component.html',
    styleUrls: ['./gripper-node.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GripperNodeComponent implements OnChanges, ProgramPresenter {
    @Input() presenterAPI: ProgramPresenterAPI;
    // robotSettings is optional
    @Input() robotSettings: RobotSettings;

    @Input() contributedNode: GripperNode;

    public readonly closeAction = GripperAction.close;
    public readonly openAction = GripperAction.open;
    private ros2Client: Ros2Client;

    constructor(
        protected readonly translateService: TranslateService,
        protected readonly cd: ChangeDetectorRef,
    ) {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.presenterAPI?.firstChange) {
            this.ros2Client = this.presenterAPI.ros2Client;
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

    changeType(newValue: GripperAction) {
        if (newValue !== this.contributedNode.parameters.action) {
            this.contributedNode.parameters.action = newValue;
            this.saveNode();
        }
    }

    toggleBlocking() {
        this.contributedNode.parameters.blocking = !this.contributedNode.parameters.blocking;
        this.saveNode();
    }

    setOnSuccessValue(newValue: string): void {
        if (newValue !== this.contributedNode.parameters.onSuccessCallback) {
            this.contributedNode.parameters.onSuccessCallback = newValue;
            this.saveNode();
        }
    }

    setOnFailureValue(newValue: string): void {
        if (newValue !== this.contributedNode.parameters.onFailureCallback) {
            this.contributedNode.parameters.onFailureCallback = newValue;
            this.saveNode();
        }
    }

    async saveNode() {
        this.cd.detectChanges();
        await this.presenterAPI.programNodeService.updateNode(this.contributedNode);
    }

    onOpenClose(action: GripperAction) {
        RosHelper.callOpenCloseService(this.ros2Client, action);
    }

    showCallbacks() {
        return this.contributedNode.parameters.blocking && this.contributedNode.parameters.action === GripperAction.close;
    }

}
