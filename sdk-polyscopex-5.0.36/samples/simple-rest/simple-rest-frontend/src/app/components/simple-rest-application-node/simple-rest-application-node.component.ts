import { TranslateService } from '@ngx-translate/core';
import { first } from 'rxjs/operators';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ApplicationPresenter, ApplicationPresenterAPI, RobotSettings } from '@universal-robots/contribution-api';
import { URCAP_ID, VENDOR_ID } from 'src/generated/contribution-constants';
import { SimpleRestApplicationNode } from './simple-rest-application-node.node';

@Component({
    templateUrl: './simple-rest-application-node.component.html',
    styleUrls: ['./simple-rest-application-node.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimpleRestApplicationNodeComponent implements ApplicationPresenter, OnChanges {
    // applicationAPI is optional
    @Input() applicationAPI: ApplicationPresenterAPI;
    // robotSettings is optional
    @Input() robotSettings: RobotSettings;
    private _applicationNode: SimpleRestApplicationNode;

    private backendUrl: string;

    constructor(
        protected readonly translateService: TranslateService,
        protected readonly cd: ChangeDetectorRef
    ) {
    }

    // applicationNode is required
    get applicationNode(): SimpleRestApplicationNode {
        return this._applicationNode;
    }

    @Input()
    set applicationNode(value: SimpleRestApplicationNode) {
        this._applicationNode = value;
        this.cd.detectChanges();
    }

    ngOnChanges(changes: SimpleChanges): void {
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
                this.backendUrl = this.applicationAPI.getContainerContributionURL(VENDOR_ID, URCAP_ID, 'simple-rest-backend', 'rest-api');
        }
    }

    getExample = async (): Promise<void> => {
        const data = await this.fetchData(`http://${this.backendUrl}/get-example`);
        console.log(data);
    };

    postExample = async (): Promise<void> => {
        const data = await this.fetchData(`http://${this.backendUrl}/post-example`, {
            "post_test": "Hello World from Client Side"
        });
        console.log(data);
    };

    async fetchData(url: string, json?: Record<string, unknown>): Promise<Record<string, unknown>> {
        if (json) {
            // POST
            const requestOptions: RequestInit = {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(json)
            };
            const response = await fetch(url, requestOptions);
            return await response.json();
        } else {
            // GET
            const response = await fetch(url);
            return await response.json();
        }
    }


    // call saveNode to save node parameters
    saveNode() {
        this.cd.detectChanges();
        this.applicationAPI.applicationNodeService.updateNode(this.applicationNode);
    }
}
