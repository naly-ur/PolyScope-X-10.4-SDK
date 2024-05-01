import {ComponentFixture, TestBed} from '@angular/core/testing';
import {<%= applicationComponentName %>Component} from "./<%= applicationNodeName %>.component";
import {TranslateLoader, TranslateModule} from "@ngx-translate/core";
import {Observable, of} from "rxjs";

describe('<%= applicationComponentName %>Component', () => {
  let fixture: ComponentFixture<<%= applicationComponentName %>Component>;
  let component: <%= applicationComponentName %>Component;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [<%= applicationComponentName %>Component],
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

    fixture = TestBed.createComponent(<%= applicationComponentName %>Component);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
});
