import { DoBootstrap, Injector, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { SimpledockerApplicationNodeComponent } from './components/simple-docker-application-node/simple-docker-application-node.component';
import { UIAngularComponentsModule } from '@universal-robots/ui-angular-components';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { createCustomElement } from '@angular/elements';
import {HttpBackend, HttpClientModule} from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { PATH } from '../generated/contribution-constants';
import {MultiTranslateHttpLoader} from 'ngx-translate-multi-http-loader';

export const httpLoaderFactory = (http: HttpBackend) =>
    new MultiTranslateHttpLoader(http, [
        { prefix: PATH + '/assets/i18n/', suffix: '.json' },
        { prefix: './ui/assets/i18n/', suffix: '.json' },
    ]);

@NgModule({
    declarations: [SimpledockerApplicationNodeComponent],
    schemas: [NO_ERRORS_SCHEMA],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        UIAngularComponentsModule,
        HttpClientModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: httpLoaderFactory,
                deps: [HttpBackend],
            },
        }),
    ],
    providers: [],
})
export class AppModule implements DoBootstrap {
    constructor(private injector: Injector) {}

    ngDoBootstrap() {
        const simpledockerapplicationnodeComponent = createCustomElement(SimpledockerApplicationNodeComponent, { injector: this.injector });
        customElements.define('ur-sample-simple-docker-application', simpledockerapplicationnodeComponent);
    }

    // This function is never called, because we don't want to actually use the workers, just tell webpack about them
    registerWorkersWithWebPack() {
        new Worker(
            new URL('./components/simple-docker-application-node/simple-docker-application-node.behavior.worker.ts'
                /* webpackChunkName: "simple-docker-application-node.worker" */, import.meta.url), {
                name: 'simple-docker-application-node', type: 'module',
            });
    }
}
