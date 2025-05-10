import { apiResponse, httpRequest } from '../api.helpers'

export const coinGeckoRequests = {
  getTopCoins: async (solOnly?: boolean) => {
    try {
      const url = 'https://api.coingecko.com/api/v3/coins/markets'

      const res = await httpRequest().get(url, {
        params: {
          vs_currency: 'usd',
          per_page: 10,
          ...(solOnly && { category: 'solana-ecosystem' }),
        },
        headers: {
          accept: 'application/json',
          'x-cg-demo-api-key': 'CG-eGZPNiJmUxVY3B2B8twLCunE',
        },
      })

      return apiResponse(true, 'Fetched coin market data', res.data)
    } catch (err: any) {
      console.log('Error fetching coin market data:', err?.response?.data)
      return apiResponse(
        false,
        err?.response?.data?.message || err?.message || 'Error occurred.',
        err
      )
    }
  },
}
