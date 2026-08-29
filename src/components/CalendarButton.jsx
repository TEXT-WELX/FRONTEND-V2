import  { Calendar } from 'lucide-react'
import { openCalendarSelector } from '../utils/calendar'

export default function CalendarButton({ event, className = '', size = 'sm' }) {
  const handleAddToCalendar = () => {
    openCalendarSelector(event)
  }

  const buttonClasses = `
    inline-flex items-center gap-1 bg-blue-100 text-blue-800 hover:bg-blue-200 
    rounded-lg transition-colors ${className} ${
      size === 'sm' ? 'px-2 py-1 text-xs' : 
      size === 'md' ? 'px-3 py-2 text-sm' : 
      'px-4 py-2 text-base'
    }
  `

  return (
    <button
      onClick={handleAddToCalendar}
      className={buttonClasses}
      title="Add to Calendar"
    >
      <Calendar className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
      {size !== 'sm' && 'Add to Calendar'}
    </button>
  )
}
 