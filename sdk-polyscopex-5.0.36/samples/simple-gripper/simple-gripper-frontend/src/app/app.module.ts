import {CUSTOM_ELEMENTS_SCHEMA, DoBootstrap, Injector, NgModule, NO_ERRORS_SCHEMA} from '@angular/core';
import {GripperApplicationComponent} from './components/gripper-application/gripper-application.component';
import {UIAngularComponentsModule} from '@universal-robots/ui-angular-components';
import {BrowserModule} from '@angular/platform-browser';
import {createCustomElement} from '@angular/elements';
import {HttpBackend, HttpClientModule} from '@angular/common/http';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {GripperNodeComponent} from './components/gripper-node/gripper-node.component';
import {PATH} from '../generated/contribution-constants';
import {MultiTranslateHttpLoader} from 'ngx-translate-multi-http-loader';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";

export const httpLoaderFactory = (http: HttpBackend) =>
    new MultiTranslateHttpLoader(http, [
        { prefix: PATH + '/assets/i18n/', suffix: '.json' },
        { prefix: './ui/assets/i18n/', suffix: '.json' },
    ]);

@NgModule({
    declarations: [GripperNodeComponent, GripperApplicationComponent],
    schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        UIAngularComponentsModule,
        HttpClientModule,
        TranslateModule.forRoot({
            loader: { provide: TranslateLoader, useFactory: httpLoaderFactory, deps: [HttpBackend] },
            useDefaultLang: false,
        }),
    ],
    providers: [],
})
export class AppModule implements DoBootstrap {
    constructor(private injector: Injector) {}

    ngDoBootstrap() {
        const gripperNodeComponent = createCustomElement(GripperNodeComponent, { injector: this.injector });
        customElements.define('ur-simple-gripper-node', gripperNodeComponent);
        const gripperApplicationComponent = createCustomElement(GripperApplicationComponent, { injector: this.injector });
        customElements.define('ur-simple-gripper-application', gripperApplicationComponent);
    }

    // This function is never called, because we don't want to actually use the workers, just tell webpack about them
    registerWorkersWithWebPack() {
        // tslint:disable-next-line:no-unused-expression
        new Worker(new URL('./components/gripper-application/gripper-application.behavior.worker.ts'
            /* webpackChunkName: "gripper-application.worker" */, import.meta.url), {
            name: 'gripper-application', type: 'module'
        });
        // tslint:disable-next-line:no-unused-expression
        new Worker(new URL('./components/gripper-node/gripper-node.behavior.worker.ts'
            /* webpackChunkName: "gripper-node.worker" */, import.meta.url), {
            name: 'gripper-node', type: 'module'
        });
    }
}
