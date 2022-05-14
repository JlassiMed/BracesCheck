import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DevicesListingPageRoutingModule } from './devices-listing-routing.module';

import { DevicesListingPage } from './devices-listing.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DevicesListingPageRoutingModule
  ],
  declarations: [DevicesListingPage]
})
export class DevicesListingPageModule {}
