import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

// Servicio para manejo de usuarios
const auth = getAuth();

// Registrar usuario (modo DIOS puede crear cualquier usuario)
export async function registerUser({ email, password, nombre, apellido, telefono, modules = ["basico"], rol = "usuario", uid = null }) {
  // Si uid está presente, es un usuario creado por el admin (modo DIOS)
  let userCredential;
  if (!uid) {
    userCredential = await createUserWithEmailAndPassword(auth, email, password);
    uid = userCredential.user.uid;
  }
  // Guardar datos en Firestore
  await setDoc(doc(db, 'users', uid), {
    uid,
    email,
    nombre,
    apellido,
    telefono,
    rol,
    modules,
    creado: new Date().toISOString()
  });
  return uid;
}

// Login de usuario
export async function loginUser(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

// Obtener datos de usuario
export async function getUserData(uid) {
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (userDoc.exists()) {
    return userDoc.data();
  }
  return null;
}

// Verificar si el usuario es admin
export async function isAdmin(uid) {
  const user = await getUserData(uid);
  return user && user.rol === 'admin';
}
