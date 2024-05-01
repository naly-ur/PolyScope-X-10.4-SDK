import { DoBootstrap, Injector, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { UIAngularComponentsModule } from '@universal-robots/ui-angular-components';
import { BrowserModule } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { HttpBackend, HttpClientModule } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import {MultiTranslateHttpLoader} from 'ngx-translate-multi-http-loader';
import { PATH } from '../generated/contribution-constants';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {AssignmentComponent} from "./components/assignment/assignment.component";
import {LoopComponent} from "./components/loop/loop.component";
import {MoveToComponent} from "./components/move-to/move-to.component";
import {SetComponent} from "./components/set/set.component";
import {ToolForceComponent} from "./components/tool-force/tool-force.component";
import {WaitComponent} from "./components/wait/wait.component";

export const httpLoaderFactory = (http: HttpBackend) =>
    new MultiTranslateHttpLoader(http, [
        { prefix: PATH + '/assets/i18n/', suffix: '.json' },
        { prefix: './ui/assets/i18n/', suffix: '.json' },
    ]);

@NgModule({
    declarations: [
      AssignmentComponent,
      LoopComponent,
      MoveToComponent,
      SetComponent,
      ToolForceComponent,
      WaitComponent
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
      const assignmentComponent = createCustomElement(AssignmentComponent, { injector: this.injector });
      customElements.define('ur-sample-node-assignment', assignmentComponent);
      const loopComponent = createCustomElement(LoopComponent, { injector: this.injector });
      customElements.define('ur-sample-node-loop', loopComponent);
      const moveToComponent = createCustomElement(MoveToComponent, { injector: this.injector });
      customElements.define('ur-sample-node-move-to', moveToComponent);
      const setComponent = createCustomElement(SetComponent, { injector: this.injector });
      customElements.define('ur-sample-node-set', setComponent);
      const toolForceComponent = createCustomElement(ToolForceComponent, { injector: this.injector });
      customElements.define('ur-sample-node-tool-force', toolForceComponent);
      const waitComponent = createCustomElement(WaitComponent, { injector: this.injector });
      customElements.define('ur-sample-node-wait', waitComponent);
    }

    // This function is never called, because we don't want to actually use the workers, just tell webpack about them
    registerWorkersWithWebPack() {
      new Worker(
        new URL('./components/assignment/assignment.behavior.worker.ts' /* webpackChunkName: "assignment.worker" */, import.meta.url),
        { name: 'ur-sample-node-assignment', type: 'module' }
      );
      new Worker(new URL('./components/loop/loop.behavior.worker.ts' /* webpackChunkName: "loop.worker" */, import.meta.url), {
        name: 'ur-sample-node-loop',
        type: 'module',
      });
      new Worker(new URL('./components/move-to/move-to.behavior.worker.ts' /* webpackChunkName: "move-to.worker" */, import.meta.url), {
        name: 'ur-sample-node-move-to',
        type: 'module',
      });
      new Worker(new URL('./components/set/set.behavior.worker.ts' /* webpackChunkName: "set.worker" */, import.meta.url), {
        name: 'ur-sample-node-set',
        type: 'module',
      });
      new Worker(
        new URL('./components/tool-force/tool-force.behavior.worker.ts' /* webpackChunkName: "tool-force.worker" */, import.meta.url), {
          name: 'ur-sample-node-tool-force',
          type: 'module'
        }
      );
      new Worker(new URL('./components/wait/wait.behavior.worker.ts' /* webpackChunkName: "wait.worker" */, import.meta.url), {
        name: 'ur-sample-node-wait',
        type: 'module',
      });
    }
}

