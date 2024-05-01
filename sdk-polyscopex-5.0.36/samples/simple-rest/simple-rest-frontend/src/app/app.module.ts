import { DoBootstrap, Injector, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { SimpleRestApplicationNodeComponent } from './components/simple-rest-application-node/simple-rest-application-node.component';
import { UIAngularComponentsModule } from '@universal-robots/ui-angular-components';
import { BrowserModule } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { HttpBackend, HttpClientModule } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import {MultiTranslateHttpLoader} from 'ngx-translate-multi-http-loader';
import { PATH } from '../generated/contribution-constants';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";

export const httpLoaderFactory = (http: HttpBackend) =>
    new MultiTranslateHttpLoader(http, [
        { prefix: PATH + '/assets/i18n/', suffix: '.json' },
        { prefix: './ui/assets/i18n/', suffix: '.json' },
    ]);

@NgModule({
    declarations: [
        SimpleRestApplicationNodeComponent
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
        const simplerestapplicationnodeComponent = createCustomElement(SimpleRestApplicationNodeComponent, {injector: this.injector});
        customElements.define('ur-simple-rest-application-node', simplerestapplicationnodeComponent);
    }

    // This function is never called, because we don't want to actually use the workers, just tell webpack about them
    registerWorkersWithWebPack() {
        new Worker(new URL('./components/simple-rest-application-node/simple-rest-application-node.behavior.worker.ts'
            /* webpackChunkName: "simple-rest-application-node.worker" */, import.meta.url), {
            name: 'simple-rest-application-node',
            type: 'module'
        });
    }
}

