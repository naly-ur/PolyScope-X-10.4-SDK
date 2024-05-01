import {TranslateService} from '@ngx-translate/core';
import {first} from 'rxjs/operators';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    OnChanges,
    SimpleChanges,
    ViewEncapsulation
} from '@angular/core';
import {ApplicationPresenter, ApplicationPresenterAPI, RobotSettings} from '@universal-robots/contribution-api';
import {SimpledockerApplicationNodeNode} from './simple-docker-application-node.node';
import {BehaviorSubject} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {URCAP_ID, VENDOR_ID} from '../../../generated/contribution-constants';

@Component({
    templateUrl: './simple-docker-application-node.component.html',
    styleUrls: ['./simple-docker-application-node.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class SimpledockerApplicationNodeComponent implements ApplicationPresenter, OnChanges {
    // applicationAPI is optional
    @Input() applicationAPI: ApplicationPresenterAPI;

    messageEmitter$ = new BehaviorSubject<string>('');

    httpOptions: {
        headers?:
            | HttpHeaders
            | {
            [header: string]: string | string[];
        };
        observe?: 'body' | undefined;
        responseType?: 'json' | undefined;
    };
    private readonly backendProtocol = 'http:';
    private backendUrl: string;

    private _applicationNode: SimpledockerApplicationNodeNode;

    private _robotSettings: RobotSettings;

    constructor(
        protected readonly translateService: TranslateService,
        protected readonly cd: ChangeDetectorRef,
        protected readonly httpClient: HttpClient
    ) {
        const headers = new HttpHeaders();
        headers.append('Accept', 'text/html');
        this.httpOptions = {
            headers,
            observe: 'body',
            // @ts-ignore Ignored due to missing types
            responseType: 'text',
        };
    }

    @Input() set applicationNode(value: SimpledockerApplicationNodeNode) {
        this._applicationNode = value;
        this.cd.detectChanges();
    }

    // applicationNode is required
    get applicationNode(): SimpledockerApplicationNodeNode {
        return this._applicationNode;
    }

    @Input() set robotSettings(value: RobotSettings) {
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

    // robotSettings is optional
    get robotSettings(): RobotSettings {
        return this._robotSettings;
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

            this.backendUrl = this.applicationAPI.getContainerContributionURL(VENDOR_ID, URCAP_ID, 'simple-docker-backend', 'rest-api');
        }
    }

    fetchBackendData(): void {
        this.httpClient
            // @ts-ignore Ignored due to missing types
            .get<string>(`${this.backendProtocol}//${this.backendUrl}/`, this.httpOptions)
            .pipe(first())
            .subscribe((data) => {
                // Emit value to update UI
                this.messageEmitter$.next(data);
            });
    }

    writeBackendData(data: string): void {
        const requestData = {
            data,
        };
        // @ts-ignore Ignored due to missing types
        this.httpClient.post(`${this.backendProtocol}//${this.backendUrl}/`, requestData, this.httpOptions).subscribe(() => {
            // Refresh the data after writing
            this.fetchBackendData();
        });
    }

    // call saveNode to save node parameters
    saveNode() {
        this.cd.detectChanges();
        this.applicationAPI.applicationNodeService.updateNode(this.applicationNode);
    }
}
