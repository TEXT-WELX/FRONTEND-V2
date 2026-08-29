import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Clock, CheckCircle, XCircle, Award, AlertCircle } from 'lucide-react'
import { quizAPI, certificateAPI } from '../utils/enhancedApi'

export default function QuizEnhanced({ user }) {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState(null)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user) {
      loadQuiz()
    } else {
      navigate('/login')
    }
  }, [user, courseId])

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && quiz && !result) {
      handleSubmitQuiz()
    }
  }, [timeLeft, quiz, result])

  const loadQuiz = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await quizAPI.generateQuiz({
        courseId,
        moduleId: null, // null for final quiz
        type: 'final'
      })

      setQuiz(response.data)
      setTimeLeft(response.data.timeLimit)
    } catch (error) {
      console.error('Error loading quiz:', error)
      setError(error.response?.data?.message || 'Failed to load quiz')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerSelect = (questionId, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }))
  }

  const handleSubmitQuiz = async () => {
    if (!quiz || submitting) return

    try {
      setSubmitting(true)

      // Convert answers to the format expected by the API
      const formattedAnswers = Object.entries(answers).map(([questionId, selectedAnswer]) => ({
        questionId,
        selectedAnswer
      }))

      const response = await quizAPI.submitQuiz({
        quizId: quiz.quizId,
        answers: formattedAnswers,
        timeSpent: quiz.timeLimit - timeLeft
      })

      setResult(response.data)
    } catch (error) {
      console.error('Error submitting quiz:', error)
      setError(error.response?.data?.message || 'Failed to submit quiz')
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getTimeColor = () => {
    if (timeLeft > 300) return 'text-green-600' // >5 minutes
    if (timeLeft > 120) return 'text-yellow-600' // >2 minutes
    return 'text-red-600' // <=2 minutes
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded mb-4"></div>
          <div className="h-4 bg-gray-300 rounded mb-2"></div>
          <div className="h-4 bg-gray-300 rounded mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Quiz</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadQuiz}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (result) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className={`text-center mb-8 p-8 rounded-lg ${
          result.passed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex justify-center mb-4">
            {result.passed ? (
              <CheckCircle className="w-16 h-16 text-green-600" />
            ) : (
              <XCircle className="w-16 h-16 text-red-600" />
            )}
          </div>
          <h1 className={`text-3xl font-bold mb-4 ${
            result.passed ? 'text-green-800' : 'text-red-800'
          }`}>
            {result.passed ? 'Congratulations!' : 'Quiz Completed'}
          </h1>
          <div className="text-6xl font-bold mb-4">
            {result.score}%
          </div>
          <p className={`text-xl mb-6 ${
            result.passed ? 'text-green-700' : 'text-red-700'
          }`}>
            {result.passed
              ? `You passed! You got ${result.correctAnswers} out of ${result.totalQuestions} questions correct.`
              : `You scored ${result.score}%. The passing score is ${result.passingScore}%.`
            }
          </p>

          {result.passed && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Award className="w-6 h-6 text-blue-600" />
                <span className="font-semibold text-blue-800">Certificate Available!</span>
              </div>
              <p className="text-blue-700 mb-4">
                You've successfully completed the course! You can now generate your certificate.
              </p>
              <Link
                to={`/certificate/${courseId}`}
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
              >
                Get Your Certificate
              </Link>
            </div>
          )}

          <div className="flex justify-center space-x-4">
            <button
              onClick={() => navigate(`/course/${courseId}`)}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
            >
              Back to Course
            </button>
            {!result.passed && (
              <button
                onClick={loadQuiz}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Retake Quiz
              </button>
            )}
          </div>
        </div>

        {/* Quiz Review */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6">Quiz Review</h2>
          <div className="space-y-4">
            {quiz.questions.map((question, index) => (
              <div key={question.questionId} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold">
                    Question {index + 1}: {question.question}
                  </h3>
                  <div className="flex items-center space-x-2">
                    {answers[question.questionId] === question.correct ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  {question.options.map((option, optionIndex) => (
                    <div
                      key={optionIndex}
                      className={`p-2 rounded ${
                        optionIndex === question.correct
                          ? 'bg-green-100 text-green-800'
                          : optionIndex === answers[question.questionId]
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-50'
                      }`}
                    >
                      {option}
                      {optionIndex === question.correct && (
                        <span className="ml-2 text-sm font-medium">✓ Correct Answer</span>
                      )}
                      {optionIndex === answers[question.questionId] && optionIndex !== question.correct && (
                        <span className="ml-2 text-sm font-medium">✗ Your Answer</span>
                      )}
                    </div>
                  ))}
                </div>
                {question.explanation && (
                  <div className="mt-3 p-3 bg-blue-50 rounded">
                    <p className="text-sm text-blue-800">
                      <strong>Explanation:</strong> {question.explanation}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-yellow-800 mb-2">Quiz Not Available</h2>
          <p className="text-yellow-700 mb-4">The quiz for this course is not available yet.</p>
          <button
            onClick={() => navigate(`/course/${courseId}`)}
            className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700"
          >
            Back to Course
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">{quiz.title}</h1>
            <p className="text-gray-600">{quiz.description}</p>
          </div>
          <div className={`flex items-center space-x-2 ${getTimeColor()}`}>
            <Clock className="w-6 h-6" />
            <span className="text-2xl font-bold">{formatTime(timeLeft)}</span>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress: {Object.keys(answers).length} of {quiz.questions.length} questions answered</span>
            <span>Attempt {quiz.attemptNumber}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(Object.keys(answers).length / quiz.questions.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="space-y-6">
          {quiz.questions.map((question, index) => (
            <div key={question.questionId} className="border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">
                Question {index + 1}: {question.question}
              </h3>
              <div className="space-y-3">
                {question.options.map((option, optionIndex) => (
                  <label
                    key={optionIndex}
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                      answers[question.questionId] === optionIndex
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${question.questionId}`}
                      value={optionIndex}
                      checked={answers[question.questionId] === optionIndex}
                      onChange={() => handleAnswerSelect(question.questionId, optionIndex)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="ml-3">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center mt-8">
          <button
            onClick={() => navigate(`/course/${courseId}`)}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Back to Course
          </button>

          <button
            onClick={handleSubmitQuiz}
            disabled={submitting || Object.keys(answers).length !== quiz.questions.length}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        </div>

        {Object.keys(answers).length !== quiz.questions.length && (
          <p className="text-center text-gray-600 mt-4">
            Please answer all questions before submitting.
          </p>
        )}
      </div>
    </div>
  )
}
