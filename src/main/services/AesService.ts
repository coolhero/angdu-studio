import crypto from 'node:crypto'

class AesService {
  encrypt(text: string, secretKey: string, iv: string): string {
    const key = crypto.scryptSync(secretKey, 'salt', 32)
    const ivBuffer = Buffer.from(iv, 'hex')
    const cipher = crypto.createCipheriv('aes-256-cbc', key, ivBuffer)
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    return encrypted
  }

  decrypt(encryptedData: string, secretKey: string, iv: string): string {
    const key = crypto.scryptSync(secretKey, 'salt', 32)
    const ivBuffer = Buffer.from(iv, 'hex')
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, ivBuffer)
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  }
}

export const aesService = new AesService()
