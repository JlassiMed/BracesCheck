import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ReportAProblemPageRoutingModule } from './report-a-problem-routing.module';

import { ReportAProblemPage } from './report-a-problem.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReportAProblemPageRoutingModule
  ],
  declarations: [ReportAProblemPage]
})
export class ReportAProblemPageModule {}
