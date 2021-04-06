import firebase from 'firebase/app'
require('firebase/auth')
require('firebase/database')
// firebase config can be found in your firebase project
const firebaseConfig = {
  apiKey: 'AIzaSyBfQLROCJiSRrM892NvqCrNU-Y5ToPmRy0',
  authDomain: 'learning-flow-space.firebaseapp.com',
  databaseURL: 'https://learning-flow-space-default-rtdb.firebaseio.com',
  projectId: 'learning-flow-space',
  storageBucket: 'learning-flow-space.appspot.com',
  messagingSenderId: '348219017167',
  appId: '1:348219017167:web:3b93716d272395aa55b4ba',
  measurementId: 'G-FPTDG5HZG4'
}

firebase.initializeApp(firebaseConfig)
if (process.env.NODE_ENV !== 'production') {
  firebase.auth().useEmulator('http://localhost:9099')
  firebase
    .auth()
    .signInWithCredential(
      firebase.auth.EmailAuthProvider.credential('john@doe.com', '123123')
    )
}

export default firebase
