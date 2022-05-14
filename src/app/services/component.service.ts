import { Injectable } from '@angular/core';
import { AlertController, LoadingController, ModalController, ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ComponentService {

  constructor(
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private alertController: AlertController
  ) { }

  public getModal(cmp: any, cmpProps: any, css = '', bdd = false) {
    return this.modalCtrl.create({
      component: cmp,
      componentProps: cmpProps,
      cssClass: css,
      backdropDismiss: bdd
    });
  }

  public getLoader(spnr = undefined, msg = '', css = '', bdd = false) {
    return this.loadingCtrl.create({
      spinner: 'bubbles',
      message: msg,
      cssClass: css,
      backdropDismiss: bdd
    });
  }

  public getToast(msg: any, dur: any, pos: any, css = '') {
    return this.toastCtrl.create({
      message: msg,
      duration: dur,
      position: pos,
      cssClass: css,
    });
  }

  getAlert(title: any, msg: any, css = '', bbd?: any) {
    return this.alertController.create({
      header: title,
      message: msg,
      cssClass: css,
      buttons: ['OK'],
      backdropDismiss: bbd
    });
  }

  getConfirmAlert(title: any, msg: any, css?: any) {
    const alert = this.alertController.create({
      header: title,
      message: msg,
      cssClass: css,
      backdropDismiss: false,
      buttons: [
        {
          text: 'Yes',
          role: 'true',
          handler: () => {
            this.alertController.dismiss();
          }
        },
        {
          text: 'No',
          role: 'false',
          handler: () => {
            this.alertController.dismiss();
          }
        }
      ]
    });
    return alert;
  }

  getInputAlert(title: any, msg: any, btn: any, css = '', bbd = false) {
    return this.alertController.create({
      header: title,
      message: msg,
      cssClass: css,
      inputs: [
        {
          name: 'email',
          type: 'email',
          placeholder: title
        }
      ],
      buttons: [
        {
          text: btn,
          role: 'true',
          handler: () => {
            this.alertController.dismiss();
          }
        }
      ],
      backdropDismiss: bbd
    });
  }
}