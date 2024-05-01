import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
    MoveToBlendSettings,
    MoveToReferenceSettings,
    MoveToSpeedSettings,
    MoveToTransformSettings,
} from '@universal-robots/contribution-api';
import { MoveToDialogModel } from './move-to-dialog.model';
import { TranslateService } from '@ngx-translate/core';
import { WebComponentDialogComponent } from '@universal-robots/contribution-api/angular';

@Component({
    templateUrl: './move-to-settings-dialog.component.html',
    styleUrls: ['./move-to-settings-dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoveToSettingsDialogComponent implements WebComponentDialogComponent<MoveToDialogModel>, OnInit {
    @Input()
    inputData: MoveToDialogModel;

    @Output()
    outputDataChange = new EventEmitter<MoveToDialogModel>();

    @Output()
    canSave = new EventEmitter<boolean>();

    activeTab = 'speed';

    constructor(private readonly translateService: TranslateService) {}

    ngOnInit() {
        this.outputDataChange.emit(this.inputData);
    }

    onLinkChanged(event) {
        this.activeTab = event;
    }

    onSpeedSettingsChanged($event: MoveToSpeedSettings) {
        this.inputData.speed = $event;
        this.outputDataChange.emit(this.inputData);
    }

    onReferenceSettingsChanged($event: MoveToReferenceSettings) {
        this.inputData.reference = $event;

        this.outputDataChange.emit(this.inputData);
    }

    getSelectedFrameName() {
        const selectedFrame = this.inputData.reference.frame;
        if (!selectedFrame) {
            return '';
        }
        return selectedFrame.translationKey ? this.translateService.instant(selectedFrame.translationKey) : selectedFrame.frameId;
    }

    onTransformSettingsChanged($event: MoveToTransformSettings) {
        this.inputData.transform = $event;
        this.outputDataChange.emit(this.inputData);
    }

    onBlendSettingsChanged($event: MoveToBlendSettings) {
        this.inputData.blend = $event;
        this.outputDataChange.emit(this.inputData);
    }
}
