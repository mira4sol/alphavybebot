import { apiResponse, httpRequest } from '../api.helpers'

export const rugRequests = {
  getTokenReport: async (mint_address: string) => {
    try {
      const url = `https://api.rugcheck.xyz/v1/tokens/${mint_address}/report`
      const res = await httpRequest().get(url, {
        headers: {
          Authorization:
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NDU4NDgxMTQsImlkIjoiR2dpRGNENENyWm8yejdxa0JrNk5vWFM1TkxkaGVuNlQxVTlpaGJ1TVJBWEwifQ.mUf73U1nWztKjlxKGXR3HHzqc99Q2UnIfpoOiI2DWMo',
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
