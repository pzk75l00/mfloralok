// Script para migrar la colección 'movements' de un proyecto Firestore a otro
// Guarda los archivos de credenciales como serviceAccountSource.json y serviceAccountTarget.json en la raíz del proyecto

const admin = require('firebase-admin');
const fs = require('fs');

// Inicializa el proyecto de origen
const sourceServiceAccount = require('./src/firebase/serviceAccountSource.json');
const sourceApp = admin.initializeApp({
  credential: admin.credential.cert(sourceServiceAccount)
}, 'source');
const sourceDb = sourceApp.firestore();

// Inicializa el proyecto de destino
const targetServiceAccount = require('./src/firebase/serviceAccountTarget.json');
const targetApp = admin.initializeApp({
  credential: admin.credential.cert(targetServiceAccount)
}, 'target');
const targetDb = targetApp.firestore();

async function migrateCollection(collectionName) {
  const snapshot = await sourceDb.collection(collectionName).get();
  console.log(`Migrando ${snapshot.size} documentos de la colección '${collectionName}'...`);
  for (const doc of snapshot.docs) {
    await targetDb.collection(collectionName).doc(doc.id).set(doc.data());
    console.log(`Documento ${doc.id} migrado.`);
  }
  console.log(`¡Migración de '${collectionName}' completada!`);
}

async function findDuplicatesInCollection(collectionName, field) {
  const snapshot = await sourceDb.collection(collectionName).get();
  const valueMap = new Map();
  const duplicates = [];
  for (const doc of snapshot.docs) {
    const value = doc.get(field);
    if (valueMap.has(value)) {
      duplicates.push({ id: doc.id, value });
    } else {
      valueMap.set(value, doc.id);
    }
  }
  if (duplicates.length > 0) {
    console.log(`Duplicados encontrados en '${collectionName}' por el campo '${field}':`);
    duplicates.forEach(d => console.log(`ID: ${d.id}, Valor: ${d.value}`));
  } else {
    console.log(`No se encontraron duplicados en '${collectionName}' por el campo '${field}'.`);
  }
}

async function clearCollection(db, collectionName) {
  const snapshot = await db.collection(collectionName).get();
  const batchSize = 500;
  let deleted = 0;
  while (!snapshot.empty) {
    const batch = db.batch();
    snapshot.docs.slice(0, batchSize).forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    deleted += Math.min(batchSize, snapshot.docs.length);
    if (snapshot.docs.length <= batchSize) break;
  }
  console.log(`Colección '${collectionName}' borrada (${deleted} documentos).`);
}

async function migrateCollectionNoDuplicates(collectionName) {
  const sourceSnapshot = await sourceDb.collection(collectionName).get();
  const targetSnapshot = await targetDb.collection(collectionName).get();
  const targetIds = new Set(targetSnapshot.docs.map(doc => doc.id));
  let migrated = 0;
  for (const doc of sourceSnapshot.docs) {
    if (!targetIds.has(doc.id)) {
      await targetDb.collection(collectionName).doc(doc.id).set(doc.data());
      migrated++;
      console.log(`Documento ${doc.id} migrado.`);
    } else {
      console.log(`Documento ${doc.id} ya existe en destino, omitido.`);
    }
  }
  console.log(`¡Migración de '${collectionName}' completada! (${migrated} documentos nuevos)`);
}

async function migrateAll() {
  // Solo migra sin duplicados por ID, NO borra las colecciones
  await migrateCollectionNoDuplicates('movements');
  await migrateCollectionNoDuplicates('plants');
  await migrateCollectionNoDuplicates('sales');
}

migrateAll().catch(console.error);
