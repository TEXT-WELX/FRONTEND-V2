export  const addToCalendar = (event) => {
  const { title, date, description = '', location = '' } = event
  
  // Format date for calendar (YYYYMMDDTHHMMSS)
  const startDate = new Date(date)
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000) // 1 hour duration
  
  const formatDate = (date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }
  
  const startFormatted = formatDate(startDate)
  const endFormatted = formatDate(endDate)
  
  // Create calendar URLs
  const calendarUrls = {
    google: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startFormatted}/${endFormatted}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}`,
    outlook: `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(title)}&startdt=${startFormatted}&enddt=${endFormatted}&body=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}`,
    yahoo: `https://calendar.yahoo.com/?v=60&view=d&type=20&title=${encodeURIComponent(title)}&st=${startFormatted}&et=${endFormatted}&desc=${encodeURIComponent(description)}&in_loc=${encodeURIComponent(location)}`,
    ics: generateICSFile(title, startDate, endDate, description, location)
  }
  
  return calendarUrls
}

const generateICSFile = (title, startDate, endDate, description, location) => {
  const formatICSDate = (date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }
  
  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Wel.x//Course Reminder//EN
BEGIN:VEVENT
UID:${Date.now()}@welx.com
DTSTAMP:${formatICSDate(new Date())}
DTSTART:${formatICSDate(startDate)}
DTEND:${formatICSDate(endDate)}
SUMMARY:${title}
DESCRIPTION:${description}
LOCATION:${location}
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
TRIGGER:-P1D
DESCRIPTION:${title} reminder
ACTION:DISPLAY
END:VALARM
END:VEVENT
END:VCALENDAR`
  
  const blob = new Blob([icsContent], { type: 'text/calendar' })
  return URL.createObjectURL(blob)
}

export const openCalendarSelector = (event) => {
  const urls = addToCalendar(event)
  
  // Detect device/platform
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
  const isAndroid = /Android/.test(navigator.userAgent)
  const isMobile = isIOS || isAndroid
  
  if (isMobile) {
    // For mobile devices, try to open native calendar
    if (isIOS) {
      // iOS calendar URL scheme
      const iosDate = event.date.replace(/[-:]/g, '').split('.')[0]
      window.location.href = `calshow:${iosDate}`
      // Fallback to Google Calendar
      setTimeout(() => {
        window.open(urls.google, '_blank')
      }, 1000)
    } else if (isAndroid) {
      // Android calendar intent
      const intent = `intent://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${event.date.replace(/[-:]/g, '').split('.')[0]}Z#Intent;scheme=https;package=com.google.android.calendar;end`
      window.location.href = intent
      // Fallback to web
      setTimeout(() => {
        window.open(urls.google, '_blank')
      }, 1000)
    }
  } else {
    // Desktop - show options
    showCalendarOptions(urls, event)
  }
}

const showCalendarOptions = (urls, event) => {
  const modal = document.createElement('div')
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'
  modal.innerHTML = `
    <div class="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
      <h3 class="text-lg font-semibold mb-4">Add to Calendar</h3>
      <div class="space-y-3">
        <button onclick="window.open('${urls.google}', '_blank')" class="w-full p-3 text-left border rounded-lg hover:bg-gray-50 flex items-center">
          <div class="w-6 h-6 bg-blue-500 rounded mr-3"></div>
          Google Calendar
        </button>
        <button onclick="window.open('${urls.outlook}', '_blank')" class="w-full p-3 text-left border rounded-lg hover:bg-gray-50 flex items-center">
          <div class="w-6 h-6 bg-blue-600 rounded mr-3"></div>
          Outlook
        </button>
        <button onclick="window.open('${urls.yahoo}', '_blank')" class="w-full p-3 text-left border rounded-lg hover:bg-gray-50 flex items-center">
          <div class="w-6 h-6 bg-purple-600 rounded mr-3"></div>
          Yahoo Calendar
        </button>
        <a href="${urls.ics}" download="${event.title.replace(/[^a-zA-Z0-9]/g, '_')}.ics" class="w-full p-3 text-left border rounded-lg hover:bg-gray-50 flex items-center block">
          <div class="w-6 h-6 bg-gray-600 rounded mr-3"></div>
          Download ICS File
        </a>
      </div>
      <button onclick="this.closest('.fixed').remove()" class="w-full mt-4 p-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
        Cancel
      </button>
    </div>
  `
  
  document.body.appendChild(modal)
  
  // Remove modal when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove()
    }
  })
}
 