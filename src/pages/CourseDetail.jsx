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
} from "lucide-react";
import CalendarButton from "../components/CalendarButton";
import { useCurrency } from "../contexts/CurrencyContext";
import { API_BASE } from "../utils/enhancedApiUpdated";

export default function CourseDetail({ user }) {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [enrolled, setEnrolled] = useState(false);
  const { formatPrice } = useCurrency();
  const [currentLesson, setCurrentLesson] = useState(0);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [completedModules, setCompletedModules] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [showVideo, setShowVideo] = useState(false);
  const [course, setCourse] = useState(null);

  useEffect(() => {
    async function fetchCourse() {
      try {
        const response = await fetch(`${API_BASE}/api/courses/${courseId}`);
        if (!response.ok) {
          throw new Error("Course not found");
        }
        const data = await response.json();
        setCourse(data);
      } catch (error) {
        console.error("Error fetching course:", error);
        setCourse(null);
      }
    }
    fetchCourse();
  }, [courseId]);

  useEffect(() => {
    if (user && course) {
      const userCourses = JSON.parse(
        localStorage.getItem(`user_${user.id}_courses`) || "[]"
      );
      setEnrolled(userCourses.includes(course._id));

      const progress = JSON.parse(
        localStorage.getItem(`user_${user.id}_course_${course._id}_progress`) ||
          "[]"
      );
      setCompletedLessons(progress);

      const moduleProgress = JSON.parse(
        localStorage.getItem(`user_${user.id}_course_${course._id}_modules`) ||
          "[]"
      );
      setCompletedModules(moduleProgress);
    }
  }, [course, user]);

  const handleEnroll = () => { 
    if (!user) {
      navigate("/login");
      return;
    }
    navigate(`/payment?courseId=${courseId}`);
  };

  const markLessonComplete = (lessonId) => {
    const newCompleted = [...completedLessons, lessonId];
    setCompletedLessons(newCompleted);
    localStorage.setItem(
      `user_${user.id}_course_${courseId}_progress`,
      JSON.stringify(newCompleted)
    );

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
  };

  const isModuleUnlocked = (moduleId) => {
    if (moduleId === 1) return true;
    return completedModules.includes(moduleId - 1);
  };

  const isModuleCompleted = (moduleId) => {
    return completedModules.includes(moduleId);
  };

  const getModuleProgress = (module) => {
    const moduleLessons = module.lessons.map((l) => l.id);
    const completedInModule = moduleLessons.filter((id) =>
      completedLessons.includes(id)
    );
    return (completedInModule.length / moduleLessons.length) * 100;
  };

  const openVideo = (lesson) => {
    setCurrentVideo(lesson);
    setShowVideo(true);
  };

  const totalLessons =
    course?.modules?.reduce(
      (total, module) => total + module.lessons.length,
      0
    ) || 0;
  const progressPercentage = (completedLessons.length / totalLessons) * 100;

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
                </div>
              )}

              <div className="space-y-6">
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
                            getModuleProgress(module) === 100 &&
                            !isModuleCompleted(module.id) && (
                              <div className="flex flex-col gap-1 mt-1">
                                <CalendarButton
                                  event={{
                                    title: `Module Quiz: ${module.title}`,
                                    date: new Date(
                                      Date.now() + 3 * 24 * 60 * 60 * 1000
                                    ).toISOString(),
                                    description: `Complete the quiz for ${module.title} module in ${course.title}`,
                                    location: "Wel.x Learning Platform",
                                  }}
                                  className="justify-center"
                                />
                                <Link
                                  to={`/module-quiz/${courseId}/${module.id}`}
                                  className="text-sm bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 inline-block text-center"
                                >
                                  Take Quiz
                                </Link>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>

                    {enrolled && isModuleUnlocked(module.id) && (
                      <div className="p-4 space-y-3">
                        {module.lessons.map((lesson) => (
                          <div
                            key={lesson.id}
                            className="flex items-center justify-between border-l-4 border-blue-200 pl-4"
                          >
                            <div className="flex items-center space-x-3">
                              {completedLessons.includes(lesson.id) ? (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              ) : lesson.type === "video" ? (
                                <PlayCircle className="w-5 h-5 text-blue-600" />
                              ) : (
                                <Book className="w-5 h-5 text-purple-600" />
                              )}
                              <div>
                                <h5 className="font-medium">{lesson.title}</h5>
                                <p className="text-sm text-gray-600">
                                  {lesson.type} • {lesson.duration}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {lesson.type === "video" && (
                                <button
                                  onClick={() => openVideo(lesson)}
                                  className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-lg hover:bg-blue-200"
                                >
                                  Watch
                                </button>
                              )}
                              {lesson.type === "reading" && (
                                <button
                                  onClick={() => {
                                    setCurrentVideo(lesson);
                                    setShowVideo(true);
                                  }}
                                  className="text-sm bg-purple-100 text-purple-800 px-3 py-1 rounded-lg hover:bg-purple-200"
                                >
                                  Read
                                </button>
                              )}
                              {!completedLessons.includes(lesson.id) && (
                                <button
                                  onClick={() => markLessonComplete(lesson.id)}
                                  className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-lg hover:bg-green-200"
                                >
                                  Complete
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {enrolled &&
                completedModules.length === course.modules?.length && (
                  <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Award className="w-8 h-8 text-green-600" />
                        <div>
                          <h3 className="text-lg font-semibold text-green-800">
                            Ready for Final Quiz!
                          </h3>
                          <p className="text-green-600">
                            Complete all modules! Take the final quiz to earn
                            your certificate.
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
            </div>
          </div>
        </div>
      </div>

      {showVideo && currentVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">{currentVideo.title}</h3>
              <button
                onClick={() => setShowVideo(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            {currentVideo.type === "video" ? (
              <div className="aspect-video mb-4">
                <iframe
                  src={currentVideo.videoUrl}
                  className="w-full h-full rounded-lg"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="prose max-w-none mb-4">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm">
                    {currentVideo.content}
                  </pre>
                </div>
              </div>
            )}
            <div className="flex justify-between">
              <button
                onClick={() => setShowVideo(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
              {!completedLessons.includes(currentVideo.id) && (
                <button
                  onClick={() => {
                    markLessonComplete(currentVideo.id);
                    setShowVideo(false);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Mark as Complete
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
