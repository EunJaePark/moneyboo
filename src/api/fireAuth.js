import firebaseApp from './firebase';

// firebase Authentication
const auth = firebaseApp.auth();

// login
function loginUser(email, password) {
  return auth.signInWithEmailAndPassword(email, password);
}

// signup
function signupUser(email, password) {
  return auth.createUserWithEmailAndPassword(email, password);
}

// user profile update
function userProfileUpdate(data, nickname) {
  return data.user.updateProfile({
    displayName: nickname,
  });
}

export { auth, loginUser, signupUser, userProfileUpdate };
