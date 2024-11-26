import { database } from "./firebaseConfig";
import { set, get, ref } from "./firebaseConfig";
import { openDB} from "idb"


const EXPIRATION_TIME = 1*1*60*1000;
const DB_NAME = "UserKeysDB";
const STORE_NAME = "keys";
// Função para criptografar dados usando a chave pública RSA

function base64ToArrayBuffer(base64) {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

 export async function getUserEncryptedKey(chatId, userId) {
    try {
        // Referência para a estrutura no banco de dados
        const keyRef = ref(database, `sdk/${chatId}/key/${userId}`);

        // Busca a chave criptografada para o usuário
        const snapshot = await get(keyRef);

        if (snapshot.exists()) {
            const encryptedKey = snapshot.val();
            console.log(`Chave criptografada do usuário ${userId}:`, encryptedKey);
            return encryptedKey;
        } else {
            console.warn(`Nenhuma chave encontrada para o usuário ${userId} no chat ${chatId}.`);
            return null;
        }
    } catch (error) {
        console.error('Erro ao buscar a chave criptografada:', error);
        throw error;
    }
}
export async function encryptRSA(publicKeyBase64, data) {
    try {
      const publicKeyBuffer = base64ToArrayBuffer(publicKeyBase64);

      // Importa a chave pública no formato correto
      const publicKey = await crypto.subtle.importKey(
        "spki",
        publicKeyBuffer,
        { name: "RSA-OAEP", hash: "SHA-256" },
        false, // A chave não precisa ser exportável
        ["encrypt"]
      );

      const encodedData = new TextEncoder().encode(data);
      const encryptedData = await crypto.subtle.encrypt(
        { name: "RSA-OAEP" },
        publicKey,
        encodedData
      );

      return arrayBufferToBase64(encryptedData);
    } catch (error) {
      console.error("Erro ao criptografar com RSA:", error);
      throw error;
    }
  }

  // Função para descriptografar dados usando a chave privada RSA
  export async function decryptRSA(privateKeyBase64, encryptedDataBase64) {
    try {
      const privateKeyBuffer = base64ToArrayBuffer(privateKeyBase64);

      // Importa a chave privada no formato correto
      const privateKey = await crypto.subtle.importKey(
        "pkcs8",
        privateKeyBuffer,
        { name: "RSA-OAEP", hash: "SHA-256" },
        false, // A chave não precisa ser exportável
        ["decrypt"]
      );

      const encryptedDataBuffer = base64ToArrayBuffer(encryptedDataBase64);
      const decryptedData = await crypto.subtle.decrypt(
        { name: "RSA-OAEP" },
        privateKey,
        encryptedDataBuffer
      );

      return new TextDecoder().decode(decryptedData);
    } catch (error) {
      console.error("Erro ao descriptografar com RSA:", error);
      throw error;
    }
  }

// Função para gerar par de chaves RSA
export async function generateRSAKeyPair() {
    const keyPair = await crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 2048, // Tamanho da chave em bits
        publicExponent: new Uint8Array([1, 0, 1]), // Exponent 65537
        hash: "SHA-256", // Algoritmo de hash
      },
      true, // A chave é exportável
      ["encrypt", "decrypt"]
    );

    const publicKey = await crypto.subtle.exportKey("spki", keyPair.publicKey);
    const privateKey = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

    return {
      publicKey: arrayBufferToBase64(publicKey),
      privateKey: arrayBufferToBase64(privateKey),
    };
  }

  // Função para converter ArrayBuffer para Base64
  function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    bytes.forEach(byte => (binary += String.fromCharCode(byte)));
    return window.btoa(binary); // Retorna a string em Base64
  }


  export async function getPrivateKey(userId) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('userKeysDB', 1);

      request.onsuccess = function (event) {
        const db = event.target.result;
        const transaction = db.transaction(['keys'], 'readonly');
        const store = transaction.objectStore('keys');

        // Buscar os dados usando o userId
        const getRequest = store.get(userId);

        getRequest.onsuccess = function () {
          const data = getRequest.result;
          if (data) {
            // Retorna apenas a chave privada
            resolve(data.key.private_key);
          } else {
            reject(`Chave privada não encontrada para o userId: ${userId}`);
          }
        };

        getRequest.onerror = function () {
          reject('Erro ao buscar chave privada no IndexedDB');
        };
      };

      request.onerror = function () {
        reject('Erro ao abrir o banco de dados IndexedDB');
      };
    });
  }


// Função para salvar a chave privada no IndexedDB
export async function savePrivateKeyToIndexedDB(userId, privateKeyBase64) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('userKeysDB', 1);

    // Criar a estrutura do banco IndexedDB
    request.onupgradeneeded = function (event) {
      const db = event.target.result;

      // Criar o Object Store com o `userId` como chave primária
      if (!db.objectStoreNames.contains('keys')) {
        db.createObjectStore('keys', { keyPath: 'userId' });
      }
    };

    request.onsuccess = function (event) {
      const db = event.target.result;
      const transaction = db.transaction(['keys'], 'readwrite');
      const store = transaction.objectStore('keys');

      // Estrutura de dados a ser armazenada
      const keyData = {
        userId: userId,
        key: {
          private_key: privateKeyBase64,
        },
        expirationTime: Date.now() + EXPIRATION_TIME, // Calcular o tempo de expiração
      };

      // Salvar os dados no IndexedDB
      const addRequest = store.put(keyData);

      addRequest.onsuccess = function () {
        console.log('Chave privada salva no IndexedDB com a nova estrutura.');
        resolve();
      };

      addRequest.onerror = function () {
        reject('Erro ao salvar chave privada no IndexedDB');
      };
    };

    request.onerror = function () {
      reject('Erro ao abrir o banco de dados IndexedDB');
    };
  });
}


// Função para salvar a chave pública no Firebase Realtime Database
export async function savePublicKeyToFirebase(userId, publicKeyBase64) {
  console.log(userId, publicKeyBase64)
  const dataRef = ref(database, `user/${userId}/public_key`);
  try {
    await set(dataRef, publicKeyBase64);
    console.log('Chave pública salva no Firebase Realtime Database:', publicKeyBase64);
  } catch (error) {
    console.error('Erro ao salvar chave pública no Firebase:', error);
    throw error;
  }
}

export async function getPulicKey(idUser) {
  const chatKeyRef = ref(database, `user/${idUser}/public_key`);
  const snapshot = await get(chatKeyRef);
  return snapshot.val();
}
