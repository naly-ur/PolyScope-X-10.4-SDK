import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, inject,
  Input,
  OnChanges, OnInit, signal,
  SimpleChanges
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  ProgramPresenter,
  ProgramPresenterAPI,
  RobotSettings,
  TreeContext
} from '@universal-robots/contribution-api';
import { GripperAction, XmlrpcGripperPrgNode } from './xmlrpc-gripper-prg.node';
import { URCAP_ID, VENDOR_ID } from '../../../generated/contribution-constants';
import { XmlRpc } from '../xmlRpc';
import {first} from "rxjs/operators";

@Component({
  templateUrl: './xmlrpc-gripper-prg.component.html',
  styleUrls: ['./xmlrpc-gripper-prg.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class XmlrpcGripperPrgComponent implements OnInit, OnChanges, ProgramPresenter {


  public readonly translateService = inject(TranslateService);
  private readonly cd = inject(ChangeDetectorRef);
  private xmlRpc: XmlRpc;

  // programTree is optional
  @Input() programTree: TreeContext;

  // presenterAPI is optional
  @Input() presenterAPI: ProgramPresenterAPI;

  // robotSettings is optional
  @Input() robotSettings: RobotSettings;

  // contributedNode is optional
  @Input() contributedNode: XmlrpcGripperPrgNode;

  public showErrorMessage = signal<boolean>(false);

  public gripperIsBusy = signal<boolean>(false);

  public GripperAction = GripperAction;

  public static readonly forceValueConstraints = {lowerLimit: 0.1, upperLimit: 100.0};
  public static readonly widthValueConstraints = {lowerLimit: 0.0, upperLimit: 200.0};

  ngOnInit(): void {
    this.translateService.setDefaultLang('en');
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.robotSettings) {
      if (!changes.robotSettings.currentValue) {
        return;
      }

      this.translateService
        .use(changes.robotSettings.currentValue.language)
        .pipe(first())
        .subscribe();
    }

    if (changes.presenterAPI?.isFirstChange()) {
      const path = this.presenterAPI.getContainerContributionURL(VENDOR_ID, URCAP_ID, 'xmlrpc-gripper-backend', 'xmlrpc');
      this.xmlRpc = new XmlRpc(`//${path}/`);
    }
  }

  widthValueLimits = (width: number) => {
    if (XmlrpcGripperPrgComponent.widthValueConstraints.lowerLimit &&
      XmlrpcGripperPrgComponent.widthValueConstraints.upperLimit &&
      (width < XmlrpcGripperPrgComponent.widthValueConstraints.lowerLimit ||
        width > XmlrpcGripperPrgComponent.widthValueConstraints.upperLimit)
    ) {
      return this.translateService.instant('presenter.xmlrpc-gripper.label.width-error', {
        limit: XmlrpcGripperPrgComponent.widthValueConstraints,
        unit: 'mm',
      });
    }
    return null;
  };

  forceValueLimits = (force: number) => {
    if (
      XmlrpcGripperPrgComponent.forceValueConstraints.lowerLimit &&
      XmlrpcGripperPrgComponent.forceValueConstraints.upperLimit &&
      (force < XmlrpcGripperPrgComponent.forceValueConstraints.lowerLimit ||
        force > XmlrpcGripperPrgComponent.forceValueConstraints.upperLimit)
    ) {
      return this.translateService.instant('presenter.xmlrpc-gripper.label.force-error', {
        limit: XmlrpcGripperPrgComponent.forceValueConstraints,
        unit: 'N',
      });
    }
    return null;
  };

  changeAction(value: GripperAction) {
    const newType = GripperAction[value];
    if (newType !== this.contributedNode.parameters.action) {
      this.contributedNode.parameters.action = newType;
      this.saveNode();
    }
  }

  async onGripRelease(action: string) {
    this.gripperIsBusy.set(true);
    this.showError(false);
    try {
      if (action === GripperAction.grip) {
        this.doGrip(this.contributedNode.parameters.width, this.contributedNode.parameters.force);
      } else {
        this.doRelease(this.contributedNode.parameters.width);
      }
    } catch (error) {
      this.showError(true, error);
      this.gripperIsBusy.set(false);
    }
  }

  doGrip(width: number, force: number) {
    this.doRequest('grip', [width, force]);
  }

  doRelease(width: number) {
    this.doRequest('release', [width]);
  }

  setWidthValue(newValue: number): void {
    const newWidth = Number(newValue);
    if (newWidth !== this.contributedNode.parameters.width) {
      this.contributedNode.parameters.width = newWidth;
      this.saveNode();
    }
  }

  setForceValue(newValue: number): void {
    const newForce = Number(newValue);
    if (newForce !== this.contributedNode.parameters.force) {
      this.contributedNode.parameters.force = newForce;
      this.saveNode();
    }
  }

  toggleGripDetection() {
    this.contributedNode.parameters.isGripDetected = !this.contributedNode.parameters.isGripDetected;
    this.saveNode();
  }

  setOnGripDetectedValue(newValue: string) {
    if (newValue !== this.contributedNode.parameters.onGripDetected) {
      this.contributedNode.parameters.onGripDetected = newValue;
      this.saveNode();
    }
  }

  toggleGripNotDetection() {
    this.contributedNode.parameters.isGripNotDetected = !this.contributedNode.parameters.isGripNotDetected;
    this.saveNode();
  }

  setOnGripNotDetectedValue(newValue: string) {
    if (newValue !== this.contributedNode.parameters.onGripNotDetected) {
      this.contributedNode.parameters.onGripNotDetected = newValue;
      this.saveNode();
    }
  }

  // call saveNode to save node parameters
  private async saveNode() {
    await this.presenterAPI.programNodeService.updateNode(this.contributedNode);
  }
  private showError(hasError: boolean, error?: unknown) {
    if (hasError && error) {
      console.error(error);
    }

    this.showErrorMessage.set(hasError);
  }

  private doRequest(methodName: string, params: number[]) {
    this.xmlRpc.sendXmlRpcRequest(methodName, params)
      .then((data) => this.showError(data.status !== 200,
        `XmlRpc.${methodName}(${params}) did not return true`))
      .catch((error) => this.showError(true, error))
      .finally(() => {
        this.gripperIsBusy.set(false);
      });
  }

  protected readonly Object = Object;
}
