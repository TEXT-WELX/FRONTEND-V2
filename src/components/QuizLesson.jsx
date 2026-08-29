import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HelpCircle, CheckCircle, Clock, Lock, ArrowRight } from 'lucide-react'

export default function QuizLesson({ lesson, isCompleted, onComplete, isLocked, courseId }) {
  const navigate = useNavigate()

  const handleTakeQuiz = () => {
    navigate(`/module-quiz/${courseId}/${lesson.id}`)
  }

  if (isLocked) {
    return (
      <div className="bg-gray-100 border border-gray-200 rounded-lg p-6 text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
            <HelpCircle className="w-8 h-8 text-gray-500" />
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
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <HelpCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{lesson.title}</h3>
              <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{lesson.duration}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <HelpCircle className="w-4 h-4" />
                  <span>Quiz</span>
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

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <HelpCircle className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">Quiz Information</h4>
              <p className="text-blue-700 text-sm mb-3">
                {lesson.description || 'Test your knowledge with this interactive quiz. Complete the video and reading lessons first to unlock this quiz.'}
              </p>
              <div className="flex items-center space-x-4 text-xs text-blue-600">
                <span>• Multiple choice questions</span>
                <span>• Immediate feedback</span>
                <span>• Score tracking</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quiz Stats or Preview */}
        {!isCompleted && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-700">10</div>
                <div className="text-xs text-gray-500">Questions</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-700">15</div>
                <div className="text-xs text-gray-500">Minutes</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-700">70%</div>
                <div className="text-xs text-gray-500">Pass Rate</div>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {!isCompleted && "🧠 Ready to test your knowledge?"}
            {isCompleted && "✅ Quiz completed successfully!"}
          </div>

          {!isCompleted ? (
            <button
              onClick={handleTakeQuiz}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <span>Take Quiz</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleTakeQuiz}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <span>Retake Quiz</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Completion Badge */}
        {isCompleted && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 text-green-800">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Quiz completed! Module progress updated.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
