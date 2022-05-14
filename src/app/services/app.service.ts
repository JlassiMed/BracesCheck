import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  subject = new Subject<any>();

  constructor() { }

  sendMessage(message: string) {
    this.subject.next({ text: message });
  }

  getMessage(): Observable<any> {
    return this.subject.asObservable();
  }

  getDateTimeForPicker(date: any) {
    return new Date(date).toISOString();
  }

  searchFormatDate(date: any) {
    if (date) {
      const formatedDate = new Date(date).getDate().toString().padStart(2, '0') + '/' + new Date(date).getMonth().toString().padStart(2, '0') + '/' + new Date(date).getFullYear();
      return formatedDate;
    } else {
      return 'Select date of birth.'
    }
  }

  setProfile(data: any) {
    localStorage.setItem('token', data.refreshToken);
    localStorage.setItem('id', data.uid);
    localStorage.setItem('email', data.email);
    localStorage.setItem('name', data.displayName);
    localStorage.setItem('dateOfBirth', data.dateOfBirth);
    localStorage.setItem('gender', data.gender);
    localStorage.setItem('role', data.role);
  }

  getProfile() {
    let userProfile = {
      id: localStorage.getItem('id'),
      name: localStorage.getItem('name'),
      email: localStorage.getItem('email'),
      token: localStorage.getItem('token'),
      dateOfBirth: localStorage.getItem('dateOfBirth'),
      gender: localStorage.getItem('gender'),
      role: localStorage.getItem('role')
    };
    return userProfile;
  }

  checkExists(device: any, array: any) {
    let check = false;
    if (array.length != 0) {
      array.forEach((element: any) => {
        if (element.address == device.address) {
          check = true;
        }
      });
    } else {
      check = false;
    }
    return check;
  }

  spliceFunction(data: any, device: any) {
    data.forEach(function (item: any, index: any, object: any) {
      if (item.address == device.address) {
        object.splice(index, 1);
      }
    });
  }

  setPairedDevice(address: any) {
    localStorage.setItem('address', address);
  }

  getPairedDevice() {
    return localStorage.getItem('address');
  }

  setBatteryLevel(level: any) {
    localStorage.setItem('level', level);
  }

  getBatteryLevel() {
    const level = localStorage.getItem('level');
    return level ? level : 0;
  }

  setRSSI(rssi: any) {
    localStorage.setItem('rssi', rssi);
  }

  getRSSI() {
    const rssi = parseInt(localStorage.getItem('rssi'));
    return rssi ? Math.abs(rssi) : 0;
  }

  getDateFormat(date: any) {
    const formatedDate = new Date(date).getDate().toString().padStart(2, '0') + '/' + new Date(date).getMonth().toString().padStart(2, '0') + '/' + new Date(date).getFullYear();
    return formatedDate;
  }

  getDateTimeFormat(date: any) {
    const formatedDate = new Date(date).getDate().toString().padStart(2, '0') + '/' + new Date(date).getMonth().toString().padStart(2, '0') + '/' + new Date(date).getFullYear() + ' ' + new Date(date).getHours().toString().padStart(2, '0') + ':' + new Date(date).getMinutes().toString().padStart(2, '0');
    return formatedDate;
  }
}
