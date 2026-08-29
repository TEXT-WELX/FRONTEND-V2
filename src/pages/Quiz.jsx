import   { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Clock, CheckCircle, X } from 'lucide-react'
import CalendarButton from '../components/CalendarButton' 

export default function Quiz({ user }) {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(1800) // 30 minutes
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [score, setScore] = useState(0)

  const quizData = {
    1: {
      title: 'React.js Final Assessment',
      questions: [
        {
          id: 1,
          question: 'What is the virtual DOM in React?',
          options: [
            'A copy of the real DOM kept in memory',
            'A database for storing component data',
            'A testing environment',
            'A CSS framework'
          ],
          correct: 0
        },
        {
          id: 2,
          question: 'How do you handle events in React?',
          options: [
            'Using inline JavaScript',
            'Using event handlers passed as props',
            'Using jQuery',
            'Using vanilla JavaScript'
          ],
          correct: 1
        },
        {
          id: 3,
          question: 'What is the purpose of React hooks?',
          options: [
            'To add styling to components',
            'To manage state and side effects in functional components',
            'To create class components',
            'To handle routing'
          ],
          correct: 1
        },
        {
          id: 4,
          question: 'How do you pass data from parent to child component?',
          options: [
            'Using state',
            'Using props',
            'Using context',
            'Using refs'
          ],
          correct: 1
        },
        {
          id: 5,
          question: 'What is the correct way to update state in React?',
          options: [
            'Directly modifying the state variable',
            'Using the setState function or state setter',
            'Refreshing the page',
            'Using jQuery'
          ],
          correct: 1
        }
      ]
    },
    2: {
      title: 'Data Science Final Assessment',
      questions: [
        {
          id: 1,
          question: 'What is the primary purpose of Pandas in data science?',
          options: [
            'Data visualization',
            'Data manipulation and analysis',
            'Machine learning',
            'Web scraping'
          ],
          correct: 1
        },
        {
          id: 2,
          question: 'Which Python data type is mutable?',
          options: [
            'String',
            'Tuple',
            'List',
            'Integer'
          ],
          correct: 2
        },
        {
          id: 3,
          question: 'What does the mean() function calculate?',
          options: [
            'Median value',
            'Mode value',
            'Average value',
            'Maximum value'
          ],
          correct: 2
        },
        {
          id: 4,
          question: 'Which library is commonly used for data visualization in Python?',
          options: [
            'NumPy',
            'Pandas',
            'Matplotlib',
            'Scikit-learn'
          ],
          correct: 2
        }
      ]
    },
    3: {
      title: 'Business Strategy Final Assessment',
      questions: [
        {
          id: 1,
          question: 'What is the primary goal of strategic planning?',
          options: [
            'Increase daily operations',
            'Define long-term direction and competitive advantage',
            'Manage employee schedules',
            'Reduce operational costs only'
          ],
          correct: 1
        },
        {
          id: 2,
          question: 'What does ROI stand for?',
          options: [
            'Return on Investment',
            'Rate of Interest',
            'Risk of Investment',
            'Ratio of Income'
          ],
          correct: 0
        },
        {
          id: 3,
          question: 'Which is NOT one of Porter\'s Five Forces?',
          options: [
            'Competitive rivalry',
            'Supplier power',
            'Market volatility',
            'Threat of substitutes'
          ],
          correct: 2
        },
        {
          id: 4,
          question: 'What is a KPI?',
          options: [
            'Key Performance Indicator',
            'Knowledge Process Integration',
            'Key Product Information',
            'Knowledge Performance Index'
          ],
          correct: 0
        }
      ]
    }
  }

  const quiz = quizData[courseId]

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    // Check if all modules are completed
    const completedModules = JSON.parse(localStorage.getItem(`user_${user.id}_course_${courseId}_modules`) || '[]')
    const requiredModules = {
      1: 3, // React course has 3 modules
      2: 2, // Data Science has 2 modules
      3: 1  // Business Strategy has 1 module
    }
    
    if (completedModules.length < requiredModules[courseId]) {
      alert('You must complete all modules before taking the final quiz!')
      navigate(`/course/${courseId}`)
      return
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmitQuiz()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [user, navigate, courseId])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }))
  }

  const handleSubmitQuiz = () => {
    let correctAnswers = 0
    quiz.questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correct) {
        correctAnswers++
      }
    })
    
    const finalScore = Math.round((correctAnswers / quiz.questions.length) * 100)
    setScore(finalScore)
    setQuizCompleted(true)
    
    localStorage.setItem(`user_${user.id}_course_${courseId}_quiz`, JSON.stringify({
      score: finalScore,
      passed: finalScore >= 70,
      completedAt: new Date().toISOString()
    }))
  }

  const handleViewFeedback = () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')
    if (currentUser.id) {
      const currentPoints = parseInt(localStorage.getItem(`welx_points_${currentUser.id}`) || '0')
      const newPoints = currentPoints + 150
      localStorage.setItem(`welx_points_${currentUser.id}`, newPoints.toString())
      window.dispatchEvent(new CustomEvent('welxPointsUpdated', { detail: { userId: currentUser.id, points: newPoints } }))
    }
    navigate(`/course-feedback/${courseId}`)
  }

  if (!quiz) {
    return <div className="max-w-4xl mx-auto px-4 py-8">Quiz not found</div>
  }

  if (quizCompleted) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="card text-center">
          <div className="mb-6">
            {score >= 70 ? (
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            ) : (
              <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
            )}
            <h1 className="text-3xl font-bold mb-2">Final Quiz Completed!</h1>
            <p className="text-xl text-gray-600">Your score: {score}%</p>
          </div>
          
          {score >= 70 ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-green-800 mb-2">Congratulations!</h2>
              <p className="text-green-600 mb-4">You passed the final quiz! Please provide your feedback to unlock your certificate.</p>
              <button
                onClick={handleViewFeedback}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
              >
                Provide Feedback (+150 WelX Points)
              </button>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-red-800 mb-2">Not Quite There</h2>
              <p className="text-red-600 mb-4">You need 70% to pass. Review the course material and try again!</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700"
              >
                Retake Quiz
              </button>
            </div>
          )}
          
          <button
            onClick={() => navigate(`/course/${courseId}`)}
            className="btn-secondary"
          >
            Back to Course
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
           <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{quiz.title}</h1>
        <div className="flex items-center space-x-4">
          <CalendarButton 
            event={{
              title: `Final Quiz: ${quiz.title}`,
              date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
              description: `Take the final quiz for ${quiz.title}. Time limit: 30 minutes`,
              location: 'Wel.x Learning Platform'
            }}
            size="md"
          />
          <div className="flex items-center space-x-2 text-lg font-semibold">
            <Clock className="w-5 h-5" />
            <span>{formatTime(timeLeft)}</span>
          </div>
        </div>
      </div> 

      <div className="card">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-600">
              Question {currentQuestion + 1} of {quiz.questions.length}
            </span>
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-800 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
              />
            </div>
          </div>
          
          <h2 className="text-xl font-semibold mb-6">
            {quiz.questions[currentQuestion].question}
          </h2>
          
          <div className="space-y-3">
            {quiz.questions[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(currentQuestion, index)}
                className={`w-full p-4 text-left border rounded-lg transition-colors ${
                  selectedAnswers[currentQuestion] === index
                    ? 'border-blue-800 bg-blue-50 text-blue-800'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <span className="font-medium mr-3">{String.fromCharCode(65 + index)}.</span>
                {option}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex justify-between">
          <button
            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
            className="px-6 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {currentQuestion === quiz.questions.length - 1 ? (
            <button
              onClick={handleSubmitQuiz}
              disabled={Object.keys(selectedAnswers).length !== quiz.questions.length}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Quiz
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestion(prev => Math.min(quiz.questions.length - 1, prev + 1))}
              disabled={selectedAnswers[currentQuestion] === undefined}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
 