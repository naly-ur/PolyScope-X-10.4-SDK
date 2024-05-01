import {ComponentFixture, TestBed} from '@angular/core/testing';
import {<%= programComponentName %>Component} from "./<%= programNodeName %>.component";
import {TranslateLoader, TranslateModule} from "@ngx-translate/core";
import {Observable, of} from "rxjs";

describe('<%= programComponentName %>Component', () => {
  let fixture: ComponentFixture<<%= programComponentName %>Component>;
  let component: <%= programComponentName %>Component;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [<%= programComponentName %>Component],
      imports: [TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader, useValue: {
            getTranslation(): Observable<Record<string, string>> {
              return of({});
            }
          }
        }
      })],
    }).compileComponents();

    fixture = TestBed.createComponent(<%= programComponentName %>Component);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
});
