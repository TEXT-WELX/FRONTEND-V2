import  { createContext, useContext, useState } from 'react'

const CurrencyContext = createContext()

export const useCurrency = () => {
  const context = useContext(CurrencyContext)
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
}

const exchangeRates = {
  USD: 1,
  EUR: 0.85,
  AED: 3.67,
  INR: 83.12,
  GBP: 0.73,
  JPY: 110.5,
  CAD: 1.25,
  AUD: 1.35
}

const currencySymbols = {
  USD: '$',
  EUR: '€',
  AED: 'د.إ',
  INR: '₹',
  GBP: '£',
  JPY: '¥',
  CAD: 'C$',
  AUD: 'A$'
}

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState('USD')

  const convertPrice = (priceInUSD) => {
    return Math.round(priceInUSD * exchangeRates[currency])
  }

  const formatPrice = (priceInUSD) => {
    const convertedPrice = convertPrice(priceInUSD)
    const symbol = currencySymbols[currency]
    return `${symbol}${convertedPrice}`
  }

  return (
    <CurrencyContext.Provider value={{
      currency,
      setCurrency,
      convertPrice,
      formatPrice,
      currencies: Object.keys(exchangeRates),
      currencySymbols
    }}>
      {children}
    </CurrencyContext.Provider>
  )
}
 