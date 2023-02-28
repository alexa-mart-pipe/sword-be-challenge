import crypto from 'crypto';

const algorithm = 'aes-256-cbc'; //Using AES encryption
const key = process.env.ENCRYPTION_KEY ?? '';
const iv = process.env.ENCRYPTION_IV ?? '';

export function encrypt(data: string) {
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);

  let encrypted = cipher.update(data);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return encrypted.toString('hex');
}

export function decrypt(encryptedData: string) {
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);

  const encryptedDataBuffer = Buffer.from(encryptedData, 'hex');

  let decrypted = decipher.update(encryptedDataBuffer);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
}
