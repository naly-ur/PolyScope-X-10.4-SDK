import { TranslateService } from '@ngx-translate/core';
import { first } from 'rxjs/operators';
import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { XmlrpcGripperAppNode } from './xmlrpc-gripper-app.node';
import { ApplicationPresenter, RobotSettings } from '@universal-robots/contribution-api';

@Component({
  templateUrl: './xmlrpc-gripper-app.component.html',
  styleUrls: ['./xmlrpc-gripper-app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class XmlrpcGripperAppComponent implements ApplicationPresenter, OnChanges {
  constructor(protected readonly translateService: TranslateService) {}

  // applicationNode is required
  @Input() applicationNode: XmlrpcGripperAppNode;

  // robotSettings is optional
  @Input() robotSettings: RobotSettings;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.robotSettings) {
      if (!changes?.robotSettings?.currentValue) {
        return;
      }

      if (changes?.robotSettings?.isFirstChange()) {
        this.translateService.setDefaultLang('en');
      }

      this.translateService
        .use(changes?.robotSettings?.currentValue?.language)
        .pipe(first())
        .subscribe();
    }
  }

}
