import { useState } from 'react'
import { PlayCircle, CheckCircle, Clock, Eye } from 'lucide-react'

export default function VideoLesson({ lesson, isCompleted, onComplete, isLocked }) {
  const [isWatched, setIsWatched] = useState(false)

  const handleVideoComplete = () => {
    setIsWatched(true)
    if (onComplete) {
      onComplete(lesson.id, 'video')
    }
  }

  if (isLocked) {
    return (
      <div className="bg-gray-100 border border-gray-200 rounded-lg p-6 text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
            <PlayCircle className="w-8 h-8 text-gray-500" />
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
      <div className="aspect-video bg-black relative">
        {lesson.videoUrl ? (
          <iframe
            src={lesson.videoUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={() => {
              // You can add video tracking logic here
              console.log('Video loaded:', lesson.title)
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white">
            <div className="text-center">
              <PlayCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Video content not available</p>
            </div>
          </div>
        )}

        {/* Video completion overlay */}
        {isWatched && !isCompleted && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <button
              onClick={handleVideoComplete}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center space-x-2"
            >
              <CheckCircle className="w-5 h-5" />
              <span>Mark as Complete</span>
            </button>
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{lesson.title}</h3>
            <p className="text-gray-600 text-sm mb-3">{lesson.description}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{lesson.duration}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span>Video</span>
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

        {!isCompleted && !isWatched && (
          <button
            onClick={handleVideoComplete}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Mark as Complete
          </button>
        )}

        {isWatched && !isCompleted && (
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">Video watched! Click below to mark as complete.</p>
            <button
              onClick={handleVideoComplete}
              className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
            >
              Mark as Complete
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
