import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      { path: '', redirectTo: '/tabs/home', pathMatch: 'full' },
      { path: 'home', loadChildren: () => import('../home/home.module').then(m => m.HomePageModule) },
      { path: 'profile', loadChildren: () => import('../profile/profile.module').then(m => m.ProfilePageModule) },
      { path: 'devices', loadChildren: () => import('../devices/devices.module').then(m => m.DevicesPageModule) },
      { path: 'request-appointment', loadChildren: () => import('../request-appointment/request-appointment.module').then(m => m.RequestAppointmentPageModule) },
      { path: 'report-a-problem', loadChildren: () => import('../report-a-problem/report-a-problem.module').then(m => m.ReportAProblemPageModule) }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule { }
