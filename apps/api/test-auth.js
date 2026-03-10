const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

const app = initializeApp({
  apiKey: "AIzaSyBUAwmE2FssyDA9V8gFOx1mMPQ9CPf6khE",          // from your firebase config
  authDomain: "instagram-clone-6e0c4.firebaseapp.com",
  projectId: "instagram-clone-6e0c4",
});

const auth = getAuth(app);

async function getToken() {
  const { user } = await signInWithEmailAndPassword(
    auth,
    'chelsynew72@gmail.com',   // your test user email
    'Chelsy237'          // your test user password
  );
  const token = await user.getIdToken();
  console.log('TOKEN:', token);
}

getToken();