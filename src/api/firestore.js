import firebaseApp from './firebase';
// firestore Database
const db = firebaseApp.firestore();

// users Collection
function getUsersRef() {
  return db.collection('users');
}

// moneyboo Collection
function moneybooRef(curUid) {
  return getUsersRef()
    .doc(curUid)
    .collection('moneyboo');
}

export { db, getUsersRef, moneybooRef };
