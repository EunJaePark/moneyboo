import firebase from 'firebase';

const firebaseConfig = {
  apiKey: 'AIzaSyC2DRUlQfy6_82ABoxb-J7rt1DRSbRi_mM',
  authDomain: 'moneyboo-project.firebaseapp.com',
  databaseURL: 'https://moneyboo-project.firebaseio.com',
  projectId: 'moneyboo-project',
  storageBucket: 'moneyboo-project.appspot.com',
  messagingSenderId: '681045800838',
  appId: '1:681045800838:web:60de03261337dfbd539e07',
  measurementId: 'G-QMRB1VXWCB',
};

// Vue.prototype.$isFirebaseAuth = false;

//firebase init
const firebaseApp = firebase.initializeApp(firebaseConfig);
export default firebaseApp;
