import  { Globe } from 'lucide-react'
import { useCurrency } from '../contexts/CurrencyContext'

export default function CurrencySelector() {
  const { currency, setCurrency, currencies } = useCurrency()

  return (
    <div className="relative">
      <div className="flex items-center">
        <Globe className="w-4 h-4 text-gray-600 mr-1" />
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {currencies.map(curr => (
            <option key={curr} value={curr}>{curr}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
 