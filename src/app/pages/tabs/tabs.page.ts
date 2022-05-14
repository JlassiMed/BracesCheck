import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import * as firebase from 'firebase';
import { AppService } from 'src/app/services/app.service';
import { ComponentService } from 'src/app/services/component.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  constructor(
    public appService: AppService,
    private navCtrl: NavController,
    private componentService: ComponentService
  ) { }

  logout() {
    firebase.auth().signOut().then(() => {
      this.componentService.getLoader().then(
        (loader: any) => {
          loader.present().then(
            () => {
              this.navCtrl.navigateRoot('/login');
              localStorage.clear();
              loader.dismiss();
            }
          );
        }
      );
    }).catch((error: any) => {
      console.log(error);
    });
  }

}
