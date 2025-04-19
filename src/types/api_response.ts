export interface ApiResponseInterface<D = any> {
  data?: D
  status_code?: number
  message?: string
  error?: any
  success?: boolean
}
