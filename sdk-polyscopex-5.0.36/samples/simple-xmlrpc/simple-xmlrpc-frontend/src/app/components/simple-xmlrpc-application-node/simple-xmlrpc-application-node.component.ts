import {TranslateService} from '@ngx-translate/core';
import {first} from 'rxjs/operators';
import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {ApplicationPresenter, ApplicationPresenterAPI, RobotSettings} from '@universal-robots/contribution-api';
import {SimpleXmlrpcApplicationNode} from './simple-xmlrpc-application-node.node';
import {XmlRpcClient} from '../../xmlrpc/xmlrpc-client';
import {URCAP_ID, VENDOR_ID} from '../../../generated/contribution-constants';


@Component({
    templateUrl: './simple-xmlrpc-application-node.component.html',
    styleUrls: ['./simple-xmlrpc-application-node.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimpleXmlrpcApplicationNodeComponent implements ApplicationPresenter, OnChanges {
    // applicationAPI is optional
    @Input() applicationAPI: ApplicationPresenterAPI;
    // robotSettings is optional
    @Input() robotSettings: RobotSettings;
    private _applicationNode: SimpleXmlrpcApplicationNode;

    private xmlrpc: XmlRpcClient;

    response: string;

    constructor(
        protected readonly translateService: TranslateService,
        protected readonly cd: ChangeDetectorRef
    ) {
    }

    // applicationNode is required
    get applicationNode(): SimpleXmlrpcApplicationNode {
        return this._applicationNode;
    }

    @Input()
    set applicationNode(value: SimpleXmlrpcApplicationNode) {
        this._applicationNode = value;
        this.cd.detectChanges();
    }

    async ngOnChanges(changes: SimpleChanges): Promise<void> {
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
        const url = this.applicationAPI.getContainerContributionURL(VENDOR_ID, URCAP_ID, 'simple-xmlrpc-backend', 'xmlrpc');
        this.xmlrpc = new XmlRpcClient(`${location.protocol}//${url}/`);
    }

    async getListOfMethods() {
        this.response = await this.xmlrpc.methodCall('system.listMethods');
        console.log(this.response);
    }

    async getMethodHelp() {
        this.response = await this.xmlrpc.methodCall('system.methodHelp', 'echo_string_method');
        console.log(this.response);
    }

    async sendString() {
        this.response = await this.xmlrpc.methodCall('echo_string_method', 'Great Job!');
        console.log(this.response);
    }

    async sendInteger() {
        this.response = await this.xmlrpc.methodCall('echo_integer_method', 10);
        console.log(this.response);
    }

    async sendStruct() {
        const myData = {
            name: 'John',
            age: 30.7,
            address: {
                city: 'Odense',
                zipCode: 5220,
            },
            hobbies: ['Reading', 'Gardening'],
        };
        const response_object = await this.xmlrpc.methodCall('echo_struct_method', myData);
        this.response = JSON.stringify(response_object);
        console.log(response_object);
    }

    // call saveNode to save node parameters
    saveNode() {
        this.cd.detectChanges();
        this.applicationAPI.applicationNodeService.updateNode(this.applicationNode);
    }
}
