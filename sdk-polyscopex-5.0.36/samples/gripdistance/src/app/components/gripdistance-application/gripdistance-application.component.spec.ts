import {ComponentFixture, TestBed} from '@angular/core/testing';
import {GripDistanceApplicationComponent} from "./gripdistance-application.component";
import {TranslateLoader, TranslateModule} from "@ngx-translate/core";
import {Observable, of} from "rxjs";

describe('GripDistanceApplicationComponent', () => {
    let fixture: ComponentFixture<GripDistanceApplicationComponent>;
    let component: GripDistanceApplicationComponent;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [GripDistanceApplicationComponent],
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

        fixture = TestBed.createComponent(GripDistanceApplicationComponent);
        component = fixture.componentInstance;
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });
});
