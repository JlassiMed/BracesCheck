import { Component, OnInit } from '@angular/core';
import * as firebase from 'firebase';
import { AppService } from 'src/app/services/app.service';
import { ComponentService } from 'src/app/services/component.service';

@Component({
  selector: 'app-report-a-problem',
  templateUrl: './report-a-problem.page.html',
  styleUrls: ['./report-a-problem.page.scss'],
})
export class ReportAProblemPage implements OnInit {

  db = firebase.firestore();
  problem = '';
  submitted = false;

  constructor(
    private appService: AppService,
    private componentService: ComponentService
  ) { }

  onSubmitClick() {
    this.submitted = true;
    if (this.problem != '') {
      this.componentService.getLoader().then(
        (loader) => {
          loader.present().then(
            () => {
              this.db.collection('problems').doc(this.appService.getProfile().id).collection('problem').add({
                problem: this.problem,
                user_id: this.appService.getProfile().id
              }).catch((err: any) => {
                this.db.collection('errorLogs').doc(this.appService.getProfile().id).collection('error').add({
                  collection: 'problems',
                  error: JSON.stringify(err),
                  created_at: new Date().toISOString(),
                  created_by: this.appService.getProfile().id
                });
                loader.dismiss();
              });
              this.componentService.getToast('Problem submitted.', 2000, 'top', 'success').then(
                (toast) => {
                  toast.present();
                  this.submitted = false;
                  this.problem = '';
                  loader.dismiss();
                }
              );
            }
          );
        }
      );
    }
  }

  ngOnInit() {
  }

}
