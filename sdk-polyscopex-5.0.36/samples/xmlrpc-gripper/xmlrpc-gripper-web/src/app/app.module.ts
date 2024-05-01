import {DoBootstrap, Injector, NgModule, NO_ERRORS_SCHEMA} from '@angular/core';
import {XmlrpcGripperPrgComponent} from './components/xmlrpc-gripper-prg/xmlrpc-gripper-prg.component';
import {XmlrpcGripperAppComponent} from './components/xmlrpc-gripper-app/xmlrpc-gripper-app.component';
import {UIAngularComponentsModule} from '@universal-robots/ui-angular-components';
import {BrowserModule} from '@angular/platform-browser';
import {createCustomElement} from '@angular/elements';
import {HttpBackend, HttpClientModule} from '@angular/common/http';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {PATH} from '../generated/contribution-constants';
import {MultiTranslateHttpLoader} from 'ngx-translate-multi-http-loader';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";

export const httpLoaderFactory  = (http: HttpBackend) =>
    new MultiTranslateHttpLoader(http, [
        { prefix: PATH + '/assets/i18n/', suffix: '.json' },
        { prefix: './ui/assets/i18n/', suffix: '.json' },
    ]);

@NgModule({
    declarations: [
        XmlrpcGripperPrgComponent,
        XmlrpcGripperAppComponent
    ],
    schemas: [NO_ERRORS_SCHEMA],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        UIAngularComponentsModule,
        HttpClientModule,
        TranslateModule.forRoot({
            loader: { provide: TranslateLoader, useFactory: httpLoaderFactory, deps: [HttpBackend] },
            useDefaultLang: false,
        })
    ],
    providers: [],
})

export class AppModule implements DoBootstrap {
    constructor(private injector: Injector) {
    }

    ngDoBootstrap() {
        const xmlrpcGripperPrgComponent = createCustomElement(XmlrpcGripperPrgComponent, {injector: this.injector});
        customElements.define('universal-robots-xmlrpc-gripper-web-xmlrpc-gripper-prg', xmlrpcGripperPrgComponent);
        const xmlrpcGripperAppComponent = createCustomElement(XmlrpcGripperAppComponent, {injector: this.injector});
        customElements.define('universal-robots-xmlrpc-gripper-web-xmlrpc-gripper-app', xmlrpcGripperAppComponent);
    }

    // This function is never called, because we don't want to actually use the workers, just tell webpack about them
    registerWorkersWithWebPack() {
        new Worker(new URL('./components/xmlrpc-gripper-app/xmlrpc-gripper-app.behavior.worker.ts'
            /* webpackChunkName: "xmlrpc-gripper-app.worker" */, import.meta.url), {
            name: 'xmlrpc-gripper-app',
            type: 'module'
        });
        new Worker(new URL('./components/xmlrpc-gripper-prg/xmlrpc-gripper-prg.behavior.worker.ts'
            /* webpackChunkName: "xmlrpc-gripper-prg.worker" */, import.meta.url), {
            name: 'xmlrpc-gripper-prg',
            type: 'module'
        });
    }
}

