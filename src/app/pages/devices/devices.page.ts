import { Component, OnInit } from '@angular/core';
import { BluetoothLE } from '@awesome-cordova-plugins/bluetooth-le/ngx';
import { NavController, Platform } from '@ionic/angular';
import * as firebase from 'firebase';
import { AppService } from 'src/app/services/app.service';
import { ComponentService } from 'src/app/services/component.service';

@Component({
  selector: 'app-devices',
  templateUrl: './devices.page.html',
  styleUrls: ['./devices.page.scss'],
})
export class DevicesPage implements OnInit {

  devices: any[] = [];
  dataLoaded = false;
  db = firebase.firestore();

  constructor(
    private platform: Platform,
    public appService: AppService,
    private navCtrl: NavController,
    private bluetoothle: BluetoothLE,
    private componentService: ComponentService
  ) {
    appService.getMessage().subscribe(
      (res: any) => {
        console.log(res)
        if (res.text == 'refresh') {
          this.dataLoaded = false;
          this.getData();
        }
      }
    );
  }

  parseData(bytes: any) {
    console.log(bytes);
  }

  async getDeviceData(params: any) {
    /**
     * 1801 Generic Attribute Profile
     * 2A05 Service Changed
     * 
     * 1800 Generic Access Profile
     * 2A00 Device Name
     * 2A01 Appearance
     * 2AA6 Central Address Resolution
     * 
     * 180A Device Information 
     * 2A23 System ID
     * 2A24 Model Number String
     * 2A25 Serial Number String
     * 2A26 Firmware Revision String
     * 2A27 Hardware Revision String
     * 2A28 Software Revision String
     * 2A29 Manufacturer Name String
     * 2A2A IEEE 11073-20601 Regulatory Cert. Data List
     * 2A50 PnP ID
     * 
     * 180F Battery Service
     * 2A19 Battery Level  
     */
    const receivedSignalStrengthIndicator = await this.bluetoothle.rssi({ address: params.address });
    this.appService.setRSSI(receivedSignalStrengthIndicator.rssi);

    // if (params.service == '1801' && params.characteristic == '2A05') {
    //   const data: any = await this.bluetoothle.read(params).catch((reason: any) => {
    //     console.log(reason);
    //   });
    //   const bytes = this.bluetoothle.encodedStringToBytes(data.value);
    // }

    // if (params.service == '1800' && (params.characteristic == '2A00' || params.characteristic == '2A01' || params.characteristic == '2AA6')) {
    //   const data: any = await this.bluetoothle.read(params).catch((reason: any) => {
    //     console.log(reason);
    //   });
    //   if (params.characteristic == '2A00') {
    //     const name = atob(data.value);
    //   }
    // }

    // if (params.service == '180A' && (params.characteristic == '2A23' || params.characteristic == '2A24' || params.characteristic == '2A25' || params.characteristic == '2A26' || params.characteristic == '2A27' || params.characteristic == '2A28' || params.characteristic == '2A29' || params.characteristic == '2A2A' || params.characteristic == '2A50')) {
    //   const data: any = await this.bluetoothle.read(params).catch((reason: any) => {
    //     console.log(reason);
    //   });
    //   if (params.characteristic == '2A24') {
    //     const modelNumber = atob(data.value);
    //   }
    //   if (params.characteristic == '2A25') {
    //     const serialNumber = atob(data.value);
    //   }
    //   if (params.characteristic == '2A26') {
    //     const firmwareRevision = atob(data.value);
    //   }
    //   if (params.characteristic == '2A27') {
    //     const hardwareRevision = atob(data.value);
    //   }
    //   if (params.characteristic == '2A28') {
    //     const softwareRevision = atob(data.value);
    //   }
    //   if (params.characteristic == '2A29') {
    //     const manufacturerName = atob(data.value);
    //   }
    //   if (params.characteristic == '2A2A') {
    //     // IEEE 11073-20601 Regulatory Cert. Data List
    //     const bytes = this.bluetoothle.encodedStringToBytes(data.value);
    //     console.log('IEEE bytes: ' + bytes);
    //     this.parseData(bytes);
    //   }
    //   if (params.characteristic == '2A50') {
    //     const bytes = this.bluetoothle.encodedStringToBytes(data.value);
    //     console.log('PnPID bytes: ' + bytes);
    //     this.parseData(bytes);
    //   }
    // }

    // if (params.service == '180F' && params.characteristic == '2A19') {
    //   const data: any = await this.bluetoothle.read(params).catch((reason: any) => {
    //     console.log(reason);
    //   });
    //   const bytes = this.bluetoothle.encodedStringToBytes(data.value);
    //   this.appService.setBatteryLevel(bytes[0]);
    // }

    if (params.service == '4FAFC201-1FB5-459E-8FCC-C5C9C331914B' && (params.characteristic == '4FAFC202-1FB5-459E-8FCC-C5C9C331914B' || params.characteristic == '4FAFC204-1FB5-459E-8FCC-C5C9C331914B')) {
      this.bluetoothle.subscribe(params).subscribe((data: any) => {
        console.log('device data');
        console.log(data);
        if (params.characteristic == '4FAFC202-1FB5-459E-8FCC-C5C9C331914B') {
          if (data.value) {
            const bytes = this.bluetoothle.encodedStringToBytes(data.value);
            const temperatureString = new TextDecoder().decode(bytes);
            const indexOf = temperatureString.indexOf(':');
            const indexOfTime = temperatureString.indexOf(',');
            const time = temperatureString.substring(indexOf + 1, indexOfTime);
            const lastIndexOf = temperatureString.lastIndexOf(':');
            const indexOfTemperature = temperatureString.indexOf('>');
            const temperature = temperatureString.substring(lastIndexOf + 1, indexOfTemperature);

            this.db.collection('devicesData').doc(params.address).collection('deviceData').add({
              time: time,
              temperature: temperature,
              address: params.address,
              created_at: new Date().toISOString(),
              email: this.appService.getProfile().email,
              userName: this.appService.getProfile().name,
              created_by: this.appService.getProfile().id
            }).catch((err: any) => {
              this.db.collection('errorLogs').doc(this.appService.getProfile().id).collection('error').add({
                collection: 'deviceData',
                error: JSON.stringify(err),
                created_at: new Date().toISOString(),
                created_by: this.appService.getProfile().id
              });
            });
          }
        }
      }, (err: any) => {
        console.log(err);
      });
    }
  }

  discoverDevice(address: any, loader: any) {
    address.clearCache = true;
    this.appService.setPairedDevice(address.address);
    this.bluetoothle.discover(address).then(
      (device: any) => {
        device.services.forEach((element: any) => {
          if (element.uuid == '1801' || element.uuid == '1800' || element.uuid == '180A' || element.uuid == '180F' || element.uuid == '4FAFC201-1FB5-459E-8FCC-C5C9C331914B') {
            element.characteristics.forEach((characteristic: any) => {
              const params = { 'address': address.address, 'service': element.uuid, 'characteristic': characteristic.uuid };
              this.getDeviceData(params);
            });
          }
        });
        loader.dismiss();
      }, (err: any) => {
        console.log(err);
        loader.dismiss();
      }
    );
  }

  reconnectDevice(address: any, loader: any) {
    this.bluetoothle.reconnect(address).subscribe(
      (res: any) => {
        if (res.status === 'connected') {
          this.componentService.getToast('Device connected successfully.', 3000, 'top', 'success').then(
            (toast) => {
              toast.present();
            }
          );
          this.discoverDevice(address, loader);
        }
        if (res.status === 'disconnected') {
          if (loader) {
            loader.dismiss();
          }
          this.componentService.getAlert('Device Disconnected', 'Oops! Your device was somehow disconnected. After checking your device, please allow our app up to 30 seconds to reconnect.', 'custom-alert').then(
            (alert) => {
              alert.present();
            }
          );
        }
      }, (err: any) => {
        console.log(err);
        if (loader) {
          loader.dismiss();
        }
        if (err.error == 'isNotDisconnected') {
          this.componentService.getAlert('Oops', 'Oops! Your device is not found, Try again after few seconds.').then(
            (alert) => {
              alert.present();
            }
          );
        }
      }
    );
  }

  pairDevice(device: any) {
    if (this.appService.getPairedDevice() == device.address) {
      this.componentService.getToast('Already connected', 2000, 'top', 'danger').then(
        (toast) => {
          toast.present();
        }
      );
    } else {
      this.componentService.getLoader().then(
        (loader) => {
          loader.present().then(
            () => {
              const address = { 'address': device.address };
              this.bluetoothle.isConnected(address).then(
                (res: any) => {
                  console.log(res);
                  // If device was connected before
                  if (!res.isConnected) {
                    // Reconnect the device
                    this.reconnectDevice(address, loader);
                  }
                  if (res.isConnected) {
                    this.componentService.getToast('System is busy try after few seconds.', 3000, 'top', 'danger').then(
                      (toast) => {
                        toast.present();
                        this.closeConnection(address);
                        loader.dismiss();
                      }
                    );
                  }
                }, (err: any) => {
                  console.log(err);
                  // If device not connected before
                  if (err.error == 'neverConnected') {
                    this.connect(address, loader);
                  }
                }
              ).catch((error: any) => {
                loader.dismiss();
                console.log(error);
              });
            }
          );
        }
      );
    }
  }

  connect(address: any, loader: any) {
    this.bluetoothle.connect(address).subscribe(
      (res: any) => {
        if (res.status === 'connected') {
          this.componentService.getToast('Device connected successfully.', 3000, 'top', 'success').then(
            (toast) => {
              toast.present();
            }
          );
          this.discoverDevice(address, loader);
        }
        if (res.status === 'disconnected') {
          loader.dismiss();
        }
      }, (err: any) => {
        console.log(err);
        if (err.error == 'connect') {
          this.closeConnection(address);
          this.componentService.getAlert('Oops', 'Oops! Your device is not found, Try again after few seconds.').then(
            (alert) => {
              alert.present();
              loader.dismiss();
            }
          );
        }
      }
    );
  }

  closeConnection(address: any) {
    this.bluetoothle.close(address).then(
      (res: any) => {
        console.log(res);
      }, (err: any) => {
        console.log(err);
      }
    );
  }

  onAddNewDeviceClick() {
    this.navCtrl.navigateForward('devices-listing', { queryParams: { devices: this.devices }, animated: false });
  }

  getData() {
    this.componentService.getLoader().then(
      (loader) => {
        loader.present().then(
          () => {
            this.devices = [];
            this.db.collection('devices').doc(this.appService.getProfile().id).collection('device').get().then((res: any) => {
              if (res.docChanges().length > 0) {
                res.forEach((devices: any) => {
                  this.devices.push(devices.data());
                  this.dataLoaded = true;
                  loader.dismiss();
                });
              } else {
                this.dataLoaded = true;
                loader.dismiss();
              }
            }).catch((err: any) => {
              this.db.collection('errorLogs').doc(this.appService.getProfile().id).collection('error').add({
                collection: 'devices',
                error: JSON.stringify(err),
                created_at: new Date().toISOString(),
                created_by: this.appService.getProfile().id
              });
              loader.dismiss();
            });
          }
        )
      }
    );
  }

  ionViewDidEnter() {
    this.getData();
    this.initialization();
  }

  initialization() {
    this.bluetoothle.initialize().subscribe(
      (res: any) => {
        console.log(res);
        if (res.status === 'enabled') {
          // Checking for platform
          this.checkPlatform();
        } else {
          this.componentService.getToast('Bluetooth is not enabled.', 3000, 'top', 'danger').then(
            (toast) => {
              toast.present();
            }
          );
        }
      }, (err: any) => {
        console.log(err);
      }
    );
  }

  checkPlatform() {
    if (this.platform.is('android')) {
      // Checking if location is enabled or not
      this.bluetoothle.isLocationEnabled().then(
        (res: any) => {
          if (!res.isLocationEnabled) {
            // Requesting to enable location of mobile
            this.bluetoothle.requestLocation().then(
              (res: any) => {
                console.log(res);
                if (res.requestLocation) {
                  // If location enable then proceed further
                  this.locationEnabled();
                } else {
                  this.componentService.getToast('Location is not enabled.', 3000, 'top', 'danger').then(
                    (toast) => {
                      toast.present();
                    }
                  );
                }
              }
            );
          } else {
            // If location enable then proceed further
            this.locationEnabled();
          }
        }
      );
    }
  }

  locationEnabled() {
    this.bluetoothle.hasPermission().then(
      (res: any) => {
        if (!res.hasPermission) {
          // Requesting to get permission of location of mobile
          this.bluetoothle.requestPermission().then(
            (res: any) => {
              if (res.requestPermission) {
                // Start scanning
              } else {
                this.componentService.getToast('Location is not allowed.', 3000, 'top', 'danger').then(
                  (toast) => {
                    toast.present();
                  }
                );
              }
            }
          );
        }
      }
    );
  }

  ngOnInit() {
  }

}
