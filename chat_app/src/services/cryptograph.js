import CryptoJS from 'crypto-js';

export const generateAES = () => {
    const key = CryptoJS.lib.WordArray.random(32); // 256 bits = 32 bytes
    console.log(key.toString(CryptoJS.enc.Base64))
    return key.toString(CryptoJS.enc.Base64); // Retorna a chave em Base64
};
export const encryptAES = (plainText, secretKey) =>{
    return CryptoJS.AES.encrypt(plainText, secretKey).toString();
}

export const decryptAES = (ciphertext, secretKey) =>{
    const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
}