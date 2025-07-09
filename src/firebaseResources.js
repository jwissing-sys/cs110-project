import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyAx9n2llF2d8Z0Ge-xuBfc-_FbPcgSJuFY",
  authDomain: "cs110-project-116aa.firebaseapp.com",
  projectId: "cs110-project-116aa",
  storageBucket: "cs110-project-116aa.firebasestorage.app",
  messagingSenderId: "329992581506",
  appId: "1:329992581506:web:079702292749d905195f9b"
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const firestore = getFirestore(app)
