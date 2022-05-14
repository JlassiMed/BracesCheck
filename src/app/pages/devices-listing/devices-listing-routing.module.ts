import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DevicesListingPage } from './devices-listing.page';

const routes: Routes = [
  {
    path: '',
    component: DevicesListingPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DevicesListingPageRoutingModule {}
