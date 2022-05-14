import { Component } from '@angular/core';
import { NavController, Platform } from '@ionic/angular';
import * as firebase from 'firebase';
import { environment } from 'src/environments/environment';
import { AppService } from './services/app.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  constructor(
    private platform: Platform,
    private navCtrl: NavController,
    private appService: AppService
  ) {
    firebase.initializeApp(environment.firebaseConfig);
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(
      () => {
        this.appService.setRSSI('');
        this.appService.setPairedDevice('');
        this.appService.setBatteryLevel('0');
        if (this.appService.getProfile().name) {
          if (this.appService.getProfile().role == 'patient') {
            this.navCtrl.navigateRoot('/tabs/request-appointment');
          } else {
            this.navCtrl.navigateRoot('/tabs/home');
          }
        } else {
          this.navCtrl.navigateRoot('/login');
        }
      }
    );
  }
}
