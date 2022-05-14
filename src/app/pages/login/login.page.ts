import { Component, OnInit, ViewChild } from '@angular/core';
import { IonDatetime, NavController } from '@ionic/angular';
import { AppService } from 'src/app/services/app.service';
import { modalController } from '@ionic/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ComponentService } from 'src/app/services/component.service';
import * as firebase from 'firebase';
import { Plugins } from '@capacitor/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  type = 'login';
  selectedLanguage = 'en';
  @ViewChild('dateTime', { static: false }) datetime: IonDatetime;
  loginForm: FormGroup;
  loginFormSubmitted = false;
  registerForm: FormGroup;
  registerFormSubmitted = false;
  db = firebase.firestore();
  fbLogin: any;

  constructor(
    public appService: AppService,
    private navCtrl: NavController,
    private formBuilder: FormBuilder,
    private componentService: ComponentService
  ) {
    this.setupFbLogin();
  }

  async setupFbLogin() {
    // Use the native implementation inside a real app!
    const { FacebookLogin } = Plugins;
    this.fbLogin = FacebookLogin;
  }

  async onFacebookLoginClick() {
    const FACEBOOK_PERMISSIONS = ['email', 'user_birthday'];
    const result = await this.fbLogin.login({ permissions: FACEBOOK_PERMISSIONS });

    const loader = await this.componentService.getLoader();
    loader.present();

    if (result.accessToken && result.accessToken.userId) {
      const accessToken = result.accessToken;
      const credential = firebase.auth.FacebookAuthProvider.credential(accessToken.token);
      firebase.auth().signInWithCredential(credential).then(async (result: any) => {
        let data: any = [];
        const additionalUserInfo = result.additionalUserInfo;
        const user = result.user;
        const credential = result.credential;
        const accessToken = credential.accessToken;
        console.log(result);

        if (additionalUserInfo.isNewUser) {
          data.refreshToken = user.refreshToken;
          data.uid = user.uid;
          data.email = user.email;
          data.displayName = user.displayName;
          data.dateOfBirth = '';
          data.gender = '';
          data.role = 'patient';
          this.appService.setProfile(data);
          this.db.collection('users').doc(user.uid).set({
            userId: this.appService.getProfile().id,
            name: this.appService.getProfile().name,
            email: this.appService.getProfile().email,
            role: this.appService.getProfile().role,
            created_by: this.appService.getProfile().id,
            created_at: new Date().toISOString()
          }).catch((err: any) => {
            this.db.collection('errorLogs').doc(this.appService.getProfile().id).collection('error').add({
              collection: 'users',
              error: JSON.stringify(err),
              created_at: new Date().toISOString(),
              created_by: this.appService.getProfile().id
            });
            loader.dismiss();
          });
          firebase.auth().currentUser.sendEmailVerification().then(() => {
            this.componentService.getToast('Account created successfully verify from your email.', 3000, 'top', 'success').then(
              (toast: any) => {
                toast.present();
              }
            );
          }).catch((error: any) => {
            this.componentService.getToast(error.message, 3000, 'top', 'danger').then(
              (toast: any) => {
                toast.present();
              }
            );
          });
          if (this.appService.getProfile().role == 'patient') {
            this.navCtrl.navigateRoot('/tabs/request-appointment');
          } else {
            this.navCtrl.navigateRoot('/tabs/home');
          }
          loader.dismiss();
        } else {
          data.refreshToken = user.refreshToken;
          data.uid = user.uid;
          data.email = user.email;
          data.displayName = user.displayName;
          console.log('user');
          console.log(user);
          this.db.collection('users').where('created_by', '==', user.uid).get().then((res: any) => {
            if (res.docChanges().length > 0) {
              res.forEach((userData: any) => {
                data.dateOfBirth = userData.data().date_of_birth ? userData.data().date_of_birth : '';
                data.gender = userData.data().gender ? userData.data().gender : '';
                data.role = userData.data().role;
                this.appService.setProfile(data);
                this.db.collection('users').doc(user.uid).update({
                  userId: this.appService.getProfile().id,
                  name: this.appService.getProfile().name,
                  email: this.appService.getProfile().email,
                  created_by: this.appService.getProfile().id,
                  token_updated_at: new Date().toISOString()
                }).catch((err: any) => {
                  this.db.collection('errorLogs').doc(this.appService.getProfile().id).collection('error').add({
                    collection: 'users',
                    error: JSON.stringify(err),
                    created_at: new Date().toISOString(),
                    created_by: this.appService.getProfile().id
                  });
                  loader.dismiss();
                });
                if (this.appService.getProfile().role == 'patient') {
                  this.navCtrl.navigateRoot('/tabs/request-appointment');
                } else {
                  this.navCtrl.navigateRoot('/tabs/home');
                }
                this.componentService.getToast('Log in successfully.', 3000, 'top', 'success').then(
                  (toast: any) => {
                    toast.present();
                  }
                );
                loader.dismiss();
              });
            }
          }).catch((err: any) => {
            this.db.collection('errorLogs').doc(this.appService.getProfile().id).collection('error').add({
              collection: 'users',
              error: JSON.stringify(err),
              created_at: new Date().toISOString(),
              created_by: this.appService.getProfile().id
            });
            loader.dismiss();
          });
        }
      });
    } else if (result.accessToken && !result.accessToken.userId) {
      // Web only gets the token but not the user ID
      // Directly call get token to retrieve it now
      this.getCurrentToken(loader);
    } else {
      // Login failed
    }
  }

  async getCurrentToken(loader: any) {
    const result = await this.fbLogin.getCurrentAccessToken();

    if (result.accessToken) {
      const accessToken = result.accessToken;
      const credential = firebase.auth.FacebookAuthProvider.credential(accessToken);
      firebase.auth().signInWithCredential(credential).then(async (result: any) => {
        let data: any = [];
        const additionalUserInfo = result.additionalUserInfo;
        const user = result.user;
        const credential = result.credential;
        const accessToken = credential.accessToken;
        console.log(result);

        if (additionalUserInfo.isNewUser) {
          data.refreshToken = user.refreshToken;
          data.uid = user.uid;
          data.email = user.email;
          data.displayName = user.displayName;
          data.dateOfBirth = '';
          data.gender = '';
          data.role = 'patient';
          this.appService.setProfile(data);
          this.db.collection('users').doc(user.uid).set({
            userId: this.appService.getProfile().id,
            name: this.appService.getProfile().name,
            email: this.appService.getProfile().email,
            role: this.appService.getProfile().role,
            created_by: this.appService.getProfile().id,
            created_at: new Date().toISOString()
          }).catch((err: any) => {
            this.db.collection('errorLogs').doc(this.appService.getProfile().id).collection('error').add({
              collection: 'users',
              error: JSON.stringify(err),
              created_at: new Date().toISOString(),
              created_by: this.appService.getProfile().id
            });
            loader.dismiss();
          });
          firebase.auth().currentUser.sendEmailVerification().then(() => {
            this.componentService.getToast('Account created successfully verify from your email.', 3000, 'top', 'success').then(
              (toast: any) => {
                toast.present();
              }
            );
          }).catch((error: any) => {
            this.componentService.getToast(error.message, 3000, 'top', 'danger').then(
              (toast: any) => {
                toast.present();
              }
            );
          });
          if (this.appService.getProfile().role == 'patient') {
            this.navCtrl.navigateRoot('/tabs/request-appointment');
          } else {
            this.navCtrl.navigateRoot('/tabs/home');
          }
          loader.dismiss();
        } else {
          data.refreshToken = user.refreshToken;
          data.uid = user.uid;
          data.email = user.email;
          data.displayName = user.displayName;
          console.log('user');
          console.log(user);
          this.db.collection('users').where('created_by', '==', user.uid).get().then((res: any) => {
            if (res.docChanges().length > 0) {
              res.forEach((userData: any) => {
                data.dateOfBirth = userData.data().date_of_birth ? userData.data().date_of_birth : '';
                data.gender = userData.data().gender ? userData.data().gender : '';
                data.role = userData.data().role;
                this.appService.setProfile(data);
                this.db.collection('users').doc(user.uid).update({
                  userId: this.appService.getProfile().id,
                  name: this.appService.getProfile().name,
                  email: this.appService.getProfile().email,
                  created_by: this.appService.getProfile().id,
                  token_updated_at: new Date().toISOString()
                }).catch((err: any) => {
                  this.db.collection('errorLogs').doc(this.appService.getProfile().id).collection('error').add({
                    collection: 'users',
                    error: JSON.stringify(err),
                    created_at: new Date().toISOString(),
                    created_by: this.appService.getProfile().id
                  });
                  loader.dismiss();
                });
                if (this.appService.getProfile().role == 'patient') {
                  this.navCtrl.navigateRoot('/tabs/request-appointment');
                } else {
                  this.navCtrl.navigateRoot('/tabs/home');
                }
                this.componentService.getToast('Log in successfully.', 3000, 'top', 'success').then(
                  (toast: any) => {
                    toast.present();
                  }
                );
                loader.dismiss();
              });
            }
          }).catch((err: any) => {
            this.db.collection('errorLogs').doc(this.appService.getProfile().id).collection('error').add({
              collection: 'users',
              error: JSON.stringify(err),
              created_at: new Date().toISOString(),
              created_by: this.appService.getProfile().id
            });
            loader.dismiss();
          });
        }
      });
    } else {
      // Not logged in.
    }
  }

  async onGoogleLoginClick() {
    const googleUser = await Plugins.GoogleAuth.signIn(null) as any;
    console.log('my user: ', googleUser);

    const loader = await this.componentService.getLoader();
    loader.present();

    const token = googleUser.authentication ? googleUser.authentication.idToken : googleUser.idToken;

    const googleCredential = firebase.auth.GoogleAuthProvider.credential(token);

    firebase.auth().signInWithCredential(googleCredential).then(async (result: any) => {
      let data: any = [];
      const additionalUserInfo = result.additionalUserInfo;
      const user = result.user;
      const credential = result.credential;
      const accessToken = credential.accessToken;
      console.log(result);

      if (additionalUserInfo.isNewUser) {
        data.refreshToken = user.refreshToken;
        data.uid = user.uid;
        data.email = user.email;
        data.displayName = user.displayName;
        data.dateOfBirth = '';
        data.gender = '';
        data.role = 'patient';
        this.appService.setProfile(data);
        this.db.collection('users').doc(user.uid).set({
          userId: this.appService.getProfile().id,
          name: this.appService.getProfile().name,
          email: this.appService.getProfile().email,
          role: this.appService.getProfile().role,
          created_by: this.appService.getProfile().id,
          created_at: new Date().toISOString()
        }).catch((err: any) => {
          this.db.collection('errorLogs').doc(this.appService.getProfile().id).collection('error').add({
            collection: 'users',
            error: JSON.stringify(err),
            created_at: new Date().toISOString(),
            created_by: this.appService.getProfile().id
          });
          loader.dismiss();
        });
        firebase.auth().currentUser.sendEmailVerification().then(() => {
          this.componentService.getToast('Account created successfully verify from your email.', 3000, 'top', 'success').then(
            (toast: any) => {
              toast.present();
            }
          );
        }).catch((error: any) => {
          this.componentService.getToast(error.message, 3000, 'top', 'danger').then(
            (toast: any) => {
              toast.present();
            }
          );
        });
        if (this.appService.getProfile().role == 'patient') {
          this.navCtrl.navigateRoot('/tabs/request-appointment');
        } else {
          this.navCtrl.navigateRoot('/tabs/home');
        }
        loader.dismiss();
      } else {
        data.refreshToken = user.refreshToken;
        data.uid = user.uid;
        data.email = user.email;
        data.displayName = user.displayName;
        console.log('user');
        console.log(user);
        this.db.collection('users').where('created_by', '==', user.uid).get().then((res: any) => {
          if (res.docChanges().length > 0) {
            res.forEach((userData: any) => {
              data.dateOfBirth = userData.data().date_of_birth ? userData.data().date_of_birth : '';
              data.gender = userData.data().gender ? userData.data().gender : '';
              data.role = userData.data().role;
              this.appService.setProfile(data);
              this.db.collection('users').doc(user.uid).update({
                userId: this.appService.getProfile().id,
                name: this.appService.getProfile().name,
                email: this.appService.getProfile().email,
                created_by: this.appService.getProfile().id,
                token_updated_at: new Date().toISOString()
              }).catch((err: any) => {
                this.db.collection('errorLogs').doc(this.appService.getProfile().id).collection('error').add({
                  collection: 'users',
                  error: JSON.stringify(err),
                  created_at: new Date().toISOString(),
                  created_by: this.appService.getProfile().id
                });
                loader.dismiss();
              });
              if (this.appService.getProfile().role == 'patient') {
                this.navCtrl.navigateRoot('/tabs/request-appointment');
              } else {
                this.navCtrl.navigateRoot('/tabs/home');
              }
              this.componentService.getToast('Log in successfully.', 3000, 'top', 'success').then(
                (toast: any) => {
                  toast.present();
                }
              );
              loader.dismiss();
            });
          }
        }).catch((err: any) => {
          this.db.collection('errorLogs').doc(this.appService.getProfile().id).collection('error').add({
            collection: 'users',
            error: JSON.stringify(err),
            created_at: new Date().toISOString(),
            created_by: this.appService.getProfile().id
          });
          loader.dismiss();
        });
      }
    });
  }

  dateChanged() {
    this.registerForm.value.dateOfBirth = new Date(this.datetime.value);
  }

  confirm() {
    this.datetime.confirm();
    modalController.dismiss();
  }

  cancel() {
    this.datetime.cancel();
    modalController.dismiss();
  }

  onLoginClick() {
    this.loginFormSubmitted = true;
    let data: any = [];
    if (this.loginForm.valid) {
      this.componentService.getLoader().then(
        (loader) => {
          loader.present().then(
            () => {
              firebase.auth().signInWithEmailAndPassword(this.loginForm.value.email, this.loginForm.value.password).then(
                (result: any) => {
                  const additionalUserInfo = result.additionalUserInfo;
                  const user = result.user;
                  this.db.collection('users').where('created_by', '==', user.uid).get().then((res: any) => {
                    if (res.docChanges().length > 0) {
                      res.forEach((doc: any) => {
                        data.refreshToken = user.refreshToken;
                        data.uid = user.uid;
                        data.email = doc.data().email;
                        data.displayName = doc.data().name;
                        data.dateOfBirth = doc.data().date_of_birth;
                        data.gender = doc.data().gender;
                        data.role = doc.data().role;
                        this.appService.setProfile(data);
                        this.db.collection('users').doc(user.uid).update({
                          token_updated_at: new Date().toISOString(),
                        }).catch((err: any) => {
                          this.db.collection('errorLogs').doc(this.appService.getProfile().id).collection('error').add({
                            collection: 'users',
                            error: JSON.stringify(err),
                            created_at: new Date().toISOString(),
                            created_by: this.appService.getProfile().id
                          });
                          loader.dismiss();
                        });
                        this.componentService.getToast('Log in successfully.', 3000, 'top', 'success').then(
                          (toast: any) => {
                            toast.present();
                          }
                        );
                        if (this.appService.getProfile().role == 'patient') {
                          this.navCtrl.navigateRoot('/tabs/request-appointment');
                        } else {
                          this.navCtrl.navigateRoot('/tabs/home');
                        }
                        loader.dismiss();
                      });
                    } else {
                      loader.dismiss();
                    }
                  }).catch((err: any) => {
                    this.db.collection('errorLogs').doc(this.appService.getProfile().id).collection('error').add({
                      collection: 'users',
                      error: JSON.stringify(err),
                      created_at: new Date().toISOString(),
                      created_by: this.appService.getProfile().id
                    });
                    loader.dismiss();
                  });
                }
              ).catch((error: any) => {
                this.componentService.getToast(error.message, 3000, 'top', 'danger').then(
                  (toast: any) => {
                    toast.present();
                  }
                );
                loader.dismiss();
              });
            }
          );
        }
      );
    }
  }

  onRegisterClick() {
    this.registerFormSubmitted = true;
    if (this.registerForm.valid && this.matchPassword()) {
      this.componentService.getLoader().then(
        (loader: any) => {
          loader.present().then(
            () => {
              firebase.auth().createUserWithEmailAndPassword(this.registerForm.value.email, this.registerForm.value.password).then(
                (result: any) => {
                  const additionalUserInfo = result.additionalUserInfo;
                  let user: any = [];
                  user.uid = result.user.uid;
                  user.refreshToken = result.user.refreshToken;
                  user.email = this.registerForm.value.email;
                  user.displayName = this.registerForm.value.name;
                  user.dateOfBirth = this.registerForm.value.dateOfBirth;
                  user.gender = this.registerForm.value.gender;
                  user.role = this.registerForm.value.role;
                  this.appService.setProfile(user);
                  this.db.collection('users').doc(user.uid).set({
                    userId: this.appService.getProfile().id,
                    name: this.registerForm.value.name,
                    email: this.appService.getProfile().email,
                    date_of_birth: this.registerForm.value.dateOfBirth,
                    gender: this.registerForm.value.gender,
                    role: this.registerForm.value.role,
                    created_by: this.appService.getProfile().id,
                    created_at: new Date().toISOString()
                  }).catch((err: any) => {
                    this.db.collection('errorLogs').doc(this.appService.getProfile().id).collection('error').add({
                      collection: 'users',
                      error: JSON.stringify(err),
                      created_at: new Date().toISOString(),
                      created_by: this.appService.getProfile().id
                    });
                    loader.dismiss();
                  });
                  firebase.auth().currentUser.sendEmailVerification().then(() => {
                    this.componentService.getToast('Account created successfully verify from your email.', 3000, 'top', 'success').then(
                      (toast: any) => {
                        toast.present();
                      }
                    );
                  }).catch((error: any) => {
                    this.componentService.getToast(error.message, 3000, 'top', 'danger').then(
                      (toast: any) => {
                        toast.present();
                      }
                    );
                  });
                  if (this.appService.getProfile().role == 'patient') {
                    this.navCtrl.navigateRoot('/tabs/request-appointment');
                  } else {
                    this.navCtrl.navigateRoot('/tabs/home');
                  }
                  loader.dismiss();
                }
              ).catch((error: any) => {
                this.componentService.getToast(error.message, 3000, 'top', 'danger').then(
                  (toast: any) => {
                    toast.present();
                  }
                );
                loader.dismiss();
              });
            }
          );
        }
      );
    }
  }

  onRegisterNowClick(type: any) {
    this.type = type;
    this.loginFormSubmitted = false;
    this.register();
  }

  onLoginNowClick(type: any) {
    this.type = type;
    this.registerFormSubmitted = false;
    this.login();
  }

  login() {
    this.loginForm = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  matchPassword() {
    const password = this.registerForm.value.password;
    const confirm = this.registerForm.value.confirmPassword;
    if (password != confirm) { return false }
    return true
  }

  register() {
    this.registerForm = this.formBuilder.group({
      email: ['', Validators.required],
      name: ['', Validators.required],
      dateOfBirth: [this.appService.getDateTimeForPicker(new Date()), Validators.required],
      gender: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      role: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.login();
  }

}
