import { ref, get, set } from "firebase/database";
import { generateRSAKeyPair, getPrivateKey, encryptRSA, decryptRSA, getPulicKey } from "./crypto-utils"; // Funções fictícias
import { openDB } from "idb";
import { database } from "./firebaseConfig";
import { generateAES, encryptAES, decryptAES } from "./cryptograph";
import { savePrivateKeyToIndexedDB, savePublicKeyToFirebase } from "./crypto-utils";

const DB_NAME = "UserKeysDB";
const STORE_NAME = "keys";
const EXPIRATION_TIME = 60 * 1000; // Exemplo: 1 dia em ms

async function verifyKeyUsed(chatId) {
    const data = ref(database, `sdk/${chatId}/key/used`);
    const snapshot = await get(data);
    return snapshot.val();
}

// Verifica se a chave de um usuário expirou
export async function verifyExpiration(userId) {
    try {
        const db = await openDB("userKeysDB", 1);
        const privateKeyEntry = await db.get("keys", userId);

        if (!privateKeyEntry) {
            throw new Error("Chave privada não encontrada para o userId fornecido.");
        }

        const isExpired = privateKeyEntry.expirationTime < Date.now();
        return isExpired;
    } catch (error) {
        console.error("Erro ao verificar expiração:", error);
        throw error;
    }
}

// Atualiza as chaves de um chat específico para um usuário
// Atualiza as chaves de um chat específico para um usuário
async function updateChatKeys(chatId, userId, oldPrivateKey, newPublicKey) {
    const chatKeyRef = ref(database, `sdk/${chatId}/key`);
    const chatKeySnapshot = await get(chatKeyRef);
    const chatKeys = chatKeySnapshot.val() || {};

    if(newPublicKey == null){
        return;
    }
    if (chatKeys[userId]) {
        console.log(oldPrivateKey, chatKeys[userId])
        const decryptedAESKey = await decryptRSA(oldPrivateKey, chatKeys[userId]);
        console.log("b")
        const reEncryptedAESKey = await encryptRSA(newPublicKey, decryptedAESKey);
        console.log("b")
        chatKeys[userId] = reEncryptedAESKey;

        await set(chatKeyRef, chatKeys);
    }
}

// Roda as chaves de um chat específico
async function rotateChatKey(chatId, userId, oldPrivateKey, newPublicKey) {
    const keyRef = ref(database, `sdk/${chatId}/key`);
    const keySnapshot = await get(keyRef);
    const currentKeyData = keySnapshot.val() || {};

    const currentExpiration = currentKeyData.expirationTimestamp || 0;
    let oldVersionKeyRef = ref(database, `sdk/${chatId}/versions`);
    const snapshot = await get(oldVersionKeyRef);
    const oldVersions = snapshot.val();

    if (oldVersions && newPublicKey != null) {
        for (const [version, keys] of Object.entries(oldVersions)) {
            if (keys[userId]) {
                // Recupera a chave antiga criptografada
                const oldEncryptedKey = keys[userId];

                // Decripta a chave AES com a chave privada antiga
                const decryptedAESKey = await decryptRSA(oldPrivateKey, oldEncryptedKey);
                console.log(decryptedAESKey)
                // Recripta a chave AES com a nova chave pública

                const reEncryptedKey = await encryptRSA(newPublicKey, decryptedAESKey);


                // Atualiza a versão antiga com a nova chave criptografada
                keys[userId] = reEncryptedKey;
                oldVersionKeyRef = ref(database, `sdk/${chatId}/versions/${version}`);
                // Salva a versão atualizada no banco
                await set(oldVersionKeyRef, keys);
            }
        }
    }
    // Gera nova chave AES caso tenha expirado
    console.log("Tempo de expiração da chave: ", currentExpiration);
    console.log("Tempo atual: ", Date.now());
    if (currentExpiration < Date.now()) {
        const newAESKey = generateAES(); // Gera nova chave AES em Base64

        // Verifica se a chave foi usada
        if (await verifyKeyUsed(chatId)) {
            const version = currentKeyData.version || 1;
            const keyVersionRef = ref(database, `sdk/${chatId}/versions/${version}/`);
            const savedKeyData = {};
            for (const idUser in currentKeyData) {
                if (idUser !== "expirationTimestamp" && idUser !== "version" && idUser != "used") {
                    // Se for o usuário atual e ele trocou as chaves RSA
                    if (idUser === userId && newPublicKey) {
                        console.log(oldPrivateKey)
                        console.log(currentKeyData[idUser])
                        const decryptedAESKey = await decryptRSA(oldPrivateKey, currentKeyData[idUser]);
                        const reEncryptedKey = await encryptRSA(newPublicKey, decryptedAESKey);
                        savedKeyData[idUser] = reEncryptedKey;
                    } else {
                        savedKeyData[idUser] = currentKeyData[idUser];
                    }
                }
            }

            await set(keyVersionRef, savedKeyData); // Salva a versão atual no caminho correto
        }

        const newChatKeys = {};
        for (const idUser in currentKeyData) {
            if (idUser !== "expirationTimestamp" && idUser !== "version" && idUser !== "used") {
                console.log(newAESKey)
                const userKeyRef = ref(database, `user/${idUser}/public_key`);
                const userKeySnapshot = await get(userKeyRef);
                const userPublicKey = userKeySnapshot.val();
                const newEncryptedKey = await encryptRSA(userPublicKey, newAESKey);
                newChatKeys[idUser] = newEncryptedKey;
            }
        }

        // Atualiza a chave principal do chat
        await set(keyRef, {
            ...newChatKeys,
            version: (currentKeyData.version || 0) + 1,
            expirationTimestamp: Date.now() + EXPIRATION_TIME,
        });
    }
    else{
        const chatKeyRef = ref(database, `sdk/${chatId}/key`);
        const chatKeySnapshot = await get(chatKeyRef);
        const chatKeys = chatKeySnapshot.val() || {};

        if(newPublicKey == null){
            return;
        }
        if (chatKeys[userId]) {
            console.log(oldPrivateKey, chatKeys[userId])
            const decryptedAESKey = await decryptRSA(oldPrivateKey, chatKeys[userId]);
            console.log("b")
            const reEncryptedAESKey = await encryptRSA(newPublicKey, decryptedAESKey);
            console.log("b")
            chatKeys[userId] = reEncryptedAESKey;

            await set(chatKeyRef, chatKeys);
        }
    }
}


// Gera novas chaves ou atualiza as existentes
export async function rotationChat(userId) {
    const expired = await verifyExpiration(userId);
    console.log("Chaves RSA expiradas: ", expired);
    let newPublicKey;
    let newPrivateKey;
    let oldPrivateKey = await getPrivateKey(userId);
    let oldPublicKey = await getPulicKey(userId);
    console.log(oldPrivateKey)
    console.log(oldPublicKey)
    if(expired){

        const keyPair = await generateRSAKeyPair();
        console.log(keyPair)
        newPublicKey = keyPair.publicKey
        newPrivateKey  = keyPair.privateKey
        console.log(newPublicKey)
        console.log(newPrivateKey)
        console.log("Persistindo novas chaves...");
        console.log(userId)
        await savePrivateKeyToIndexedDB(userId, newPrivateKey);
        await savePublicKeyToFirebase(userId, newPublicKey);
        console.log("Chaves atualizadas e persistidas.");
    }

    // const { publicKey: newPublicKey , privateKey: oldPrivateKey} = expired
    //     ? await generateRSAKeyPair()
    //     : { publicKey: null, privateKey: await getPrivateKey(userId) };

    const chatsRef = ref(database, "/chats/");
    const snapshot = await get(chatsRef);
    const chatsData = snapshot.val();

    if (chatsData) {
        await Promise.all(
            Object.keys(chatsData).map(async (chatId) => {
                const chat = chatsData[chatId];
                if (chat.idUsers.includes(userId)) {
                    if(expired){
                        // await updateChatKeys(chatId, userId, oldPrivateKey, newPublicKey);
                        await rotateChatKey(chatId, userId, oldPrivateKey, newPublicKey);
                    }
                    else{
                        // await updateChatKeys(chatId, userId, oldPrivateKey, oldPublicKey);
                        await rotateChatKey(chatId, userId, oldPrivateKey, oldPublicKey);
                    }

                }
            })
        );
        console.log("Rotação concluída.");
    } else {
        console.log("Nenhum chat encontrado.");
    }
}
