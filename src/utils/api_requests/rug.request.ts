import { apiResponse, httpRequest } from '../api.helpers'
import { ENV } from '../constants/env.constants'

export const rugRequests = {
  getTokenReport: async (mint_address: string) => {
    try {
      const url = `https://api.rugcheck.xyz/v1/tokens/${mint_address}/report`
      const res = await httpRequest().get(url, {
        headers: {
          Authorization: 'Bearer ' + ENV.RUGCHECKER_API_KEY,
        },
      })

      return apiResponse(true, 'Fetched rugged data', res.data)
    } catch (err: any) {
      console.log('Error fetching token report:', err?.response?.data)
      return apiResponse(
        false,
        err?.response?.data?.message || err?.message || 'Error occurred.',
        err
      )
    }
  },
}
