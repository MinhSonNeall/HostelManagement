const BASE_URL = 'https://provinces.open-api.vn/api'

export interface Province {
  code: number
  name: string
}

export interface District {
  code: number
  name: string
}

export interface Ward {
  code: number
  name: string
}

interface ProvinceResponse extends Province {
  districts?: District[]
}

interface DistrictResponse extends District {
  wards?: Ward[]
}

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new Error(payload?.message || 'Không thể tải dữ liệu địa lý.')
  }
  return (await response.json()) as T
}

export const locationApi = {
  async getProvinces(): Promise<Province[]> {
    const response = await fetch(`${BASE_URL}/p/?depth=1`)
    return handleResponse<Province[]>(response)
  },

  async getDistricts(provinceCode: number): Promise<District[]> {
    const response = await fetch(`${BASE_URL}/p/${provinceCode}?depth=2`)
    const data = await handleResponse<ProvinceResponse>(response)
    return data.districts ?? []
  },

  async getWards(districtCode: number): Promise<Ward[]> {
    const response = await fetch(`${BASE_URL}/d/${districtCode}?depth=2`)
    const data = await handleResponse<DistrictResponse>(response)
    return data.wards ?? []
  },
}


