import { TranslateService } from '@ngx-translate/core';
import { first } from 'rxjs/operators';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ApplicationPresenter, ApplicationPresenterAPI, RobotSettings } from '@universal-robots/contribution-api';
import { URCAP_ID, VENDOR_ID } from 'src/generated/contribution-constants';
import { SimpleWebsocketApplicationNode } from './simple-websocket-application-node.node';

@Component({
    templateUrl: './simple-websocket-application-node.component.html',
    styleUrls: ['./simple-websocket-application-node.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimpleWebsocketApplicationNodeComponent implements ApplicationPresenter, OnChanges {
    // applicationAPI is optional
    @Input() applicationAPI: ApplicationPresenterAPI;
    // robotSettings is optional
    @Input() robotSettings: RobotSettings;
    private _applicationNode: SimpleWebsocketApplicationNode;

    private backendUrl: string;
    private socket: WebSocket;

    constructor(
        protected readonly translateService: TranslateService,
        protected readonly cd: ChangeDetectorRef
    ) {
    }

    // applicationNode is required
    get applicationNode(): SimpleWebsocketApplicationNode {
        return this._applicationNode;
    }

    @Input()
    set applicationNode(value: SimpleWebsocketApplicationNode) {
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
            this.backendUrl = 'ws://' + this.applicationAPI.getContainerContributionURL(VENDOR_ID, URCAP_ID, 'simple-websocket-backend', 'websocket-api') + '/';
        }
    }

    connectToWebsocket = (): void => {
        this.socket = new WebSocket(this.backendUrl);

        this.socket.addEventListener('open', (event) => {
            console.log('WebSocket connection established!', event);
        });

        this.socket.addEventListener('message', (event) => {
            console.log('Received message:', event.data);
        });

        this.socket.addEventListener('close', (event) => {
            console.log('WebSocket connection closed:', event.code, event.reason);
        });

        this.socket.addEventListener('error', (event) => {
            console.error('WebSocket error:', event);
        });
    };

    sendMessage = (): void => {
        this.socket.send(JSON.stringify({ "test": "Hello World from Client" }));
    };

    // call saveNode to save node parameters
    saveNode() {
        this.cd.detectChanges();
        this.applicationAPI.applicationNodeService.updateNode(this.applicationNode);
    }
}
