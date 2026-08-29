import  { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Star, MessageCircle, Award } from 'lucide-react'

export default function CourseFeedback({ user }) {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [difficultyRating, setDifficultyRating] = useState(0)
  const [wouldRecommend, setWouldRecommend] = useState('')
  const [mostValuable, setMostValuable] = useState('')
  const [improvements, setImprovements] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const courses = {
    1: { title: 'React.js Complete Course' },
    2: { title: 'Data Science Fundamentals' },
    3: { title: 'Business Strategy & Management' }
  }

  const course = courses[courseId]

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!rating || !feedback || !difficultyRating || !wouldRecommend) {
      alert('Please fill in all required fields')
      return
    }

    const feedbackData = {
      courseId,
      userId: user.id,
      rating,
      feedback,
      difficultyRating,
      wouldRecommend,
      mostValuable,
      improvements,
      submittedAt: new Date().toISOString()
    }

    localStorage.setItem(`user_${user.id}_course_${courseId}_feedback`, JSON.stringify(feedbackData))
    setSubmitted(true)
  }

  const handleViewCertificate = () => {
    navigate(`/certificate/${courseId}`)
  }

  if (!course) {
    return <div className="max-w-4xl mx-auto px-4 py-8">Course not found</div>
  }

  if (submitted) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="card text-center">
          <Award className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4">Thank You for Your Feedback!</h1>
          <p className="text-gray-600 mb-6">
            Your feedback helps us improve the course experience for future learners.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-green-800 mb-2">Certificate Unlocked!</h2>
            <p className="text-green-600 mb-4">You have successfully completed the course and can now access your certificate.</p>
            <button
              onClick={handleViewCertificate}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
            >
              View Certificate
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="card">
        <div className="text-center mb-8">
          <MessageCircle className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Course Feedback</h1>
          <p className="text-gray-600">Help us improve by sharing your experience with {course.title}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Overall Rating *
            </label>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`w-8 h-8 ${
                    star <= rating ? 'text-yellow-400' : 'text-gray-300'
                  } hover:text-yellow-400 transition-colors`}
                >
                  <Star className="w-full h-full fill-current" />
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-600">
                {rating > 0 && `(${rating}/5)`}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What did you think of this course? *
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share your overall experience with the course..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="4"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How would you rate the difficulty level? *
            </label>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setDifficultyRating(level)}
                  className={`px-3 py-1 text-sm rounded-lg border transition-colors ${
                    level === difficultyRating
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {level}
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-600">
                (1 = Very Easy, 5 = Very Hard)
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Would you recommend this course to others? *
            </label>
            <div className="space-y-2">
              {['Yes, definitely', 'Yes, probably', 'Maybe', 'Probably not', 'No, definitely not'].map((option) => (
                <label key={option} className="flex items-center">
                  <input
                    type="radio"
                    name="recommend"
                    value={option}
                    checked={wouldRecommend === option}
                    onChange={(e) => setWouldRecommend(e.target.value)}
                    className="mr-2"
                    required
                  />
                  <span className="text-sm">{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What was the most valuable part of this course?
            </label>
            <textarea
              value={mostValuable}
              onChange={(e) => setMostValuable(e.target.value)}
              placeholder="Which lessons, exercises, or concepts were most helpful?"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How can we improve this course?
            </label>
            <textarea
              value={improvements}
              onChange={(e) => setImprovements(e.target.value)}
              placeholder="Suggestions for additional content, better explanations, or other improvements..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="3"
            />
          </div>

          <div className="flex justify-between items-center pt-6">
            <button
              type="button"
              onClick={() => navigate(`/course/${courseId}`)}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Back to Course
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Submit Feedback & Unlock Certificate
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
 