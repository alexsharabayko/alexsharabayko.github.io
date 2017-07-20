import { Component } from '@angular/core';

@Component({
  selector: 'dk-app',
  template: `<dk-hero-form></dk-hero-form><dk-promo></dk-promo>`,
})
export class AppComponent  { name = 'Angular'; }
