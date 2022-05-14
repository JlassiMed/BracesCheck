import { Component, OnInit, ViewChild } from '@angular/core';
import { IonDatetime } from '@ionic/angular';
import * as firebase from 'firebase';
import { AppService } from 'src/app/services/app.service';
import { ComponentService } from 'src/app/services/component.service';

@Component({
  selector: 'app-request-appointment',
  templateUrl: './request-appointment.page.html',
  styleUrls: ['./request-appointment.page.scss'],
})
export class RequestAppointmentPage implements OnInit {

  date = new Date();
  @ViewChild('dateTime', { static: false }) datetime: IonDatetime;
  db = firebase.firestore();

  constructor(
    private appService: AppService,
    private componentService: ComponentService
  ) { }

  dateChanged() {
    this.date = new Date(this.datetime.value);
  }

  onSubmitClick() {
    this.componentService.getLoader().then(
      (loader) => {
        loader.present().then(
          () => {
            this.db.collection('appointments').doc(this.appService.getProfile().id).collection('appointment').add({
              date: this.date,
              user_id: this.appService.getProfile().id
            }).catch((err: any) => {
              this.db.collection('errorLogs').doc(this.appService.getProfile().id).collection('error').add({
                collection: 'appointments',
                error: JSON.stringify(err),
                created_at: new Date().toISOString(),
                created_by: this.appService.getProfile().id
              });
              loader.dismiss();
            });
            this.componentService.getToast('Appointment submitted.', 2000, 'top', 'success').then(
              (toast) => {
                toast.present();
                this.date = new Date();
                loader.dismiss();
              }
            );
          }
        );
      }
    );
  }

  ngOnInit() {
  }

}
