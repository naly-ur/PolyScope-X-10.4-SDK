import { DoBootstrap, Injector, NgModule } from '@angular/core';
<% if (hasProgramNode) { %>import { <%= programComponentName %>Component } from './components/<%= programNodeName %>/<%= programNodeName %>.component';
<% } if (hasApplicationNode) { %>import { <%= applicationComponentName %>Component } from './components/<%= applicationNodeName %>/<%= applicationNodeName %>.component';
<% } if (hasSmartSkill) { %>import { <%= smartSkillComponentName %>Component } from './components/<%= smartSkillName %>/<%= smartSkillName %>.component';
<% } %>import { UIAngularComponentsModule } from '@universal-robots/ui-angular-components';
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
<% if (hasProgramNode) { %>        <%= programComponentName %>Component<% if (hasApplicationNode) {%>,<% }%>
<% } if (hasApplicationNode) { %>        <%= applicationComponentName %>Component<% if (hasSmartSkill) {%>,<% }%>
<% } if (hasSmartSkill) { %>        <%= smartSkillComponentName %>Component
<% } %>    ],
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
<% if (hasProgramNode) { %>        const <%= programComponentName.toLowerCase() %>Component = createCustomElement(<%= programComponentName %>Component, {injector: this.injector});
        customElements.define('<%= programTagName %>', <%= programComponentName.toLowerCase() %>Component);
<% }; if (hasApplicationNode) { %>        const <%= applicationComponentName.toLowerCase() %>Component = createCustomElement(<%= applicationComponentName %>Component, {injector: this.injector});
        customElements.define('<%= applicationTagName %>', <%= applicationComponentName.toLowerCase() %>Component);
<% }; if (hasSmartSkill) { %>        const <%= smartSkillComponentName.toLowerCase() %>Component = createCustomElement(<%= smartSkillComponentName %>Component, {injector: this.injector});
        customElements.define('<%= smartSkillTagName %>', <%= smartSkillComponentName.toLowerCase() %>Component);
<% };%>    }

    // This function is never called, because we don't want to actually use the workers, just tell webpack about them
    registerWorkersWithWebPack() {
<% if (hasApplicationNode) { %>        new Worker(new URL('./components/<%= applicationNodeName %>/<%= applicationNodeName %>.behavior.worker.ts'
            /* webpackChunkName: "<%= applicationNodeName %>.worker" */, import.meta.url), {
            name: '<%= applicationNodeName %>',
            type: 'module'
        });
<% }; if (hasProgramNode) { %>        new Worker(new URL('./components/<%= programNodeName %>/<%= programNodeName %>.behavior.worker.ts'
            /* webpackChunkName: "<%= programNodeName %>.worker" */, import.meta.url), {
            name: '<%= programNodeName %>',
            type: 'module'
        });
<% }; if (hasSmartSkill) { %>        new Worker(new URL('./components/<%= smartSkillName %>/<%= smartSkillName %>.behavior.worker.ts'
        /* webpackChunkName: "<%= smartSkillName %>.worker" */, import.meta.url), {
        name: '<%= smartSkillName %>',
        type: 'module'
      });
<% };%>    }
}

