import axios from 'axios';

const BASE_URL = 'https://api.frankfurter.app';

const FALLBACK_RATES = {
  INR: 83.50,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.20,
  USD: 1.0,
};

export const fetchExchangeRates = async (baseCurrency = 'USD') => {
  try {
    const response = await axios.get(`${BASE_URL}/latest`, {
      params: { from: baseCurrency },
      timeout: 6000,
    });
    return {
      success: true,
      rates: response.data.rates,
      base: response.data.base,
      date: response.data.date,
      isLive: true,
    };
  } catch (error) {

    return {
      success: true,
      rates: FALLBACK_RATES,
      base: 'USD',
      date: 'Offline (approx.)',
      isLive: false,
    };
  }
};

export const convertAmount = (amount, from, to, rates) => {
  if (from === to) return amount;
  if (!rates || !rates[to]) return null;
  return amount * rates[to];
};
