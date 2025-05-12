import { registerAs } from '@nestjs/config'

export default registerAs('storage', () => {
  const endpoint = process.env.STORAGE_ENDPOINT
  const region = process.env.STORAGE_REGION || 'us-east-1' // Default to us-east-1 if not specified

  // Ensure the endpoint has the proper protocol
  const formattedEndpoint = endpoint?.startsWith('http') ? endpoint : `https://${endpoint}`

  return {
    endpoint: formattedEndpoint,
    accessKeyId: process.env.STORAGE_ACCESS_KEY_ID,
    secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY,
    bucketName: process.env.STORAGE_BUCKET_NAME,
    region: region,
  }
})
