import serverless from 'serverless-http'
import { app } from '../../server/app'

// Export the serverless handler for Netlify Functions (AWS Lambda)
// Configured with binary media types so multipart image uploads work seamlessly in serverless.
export const handler = serverless(app, {
  binary: [
    'image/*',
    'image/jpeg',
    'image/png',
    'image/webp',
    'multipart/form-data',
    'application/octet-stream',
  ],
})
