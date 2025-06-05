import crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const secret = process.env.SECRET_KEY! || 'e86f449a48e5f1cbedae6a6fc6c92902'; // 32 bytes
const iv = Buffer.from(process.env.IV!) || 'e86f449a48e5f1cb'; // 16 bytes

export const encrypt = (text: string) => {
 
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(secret), iv);

  let encrypted = cipher.update(text, 'utf-8', 'hex');

  encrypted += cipher.final('hex');

  return encrypted;
};

export const decrypt = (encrypted: string) => {
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secret), iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf-8');
  decrypted += decipher.final('utf-8');
  return decrypted;
};
