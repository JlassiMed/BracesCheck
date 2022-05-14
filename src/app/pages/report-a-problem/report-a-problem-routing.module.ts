import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ReportAProblemPage } from './report-a-problem.page';

const routes: Routes = [
  {
    path: '',
    component: ReportAProblemPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportAProblemPageRoutingModule {}
