import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
  HeadBucketCommand
} from '@aws-sdk/client-s3'
import fs from 'node:fs'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'

export interface S3Config {
  s3Bucket: string
  s3Region: string
  s3AccessKeyId: string
  s3SecretAccessKey: string
  s3Endpoint?: string
}

export interface BackupFileInfo {
  name: string
  path: string
  size: number
  createdAt: string
}

class S3Service {
  private createS3Client(config: S3Config): S3Client {
    return new S3Client({
      region: config.s3Region,
      credentials: {
        accessKeyId: config.s3AccessKeyId,
        secretAccessKey: config.s3SecretAccessKey
      },
      ...(config.s3Endpoint && {
        endpoint: config.s3Endpoint,
        forcePathStyle: true
      })
    })
  }

  async checkConnection(config: S3Config): Promise<boolean> {
    try {
      const client = this.createS3Client(config)
      await client.send(new HeadBucketCommand({ Bucket: config.s3Bucket }))
      return true
    } catch {
      return false
    }
  }

  async upload(config: S3Config, localPath: string, key: string): Promise<void> {
    const client = this.createS3Client(config)
    const fileContent = fs.readFileSync(localPath)
    await client.send(
      new PutObjectCommand({
        Bucket: config.s3Bucket,
        Key: key,
        Body: fileContent
      })
    )
  }

  async download(config: S3Config, key: string, localPath: string): Promise<void> {
    const client = this.createS3Client(config)
    const response = await client.send(
      new GetObjectCommand({
        Bucket: config.s3Bucket,
        Key: key
      })
    )

    if (response.Body instanceof Readable) {
      const writeStream = fs.createWriteStream(localPath)
      await pipeline(response.Body, writeStream)
    } else if (response.Body) {
      const byteArray = await response.Body.transformToByteArray()
      fs.writeFileSync(localPath, Buffer.from(byteArray))
    }
  }

  async listFiles(config: S3Config): Promise<BackupFileInfo[]> {
    const client = this.createS3Client(config)
    const response = await client.send(
      new ListObjectsV2Command({
        Bucket: config.s3Bucket
      })
    )

    if (!response.Contents) {
      return []
    }

    return response.Contents.map((item) => ({
      name: item.Key?.split('/').pop() ?? '',
      path: item.Key ?? '',
      size: item.Size ?? 0,
      createdAt: item.LastModified?.toISOString() ?? ''
    }))
  }

  async deleteFile(config: S3Config, key: string): Promise<void> {
    const client = this.createS3Client(config)
    await client.send(
      new DeleteObjectCommand({
        Bucket: config.s3Bucket,
        Key: key
      })
    )
  }
}

export const s3Service = new S3Service()
