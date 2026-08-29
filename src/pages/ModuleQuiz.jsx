import  { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Clock, CheckCircle, X } from 'lucide-react'

export default function ModuleQuiz({ user }) {
  const { courseId, moduleId } = useParams()
  const navigate = useNavigate()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [score, setScore] = useState(0)

  const moduleQuizData = {
    1: {
      1: {
        title: 'Introduction to React - Quiz',
        questions: [
          {
            id: 1,
            question: 'What is React?',
            options: [
              'A JavaScript library for building user interfaces',
              'A database management system',
              'A web server',
              'A CSS framework'
            ],
            correct: 0
          },
          {
            id: 2,
            question: 'What does JSX stand for?',
            options: [
              'JavaScript XML',
              'JavaScript Extension',
              'Java Standard Extension',
              'JavaScript Syntax'
            ],
            correct: 0
          },
          {
            id: 3,
            question: 'How do you create a React component?',
            options: [
              'Using HTML tags',
              'Using CSS classes',
              'Using JavaScript functions or classes',
              'Using JSON objects'
            ],
            correct: 2
          }
        ]
      },
      2: {
        title: 'Components and JSX - Quiz',
        questions: [
          {
            id: 1,
            question: 'What are props in React?',
            options: [
              'Properties passed to components',
              'CSS properties',
              'HTML attributes',
              'JavaScript variables'
            ],
            correct: 0
          },
          {
            id: 2,
            question: 'Can you modify props inside a component?',
            options: [
              'Yes, always',
              'No, props are read-only',
              'Only in class components',
              'Only in function components'
            ],
            correct: 1
          }
        ]
      },
      3: {
        title: 'State Management - Quiz',
        questions: [
          {
            id: 1,
            question: 'What is the useState hook used for?',
            options: [
              'Managing component state',
              'Handling side effects',
              'Fetching data',
              'Styling components'
            ],
            correct: 0
          },
          {
            id: 2,
            question: 'How do you update state in React?',
            options: [
              'Directly modify the state variable',
              'Use the setState function',
              'Use the state setter function',
              'Refresh the page'
            ],
            correct: 2
          }
        ]
      }
    },
    2: {
      1: {
        title: 'Python Basics - Quiz',
        questions: [
          {
            id: 1,
            question: 'What is Python?',
            options: [
              'A snake',
              'A programming language',
              'A database',
              'A web server'
            ],
            correct: 1
          },
          {
            id: 2,
            question: 'Which of these is a Python data type?',
            options: [
              'String',
              'Integer',
              'List',
              'All of the above'
            ],
            correct: 3
          }
        ]
      },
      2: {
        title: 'Data Analysis with Pandas - Quiz',
        questions: [
          {
            id: 1,
            question: 'What is Pandas?',
            options: [
              'A Python library for data manipulation',
              'A type of bear',
              'A web framework',
              'A database'
            ],
            correct: 0
          }
        ]
      }
    },
    3: {
      1: {
        title: 'Strategic Planning - Quiz',
        questions: [
          {
            id: 1,
            question: 'What does SWOT stand for?',
            options: [
              'Strengths, Weaknesses, Opportunities, Threats',
              'Sales, Work, Operations, Technology',
              'Strategy, Workflow, Objectives, Tactics',
              'Systems, Workers, Organization, Tools'
            ],
            correct: 0
          },
          {
            id: 2,
            question: 'What is strategic planning?',
            options: [
              'Daily task management',
              'Long-term organizational direction setting',
              'Employee scheduling',
              'Budget allocation'
            ],
            correct: 1
          }
        ]
      }
    }
  }

  const quiz = moduleQuizData[courseId]?.[moduleId]

  useEffect(() => {
    if (!user) {
      navigate('/login')
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
  }, [user, navigate])

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
    
    // Save quiz result
    localStorage.setItem(`user_${user.id}_course_${courseId}_module_${moduleId}_quiz`, JSON.stringify({
      score: finalScore,
      passed: finalScore >= 70,
      completedAt: new Date().toISOString()
    }))

    // If passed, unlock next module
    if (finalScore >= 70) {
      const completedModules = JSON.parse(localStorage.getItem(`user_${user.id}_course_${courseId}_modules`) || '[]')
      if (!completedModules.includes(parseInt(moduleId))) {
        completedModules.push(parseInt(moduleId))
        localStorage.setItem(`user_${user.id}_course_${courseId}_modules`, JSON.stringify(completedModules))
      }
    }
  }

  const handleReturnToCourse = () => {
    navigate(`/course/${courseId}`)
  }

  if (!quiz) {
    return <div className="max-w-4xl mx-auto px-4 py-8">Module quiz not found</div>
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
            <h1 className="text-3xl font-bold mb-2">Module Quiz Completed!</h1>
            <p className="text-xl text-gray-600">Your score: {score}%</p>
          </div>
          
          {score >= 70 ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-green-800 mb-2">Great Job!</h2>
              <p className="text-green-600 mb-4">You passed the module quiz! The next module is now unlocked.</p>
              <button
                onClick={handleReturnToCourse}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
              >
                Continue to Next Module
              </button>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-red-800 mb-2">Keep Trying!</h2>
              <p className="text-red-600 mb-4">You need 70% to pass. Review the module material and try again!</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700"
              >
                Retake Quiz
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{quiz.title}</h1>
        <div className="flex items-center space-x-2 text-lg font-semibold">
          <Clock className="w-5 h-5" />
          <span>{formatTime(timeLeft)}</span>
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
 