import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TranslateLoader, TranslateModule} from "@ngx-translate/core";
import {Observable, of} from "rxjs";
import {GripDistanceProgramComponent} from "./gripdistance-program.component";

describe('GripDistanceProgramComponent', () => {
    let fixture: ComponentFixture<GripDistanceProgramComponent>;
    let component: GripDistanceProgramComponent;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [GripDistanceProgramComponent],
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

        fixture = TestBed.createComponent(GripDistanceProgramComponent);
        component = fixture.componentInstance;
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });
});
