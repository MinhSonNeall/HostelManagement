const DEFAULT_CLOUD_NAME = 'dpl00ewrc'
const DEFAULT_API_KEY = '781644669332584'
const DEFAULT_API_SECRET = 'H7wUbKqncEtaDBN-ujEi9oEHuTQ'

export const CLOUDINARY_CLOUD_NAME =
  (import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined) || DEFAULT_CLOUD_NAME
export const CLOUDINARY_API_KEY =
  (import.meta.env.VITE_CLOUDINARY_API_KEY as string | undefined) || DEFAULT_API_KEY
export const CLOUDINARY_API_SECRET =
  (import.meta.env.VITE_CLOUDINARY_API_SECRET as string | undefined) || DEFAULT_API_SECRET
export const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined

if (!CLOUDINARY_CLOUD_NAME) {
  console.warn('Missing VITE_CLOUDINARY_CLOUD_NAME environment variable')
}

if (!CLOUDINARY_API_KEY) {
  console.warn('Missing VITE_CLOUDINARY_API_KEY environment variable')
}

if (!CLOUDINARY_API_SECRET) {
  console.warn('Missing VITE_CLOUDINARY_API_SECRET environment variable')
}

if (!CLOUDINARY_UPLOAD_PRESET) {
  console.warn('Missing VITE_CLOUDINARY_UPLOAD_PRESET environment variable - signed uploads will be used.')
}

