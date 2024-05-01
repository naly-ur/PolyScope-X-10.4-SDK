import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FrameName, MoveToReferenceSettings } from '@universal-robots/contribution-api';

@Component({
    selector: 'ur-move-to-reference-settings',
    templateUrl: './reference-settings.component.html',
    styleUrls: ['./reference-settings.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReferenceSettingsComponent {
    @Input()
    settings: MoveToReferenceSettings;

    @Input()
    frames: FrameName[] = [];

    @Output()
    referenceSettingsChanged = new EventEmitter<MoveToReferenceSettings>();

    constructor(private readonly translateService: TranslateService) {}

    public setFrame(frame: FrameName) {
        this.referenceSettingsChanged.emit({ frame });
    }

    public frameLabelFactory = (frame: FrameName): string => {
        if (frame.translationKey) {
            return this.translateService.instant(frame.translationKey);
        }
        return frame.frameId;
    };
}
