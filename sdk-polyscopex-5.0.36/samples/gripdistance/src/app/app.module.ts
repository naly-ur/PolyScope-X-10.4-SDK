import {DoBootstrap, Injector, NgModule} from '@angular/core';
import {createCustomElement} from '@angular/elements';
import {
    GripDistanceApplicationComponent
} from './components/gripdistance-application/gripdistance-application.component';
import {GripDistanceProgramComponent} from './components/gripdistance-program/gripdistance-program.component';
import {HttpBackend, HttpClientModule} from '@angular/common/http';
import {PATH} from '../generated/contribution-constants';
import {MultiTranslateHttpLoader} from 'ngx-translate-multi-http-loader';
import {BrowserModule} from "@angular/platform-browser";
import {UIAngularComponentsModule} from "@universal-robots/ui-angular-components";
import {TranslateLoader, TranslateModule} from "@ngx-translate/core";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";

export const httpLoaderFactory = (http: HttpBackend) =>
    new MultiTranslateHttpLoader(http, [
        {prefix: PATH + '/assets/i18n/', suffix: '.json'},
        {prefix: './ui/assets/i18n/', suffix: '.json'},
    ]);

@NgModule({
    declarations: [
        GripDistanceApplicationComponent,
        GripDistanceProgramComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        UIAngularComponentsModule,
        HttpClientModule,
        TranslateModule.forRoot({
            loader: {provide: TranslateLoader, useFactory: httpLoaderFactory, deps: [HttpBackend]},
        })
    ],
    providers: [],
})

export class AppModule implements DoBootstrap {
    constructor(private injector: Injector) {
    }

    ngDoBootstrap() {
        const gripDistanceApplicationComponent = createCustomElement(GripDistanceApplicationComponent, {injector: this.injector});
        customElements.define('ur-sample-gripdistance-application', gripDistanceApplicationComponent);
        const gripDistanceProgramComponent = createCustomElement(GripDistanceProgramComponent, {injector: this.injector});
        customElements.define('ur-sample-gripdistance-program', gripDistanceProgramComponent);
    }

    // This function is never called, because we don't want to actually use the workers, just tell webpack about them
    registerWorkersWithWebPack() {
        new Worker(new URL('./components/gripdistance-application/gripdistance-application.behavior.worker.ts'
            /* webpackChunkName: "gripdistance-application.worker" */, import.meta.url), {
            name: 'gripdistance-application',
            type: 'module'
        });
        new Worker(new URL('./components/gripdistance-program/gripdistance-program.behavior.worker.ts'
            /* webpackChunkName: "gripdistance-program.worker" */, import.meta.url), {
            name: 'gripdistance-program',
            type: 'module'
        });
    }
}

