import CryptoJS from 'crypto-js';

export const encryptAES = (plainText, secretKey) =>{
    return CryptoJS.AES.encrypt(plainText, secretKey).toString();
} 

export const decryptAES = (ciphertext, secretKey) =>{
    const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
}