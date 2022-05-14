import { Component, OnInit } from '@angular/core';
import Chart from 'chart.js/auto';
import * as firebase from 'firebase';
import { AppService } from 'src/app/services/app.service';
import { ComponentService } from 'src/app/services/component.service';
import * as $ from 'jquery';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  dataLoaded = false;
  db = firebase.firestore();
  deviceData: any[] = [];
  oldDeviceData: any[] = [];
  selectedDate = '';

  constructor(
    public appService: AppService,
    private componentService: ComponentService
  ) { }

  getData(loader?: any) {
    let data = [];
    let labels = [];
    if (this.appService.getPairedDevice()) {
      this.db.collection('devicesData').doc(this.appService.getPairedDevice()).collection('deviceData').orderBy('time', 'asc').get().then((res: any) => {
        if (res.docChanges().length > 0) {
          res.forEach((devices: any) => {
            data.push(devices.data().temperature);
            labels.push(devices.data().time);
            this.deviceData.push(devices.data());
          });
          setTimeout(() => {
            this.dataLoaded = true;
            this.drawLiveChart(labels, data);
            loader.dismiss();
          }, 500);
        } else {
          this.dataLoaded = true;
          loader.dismiss();
        }
      }).catch((err: any) => {
        this.db.collection('errorLogs').doc(this.appService.getProfile().id).collection('error').add({
          collection: 'deviceData',
          error: JSON.stringify(err),
          created_at: new Date().toISOString(),
          created_by: this.appService.getProfile().id
        });
        loader.dismiss();
      });
    } else {
      this.dataLoaded = true;
      loader.dismiss();
    }
  }

  drawLiveChart(labels: any, data: any) {
    const ctx = 'live';
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Live Data Chart',
          data: data,
          fill: true,
          // borderColor: 'rgb(75, 192, 192)',
          backgroundColor: '#ffffb3',
          tension: 0.1
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              display: false
            }
          },
          x: {
            beginAtZero: true,
            grid: {
              display: false
            }
          }
        }
      }
    });
  }

  onDateChange(event: any) {
    this.selectedDate = event.detail.value;
    this.oldDeviceData = [];
    $('#old').remove();
    $('#oldGraphContainer').append('<canvas id="old" style="height: 150px;"></canvas>');
    $('#statistics').remove();
    $('#statisticsGraphContainer').append('<canvas id="statistics" style="height: 150px;"></canvas>');
    this.getOldData();
  }

  getOldData() {
    let data = [];
    let labels = [];
    let dataStatistics = [];
    let labelsStatistics = [];
    let previousDate = '';
    let count = 0;
    this.db.collection('devicesData').doc(this.appService.getPairedDevice()).collection('deviceData').where('created_at', '>=', this.selectedDate).orderBy('created_at', 'asc').get().then((res: any) => {
      if (res.docChanges().length > 0) {
        res.forEach((devices: any) => {
          labels.push(devices.data().time);
          data.push(devices.data().temperature);
          const date = this.appService.getDateFormat(devices.data().created_at);
          if (previousDate != date) {
            count = 0;
            count++;
            previousDate = date;
            labelsStatistics.push(this.appService.getDateFormat(devices.data().created_at));
          } else {
            count++;
          }
          this.oldDeviceData.push(devices.data());
        });
        setTimeout(() => {
          this.drawOldChart(labels, data);
          if (dataStatistics.length != labelsStatistics.length) {
            dataStatistics.push(count);
          }
          this.drawStatisticsChart(labelsStatistics, dataStatistics);
        }, 500);
      } else {
      }
    }).catch((err: any) => {
      this.db.collection('errorLogs').doc(this.appService.getProfile().id).collection('error').add({
        collection: 'deviceData',
        error: JSON.stringify(err),
        created_at: new Date().toISOString(),
        created_by: this.appService.getProfile().id
      });
    });
  }

  drawOldChart(labels: any, data: any) {
    const ctx = 'old';
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Old Data Chart',
          data: data,
          fill: true,
          // borderColor: 'rgb(75, 192, 192)',
          backgroundColor: '#99e6ff',
          tension: 0.1
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              display: false
            }
          },
          x: {
            beginAtZero: true,
            grid: {
              display: false
            }
          }
        }
      }
    });
  }

  drawStatisticsChart(labels: any, data: any) {
    const ctx = 'statistics';
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Statistics Data Chart',
          data: data,
          backgroundColor: [
            '#99e600',
            '#99e600',
            '#99e600',
            '#99e600',
            '#99e600',
            '#99e600'
          ],
          borderColor: [
            '#99e600',
            '#99e600',
            '#99e600',
            '#99e600',
            '#99e600',
            '#99e600'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              display: false
            }
          },
          x: {
            beginAtZero: true,
            grid: {
              display: false
            }
          }
        }
      }
    });
  }

  ionViewDidEnter() {
    $('#liveGraphContainer').append('<canvas id="live" style="height: 150px;"></canvas>');
    $('#oldGraphContainer').append('<canvas id="old" style="height: 150px;"></canvas>');
    $('#statisticsGraphContainer').append('<canvas id="statistics" style="height: 150px;"></canvas>');
    this.componentService.getLoader().then(
      (loader) => {
        loader.present().then(
          () => {
            this.getData(loader);
          }
        );
      }
    );
  }

  ionViewDidLeave() {
    $('#live').remove();
    $('#old').remove();
    $('#statistics').remove();
  }

  ionViewWillLeave() {
    $('#live').remove();
    $('#old').remove();
    $('#statistics').remove();
  }

  ngOnInit() {
  }

}