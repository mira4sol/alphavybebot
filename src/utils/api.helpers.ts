import { ApiResponseInterface } from '@/types/api_response'
import axios, { AxiosRequestHeaders, type AxiosInstance } from 'axios'

export const apiResponse = <D = any>(
  success: boolean,
  message: string,
  data?: D
): ApiResponseInterface<D> => {
  return {
    success,
    message,
    data,
  }
}

export const httpRequest = (token?: string) => {
  // Here we set the base URL for all requests made to the api
  const api: AxiosInstance = axios.create({
    // baseURL: url,
  })

  // We set an interceptor for each request to
  // include Bearer token to the request if user is logged in
  api.interceptors.request.use(async (config) => {
    /**
     * If a there is a token present uncomment the comment and implement
     *
     */

    if (token) {
      config.headers = {
        Authorization: `Bearer ${token}`,
      } as AxiosRequestHeaders
    }

    return config
  })

  return api
}
