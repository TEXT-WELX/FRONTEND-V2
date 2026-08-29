import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Play,
  CheckCircle,
  Clock,
  Users,
  Star,
  Book,
  Award,
  Lock,
  PlayCircle,
  ArrowRight,
} from "lucide-react";
import CalendarButton from "../components/CalendarButton";
import { useCurrency } from "../contexts/CurrencyContext";
import {
  quizAPI,
  certificateAPI,
  progressAPI,
} from "../utils/enhancedApiUpdated";
import VideoLesson from "../components/VideoLesson";
import ReadingLesson from "../components/ReadingLesson";
import QuizLesson from "../components/QuizLesson";
import { API_BASE } from "../utils/enhancedApiUpdated";

export default function CourseDetailStructured({ user }) {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [enrolled, setEnrolled] = useState(false);
  const { formatPrice } = useCurrency();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    if (user && courseId) {
      loadCourse();
      loadProgress();
      loadQuizAttempts();
      loadCertificates();
    } else {
      loadCourse();
    }
  }, [user, courseId]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/courses/${courseId}`);
      if (!response.ok) {
        throw new Error("Course not found");
      }
      const data = await response.json();
      setCourse(data);
    } catch (error) {
      console.error("Error fetching course:", error);
      setCourse(null);
    } finally {
      setLoading(false);
    }
  };

  const loadProgress = async () => {
    try {
      const response = await progressAPI.getCourseProgress(courseId);
      setProgress(response.data);
    } catch (error) {
      console.error("Error loading progress:", error);
      // Initialize progress if not exists
      initializeProgress();
    }
  };

  const initializeProgress = async () => {
    try {
      await progressAPI.initializeCourseProgress(courseId);
      setProgress({
        courseId,
        userId: user.id,
        completedLessons: [],
        completedModules: [],
        currentModule: 1,
        currentLesson: 1,
        overallProgress: 0,
      });
    } catch (error) {
      console.error("Error initializing progress:", error);
    }
  };

  const loadQuizAttempts = async () => {
    try {
      const response = await quizAPI.getQuizAttempts(courseId);
      setQuizAttempts(response.data);
    } catch (error) {
      console.error("Error loading quiz attempts:", error);
    }
  };

  const loadCertificates = async () => {
    try {
      const response = await certificateAPI.getUserCertificates();
      const courseCertificates = response.data.filter(
        (cert) => cert.courseId === courseId
      );
      setCertificates(courseCertificates);
    } catch (error) {
      console.error("Error loading certificates:", error);
    }
  };

  const handleEnroll = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    navigate(`/payment?courseId=${courseId}`);
  };

  const handleLessonComplete = async (lessonId, lessonType) => {
    try {
      await progressAPI.updateLessonProgress(courseId, lessonId, {
        type: lessonType,
        completed: true,
        completedAt: new Date().toISOString(),
      });

      // Reload progress to get updated state
      await loadProgress();

      // Award points for lesson completion
      if (user) {
        const currentPoints = parseInt(
          localStorage.getItem(`welx_points_${user.id}`) || "0"
        );
        const newPoints = currentPoints + 15;
        localStorage.setItem(`welx_points_${user.id}`, newPoints.toString());
        window.dispatchEvent(
          new CustomEvent("welxPointsUpdated", {
            detail: { userId: user.id, points: newPoints },
          })
        );
      }
    } catch (error) {
      console.error("Error updating lesson progress:", error);
    }
  };

  const isModuleUnlocked = (moduleId) => {
    if (moduleId === 1) return true; // First module always unlocked
    return progress?.completedModules?.includes(moduleId - 1) || false;
  };

  const isModuleCompleted = (moduleId) => {
    return progress?.completedModules?.includes(moduleId) || false;
  };

  const getModuleProgress = (module) => {
    const lessons = [
      module.videoLesson,
      module.readingLesson,
      module.quizLesson,
    ];
    const completedLessons = lessons.filter(
      (lesson) => lesson.isCompleted
    ).length;
    return (completedLessons / lessons.length) * 100;
  };

  const canTakeModuleQuiz = (module) => {
    return module.videoLesson.isCompleted && module.readingLesson.isCompleted;
  };

  const canTakeFinalQuiz = () => {
    return course?.modules?.every((module) => module.isCompleted) || false;
  };

  const totalLessons = course?.modules?.length * 3 || 0; // 3 lessons per module
  const completedLessons =
    course?.modules?.reduce((count, module) => {
      return (
        count +
        (module.videoLesson.isCompleted ? 1 : 0) +
        (module.readingLesson.isCompleted ? 1 : 0) +
        (module.quizLesson.isCompleted ? 1 : 0)
      );
    }, 0) || 0;

  const progressPercentage = (completedLessons / totalLessons) * 100;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-300 rounded-lg mb-6"></div>
          <div className="h-8 bg-gray-300 rounded mb-4"></div>
          <div className="h-4 bg-gray-300 rounded mb-2"></div>
          <div className="h-4 bg-gray-300 rounded mb-6"></div>
        </div>
      </div>
    );
  }

  if (course === null) {
    return <div className="max-w-7xl mx-auto px-4 py-8">Course not found</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {course && (
            <>
              <img
                src={course.image || "https://via.placeholder.com/600x400"}
                alt={course.title}
                className="w-full h-64 object-cover rounded-lg mb-6"
              />

              <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
              <p className="text-gray-600 mb-6">{course.description}</p>

              <div className="flex items-center space-x-6 mb-8">
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="ml-1">{course.rating || "N/A"}</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-5 h-5 text-gray-400" />
                  <span className="ml-1">{course.students || 0} students</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <span className="ml-1">{course.duration || "N/A"}</span>
                </div>
              </div>

              {enrolled && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold">Your Progress</h3>
                    <span className="text-sm text-gray-600">
                      {Math.round(progressPercentage)}% Complete
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-800 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <div className="text-sm text-gray-600 mt-2">
                    {completedLessons} of {totalLessons} lessons completed
                  </div>
                </div>
              )}

              <div className="space-y-8">
                <h3 className="text-xl font-semibold">Course Modules</h3>
                {course.modules?.map((module) => (
                  <div
                    key={module.id}
                    className="border rounded-lg overflow-hidden"
                  >
                    <div className="bg-gray-50 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {isModuleCompleted(module.id) ? (
                            <CheckCircle className="w-6 h-6 text-green-500" />
                          ) : isModuleUnlocked(module.id) ? (
                            <Play className="w-6 h-6 text-blue-600" />
                          ) : (
                            <Lock className="w-6 h-6 text-gray-400" />
                          )}
                          <div>
                            <h4 className="font-semibold">{module.title}</h4>
                            <p className="text-sm text-gray-600">
                              {module.description}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">
                            {Math.round(getModuleProgress(module))}% Complete
                          </div>
                          {enrolled &&
                            isModuleUnlocked(module.id) &&
                            canTakeModuleQuiz(module) &&
                            !isModuleCompleted(module.id) && (
                              <div className="mt-2">
                                <Link
                                  to={`/module-quiz/${courseId}/${module.id}`}
                                  className="text-sm bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 inline-block"
                                >
                                  Take Quiz
                                </Link>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>

                    {enrolled && isModuleUnlocked(module.id) && (
                      <div className="p-6 space-y-6">
                        {/* Video Lesson */}
                        <div>
                          <h5 className="font-medium text-gray-800 mb-3 flex items-center">
                            <PlayCircle className="w-5 h-5 text-blue-600 mr-2" />
                            Video Lesson
                          </h5>
                          <VideoLesson
                            lesson={module.videoLesson}
                            isCompleted={module.videoLesson.isCompleted}
                            onComplete={handleLessonComplete}
                            isLocked={false}
                          />
                        </div>

                        {/* Reading Lesson */}
                        <div>
                          <h5 className="font-medium text-gray-800 mb-3 flex items-center">
                            <Book className="w-5 h-5 text-purple-600 mr-2" />
                            Reading Material
                          </h5>
                          <ReadingLesson
                            lesson={module.readingLesson}
                            isCompleted={module.readingLesson.isCompleted}
                            onComplete={handleLessonComplete}
                            isLocked={!module.videoLesson.isCompleted}
                          />
                        </div>

                        {/* Quiz Lesson */}
                        <div>
                          <h5 className="font-medium text-gray-800 mb-3 flex items-center">
                            <Award className="w-5 h-5 text-green-600 mr-2" />
                            Knowledge Check
                          </h5>
                          <QuizLesson
                            lesson={module.quizLesson}
                            isCompleted={module.quizLesson.isCompleted}
                            onComplete={handleLessonComplete}
                            isLocked={!canTakeModuleQuiz(module)}
                            courseId={courseId}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {enrolled && canTakeFinalQuiz() && (
                <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Award className="w-8 h-8 text-green-600" />
                      <div>
                        <h3 className="text-lg font-semibold text-green-800">
                          Ready for Final Quiz!
                        </h3>
                        <p className="text-green-600">
                          Complete all modules! Take the final quiz to earn your
                          certificate.
                        </p>
                      </div>
                    </div>
                    <CalendarButton
                      event={{
                        title: `Final Quiz: ${course.title}`,
                        date: new Date(
                          Date.now() + 7 * 24 * 60 * 60 * 1000
                        ).toISOString(),
                        description: `Take the final quiz for ${course.title} to earn your certificate`,
                        location: "Wel.x Learning Platform",
                      }}
                      size="md"
                    />
                  </div>
                  <Link
                    to={`/quiz/${courseId}`}
                    className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                  >
                    Take Final Quiz
                  </Link>
                </div>
              )}

              {certificates.length > 0 && (
                <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Award className="w-8 h-8 text-blue-600" />
                      <div>
                        <h3 className="text-lg font-semibold text-blue-800">
                          Certificate Earned!
                        </h3>
                        <p className="text-blue-600">
                          Congratulations! You have completed this course.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <Link
                      to={`/certificate/${courseId}`}
                      className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                    >
                      View Certificate
                    </Link>
                    <button
                      onClick={() => {
                        const certificate = certificates[0];
                        window.open(
                          `${window.location.origin}/certificate/${courseId}`,
                          "_blank"
                        );
                      }}
                      className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
                    >
                      Share Certificate
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="card sticky top-8">
            <div className="text-center mb-6">
              <span className="text-3xl font-bold text-blue-800">
                {formatPrice(course?.price || 0)}
              </span>
            </div>

            {!enrolled ? (
              <button
                onClick={handleEnroll}
                className="w-full btn-primary mb-4"
              >
                Enroll Now
              </button>
            ) : (
              <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg text-center">
                ✓ Enrolled
              </div>
            )}

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Instructor:</span>
                <span className="font-medium">
                  {course?.instructor || "Unknown"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium">{course?.duration || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Modules:</span>
                <span className="font-medium">
                  {course?.modules?.length || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Lessons:</span>
                <span className="font-medium">{totalLessons}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Quiz Required:</span>
                <span className="font-medium">
                  {course?.quizRequired ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Certificate:</span>
                <span className="font-medium">
                  {course?.certificateEnabled ? "Available" : "Not Available"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
