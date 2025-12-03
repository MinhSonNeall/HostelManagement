import {
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET,
} from '../config/cloudinary'

export interface CloudinaryResource {
  asset_id: string
  public_id: string
  secure_url: string
  format: string
  width: number
  height: number
  folder?: string
  created_at: string
  bytes: number
}

export interface CloudinaryListResponse {
  resources: CloudinaryResource[]
  next_cursor?: string
}

export interface CloudinaryUploadResponse {
  asset_id: string
  public_id: string
  secure_url: string
  url: string
  folder?: string
  original_filename?: string
}

const BASE_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/resources/image/upload`
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`

const getAuthHeader = () => {
  if (!CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error('Cloudinary API credentials are missing. Please check your environment variables.')
  }
  return 'Basic ' + btoa(`${CLOUDINARY_API_KEY}:${CLOUDINARY_API_SECRET}`)
}

const getCrypto = (): Crypto => {
  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    return window.crypto
  }
  if (typeof globalThis !== 'undefined') {
    const cryptoObj = (globalThis as typeof globalThis & { crypto?: Crypto }).crypto
    if (cryptoObj?.subtle) {
      return cryptoObj
    }
  }
  throw new Error('Web Crypto API is not available in this environment.')
}

const generateSignature = async (params: Record<string, string | number>) => {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&')

  const encoder = new TextEncoder()
  const data = encoder.encode(sortedParams + CLOUDINARY_API_SECRET)
  const hashBuffer = await getCrypto().subtle.digest('SHA-1', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

export const listCloudinaryImages = async (options: { nextCursor?: string; prefix?: string } = {}) => {
  const params = new URLSearchParams()
  params.append('max_results', '30')
  if (options.nextCursor) {
    params.append('next_cursor', options.nextCursor)
  }
  if (options.prefix) {
    params.append('prefix', options.prefix)
  }

  const response = await fetch(`${BASE_URL}?${params.toString()}`, {
    headers: {
      Authorization: getAuthHeader(),
    },
  })

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}))
    console.error('Cloudinary API error', errorPayload)
    throw new Error(errorPayload.error?.message || 'Không thể lấy danh sách ảnh từ Cloudinary')
  }

  return (await response.json()) as CloudinaryListResponse
}

export const uploadCloudinaryImage = async (
  file: File,
  options: { folder?: string } = {}
): Promise<CloudinaryUploadResponse> => {
  if (!CLOUDINARY_CLOUD_NAME) {
    throw new Error('Cloudinary cloud name is not configured.')
  }

  const formData = new FormData()
  formData.append('file', file)

  if (options.folder) {
    formData.append('folder', options.folder)
  }

  if (CLOUDINARY_UPLOAD_PRESET) {
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
  } else {
    if (!CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
      throw new Error('Cloudinary API credentials are missing.')
    }
    const timestamp = Math.floor(Date.now() / 1000)
    const signatureParams: Record<string, string | number> = { timestamp }
    if (options.folder) {
      signatureParams.folder = options.folder
    }
    const signature = await generateSignature(signatureParams)
    formData.append('timestamp', timestamp.toString())
    formData.append('api_key', CLOUDINARY_API_KEY)
    formData.append('signature', signature)
  }

  const response = await fetch(UPLOAD_URL, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}))
    throw new Error(errorPayload.error?.message || 'Không thể upload ảnh lên Cloudinary.')
  }

  return (await response.json()) as CloudinaryUploadResponse
}

