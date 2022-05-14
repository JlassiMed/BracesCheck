import { Component, NgZone, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import * as firebase from 'firebase';
import { AppService } from 'src/app/services/app.service';
import { ComponentService } from 'src/app/services/component.service';
import { ActivatedRoute } from '@angular/router';
import { BluetoothLE } from '@awesome-cordova-plugins/bluetooth-le/ngx';

@Component({
  selector: 'app-devices-listing',
  templateUrl: './devices-listing.page.html',
  styleUrls: ['./devices-listing.page.scss'],
})
export class DevicesListingPage implements OnInit {

  foundDevices: any[] = [];
  previousDevices: any[] = [];
  statusMessage: any;
  dataLoaded = false;
  scaning = true;
  refFirebaseDatabase: any;
  currentDate = new Date().toISOString();
  db = firebase.firestore();

  constructor(
    private ngZone: NgZone,
    private platform: Platform,
    private route: ActivatedRoute,
    public appService: AppService,
    public bluetoothle: BluetoothLE,
    private componentService: ComponentService
  ) {
    this.previousDevices = this.route.snapshot.queryParams.devices;
  }

  scanNow() {
    this.componentService.getLoader().then(
      (loader) => {
        loader.present().then(
          () => {
            this.startScan(loader);
          }
        );
      }
    );
  }

  startScan(loader?: any) {
    // Check if scanning in progress
    if (this.platform.is('android')) {
      const param = {
        'services': [],
        'allowDuplicates': true,
        'scanMode': this.bluetoothle.SCAN_MODE_LOW_LATENCY,
        'matchMode': this.bluetoothle.MATCH_MODE_AGGRESSIVE,
        'matchNum': this.bluetoothle.MATCH_NUM_MAX_ADVERTISEMENT,
        'callbackType': this.bluetoothle.CALLBACK_TYPE_ALL_MATCHES,
      };

      // Start scan
      this.bluetoothle.startScan(param).subscribe(
        (res: any) => {
          console.log(res);
          if (res.status == 'scanResult') {
            // Checking if the found device is allready exist in array
            const check = this.appService.checkExists(res, this.foundDevices);
            if (res.name) {
              if (check == false) {
                this.foundDevices.push(res);
              }
            }
          }
        }, (err: any) => {
          console.log(err);
        }
      );
    } else {
      // Start scan
      this.bluetoothle.startScan({}).subscribe(
        (res: any) => {
          console.log(res);
          if (res.status == 'scanResult') {
            // Checking if the found device is allready exist in array
            const check = this.appService.checkExists(res, this.foundDevices);
            if (res.name && res.advertisement.serviceUuids) {
              if (check == false) {
                this.foundDevices.push(res);
              }
            }
          }
        }, (err: any) => {
          console.log(err);
        }
      );
    }
    // Stop scanning after 7 seconds
    setTimeout(() => {
      this.bluetoothle.stopScan().then(
        (res: any) => {
          this.previousDevices.forEach((previousDevice: any) => {
            this.foundDevices.forEach((foundDevice: any, index: any) => {
              if (previousDevice.address == foundDevice.address) {
                this.foundDevices.splice(index, 1);
              }
            });
          });
          this.scaning = false;
          loader.dismiss();
        }
      );
    }, 7000);
  }

  showMessage(message: any, type: any) {
    this.ngZone.run(() => {
      this.componentService.getToast(message, 3000, 'top', type).then(
        (toast) => {
          toast.present();
        }
      );
    });
  }

  saveDevice(device: any) {
    this.componentService.getInputAlert('Save Device!', 'Enter email of patient.', 'Save').then(
      (alert) => {
        alert.present();
        alert.onDidDismiss().then(
          (res: any) => {
            this.db.collection('users').where('email', '==', res.data.values.email).get().then((resp: any) => {
              if (resp.docChanges().length > 0) {
                resp.forEach((data: any) => {
                  if (data.data().email == res.data.values.email) {
                    this.db.collection('devices').where('created_by', '==', this.appService.getProfile().id).get().then((resp: any) => {
                      if (resp.docChanges().length > 0) {
                        resp.forEach((data: any) => {
                          console.log(data.data());
                          if (data.data().email == res.data.values.email) {
                            this.componentService.getToast('Device is connected with other patient.', 2000, 'top', 'danger').then(
                              (toast) => {
                                toast.present();
                              }
                            );
                          } else {
                            this.db.collection('devices').doc(this.appService.getProfile().id).collection('device').add({
                              email: res.data.values.email,
                              name: device.name,
                              address: device.address,
                              created_by: device.created_by
                            }).catch((err: any) => {
                              this.db.collection('errorLogs').doc(this.appService.getProfile().id).collection('error').add({
                                collection: 'devices',
                                error: JSON.stringify(err),
                                created_at: new Date().toISOString(),
                                created_by: this.appService.getProfile().id
                              });
                            });
                          }
                        });
                      } else {
                        this.db.collection('devices').doc(this.appService.getProfile().id).collection('device').add({
                          email: res.data.values.email,
                          name: device.name,
                          address: device.address,
                          created_by: device.created_by
                        }).catch((err: any) => {
                          this.db.collection('errorLogs').doc(this.appService.getProfile().id).collection('error').add({
                            collection: 'devices',
                            error: JSON.stringify(err),
                            created_at: new Date().toISOString(),
                            created_by: this.appService.getProfile().id
                          });
                        });
                      }
                    });
                  } else {
                    this.componentService.getToast('User not found.', 2000, 'top', 'danger').then(
                      (toast) => {
                        toast.present();
                      }
                    );
                  }
                });
              } else {
                this.componentService.getToast('User not found.', 2000, 'top', 'danger').then(
                  (toast) => {
                    toast.present();
                  }
                );
              }
            }).catch((err: any) => {
              this.db.collection('errorLogs').doc(this.appService.getProfile().id).collection('error').add({
                collection: 'users',
                error: JSON.stringify(err),
                created_at: new Date().toISOString(),
                created_by: this.appService.getProfile().id
              });
            });
          }
        );
      }
    );
  }

  onDeviceClick(device: any) {
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
                  // Remove from the devices array
                  this.appService.spliceFunction(this.foundDevices, device);
                  // Reconnect the device
                  const deviceData = { 'created_by': this.appService.getProfile().id, 'name': device.name, 'address': device.address };
                  this.saveDevice(deviceData);
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
              }, (err) => {
                console.log(err);
                // If device not connected before
                if (err.error == 'neverConnected') {
                  // Remove from the devices array
                  this.appService.spliceFunction(this.foundDevices, device);
                  // Connect the device
                  const deviceData = { 'created_by': this.appService.getProfile().id, 'name': device.name, 'address': device.address };
                  this.saveDevice(deviceData);
                  this.connect(address, loader);
                }
              }
            ).catch((error) => {
              loader.dismiss();
              console.log(error);
            });
          }
        );
      }
    );
  }

  parseData(bytes: any) {

  }

  async getData(params: any) {
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
    //     const bytes = this.bluetoothle.encodedStringToBytes(data.value);
    //     this.parseData(bytes);
    //   }
    //   if (params.characteristic == '2A50') {
    //     const bytes = this.bluetoothle.encodedStringToBytes(data.value);
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
          if (element.uuid == '1801' || element.uuid == '1800' || element.uuid == '180A' || element.uuid == '180F') {
            element.characteristics.forEach((characteristic: any) => {
              const params = { 'address': address.address, 'service': element.uuid, 'characteristic': characteristic.uuid };
              this.getData(params);
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

  ionViewWillLeave() {
    this.appService.sendMessage('refresh');
  }

  ionViewDidEnter() {
    this.dataLoaded = false;
    this.platform.ready().then((readySource) => {
      console.log('Platform ready from', readySource);
      this.scanNow();
    });
  }

  ngOnInit() { }

}