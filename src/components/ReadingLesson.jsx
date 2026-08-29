import { useState } from 'react'
import { BookOpen, CheckCircle, Clock, FileText } from 'lucide-react'

export default function ReadingLesson({ lesson, isCompleted, onComplete, isLocked }) {
  const [isRead, setIsRead] = useState(false)

  const handleReadingComplete = () => {
    setIsRead(true)
    if (onComplete) {
      onComplete(lesson.id, 'reading')
    }
  }

  if (isLocked) {
    return (
      <div className="bg-gray-100 border border-gray-200 rounded-lg p-6 text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-gray-500" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">{lesson.title}</h3>
        <p className="text-gray-600 mb-4">{lesson.description}</p>
        <div className="flex items-center justify-center space-x-2 text-gray-500">
          <Clock className="w-4 h-4" />
          <span className="text-sm">{lesson.duration}</span>
        </div>
        <div className="mt-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-200 text-gray-600">
            🔒 Locked
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      <div className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{lesson.title}</h3>
              <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{lesson.duration}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <FileText className="w-4 h-4" />
                  <span>Reading</span>
                </div>
              </div>
            </div>
          </div>

          {isCompleted && (
            <div className="flex items-center space-x-1 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Completed</span>
            </div>
          )}
        </div>

        {/* Reading Content */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <div className="prose max-w-none">
            <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
              {lesson.content || 'Reading content not available.'}
            </div>
          </div>
        </div>

        {/* Reading Progress Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Reading Progress</span>
            <span>Scroll to read</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: isRead ? '100%' : '0%' }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {!isRead && "📖 Scroll through the content to mark as read"}
            {isRead && !isCompleted && "✅ Ready to mark as complete"}
          </div>

          {!isCompleted && (
            <button
              onClick={handleReadingComplete}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isRead
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              disabled={!isRead}
            >
              Mark as Complete
            </button>
          )}
        </div>

        {/* Completion Confirmation */}
        {isRead && !isCompleted && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 text-green-800">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Reading completed! Click the button above to mark as complete.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
