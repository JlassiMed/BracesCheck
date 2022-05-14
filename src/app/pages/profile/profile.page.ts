import { Component, OnInit, ViewChild } from '@angular/core';
import { IonDatetime } from '@ionic/angular';
import { modalController } from '@ionic/core';
import * as firebase from 'firebase';
import { AppService } from 'src/app/services/app.service';
import { ComponentService } from 'src/app/services/component.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  gender = '';
  selectedLanguage = 'en';
  @ViewChild('dateTimeProfile', { static: false }) datetime: IonDatetime;
  db = firebase.firestore();

  constructor(
    public appService: AppService,
    private componentService: ComponentService
  ) {
    this.gender = appService.getProfile().gender;
  }

  dateChanged() {
    localStorage.setItem('dateOfBirth', this.datetime.value);
    this.db.collection('users').doc(this.appService.getProfile().id).update({
      date_of_birth: this.datetime.value,
      updated_at: new Date()
    }).catch((err: any) => {
      this.db.collection('errorLogs').doc(this.appService.getProfile().id).collection('error').add({
        collection: 'users',
        error: JSON.stringify(err),
        created_at: new Date().toISOString(),
        created_by: this.appService.getProfile().id
      });
    });
    this.componentService.getToast('Date of birth updated successfully.', 3000, 'top', 'success').then(
      (toast: any) => {
        toast.present();
      }
    );
  }

  confirm() {
    this.datetime.confirm();
    modalController.dismiss();
  }

  cancel() {
    this.datetime.cancel();
    modalController.dismiss();
  }

  onGenderChange(event: any) {
    localStorage.setItem('gender', event.detail.value);
    this.db.collection('users').doc(this.appService.getProfile().id).update({
      gender: event.detail.value,
      updated_at: new Date()
    }).catch((err: any) => {
      this.db.collection('errorLogs').doc(this.appService.getProfile().id).collection('error').add({
        collection: 'users',
        error: JSON.stringify(err),
        created_at: new Date().toISOString(),
        created_by: this.appService.getProfile().id
      });
    });
    this.componentService.getToast('Gender updated successfully.', 3000, 'top', 'success').then(
      (toast: any) => {
        toast.present();
      }
    );
  }

  ngOnInit() {
  }

}
