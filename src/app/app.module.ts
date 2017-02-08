import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppComponent }  from './app.component';
import { HeroFormComponent }  from './hero/hero-form.component';
import { PromoComponent }  from './promo/promo.component';

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
    ],
    declarations: [
        AppComponent,
        HeroFormComponent,
        PromoComponent,
    ],
    bootstrap: [
        AppComponent
    ]
})
export class AppModule {
}
