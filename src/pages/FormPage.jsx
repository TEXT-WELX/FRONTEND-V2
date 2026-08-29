import { Sparkles, CalendarDays, Clock, CheckCircle, Users } from "lucide-react";

export default function CareerMatchmakingRegistration() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">

      {/* Background Effects */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-20"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-pink-500 rounded-full blur-3xl opacity-20"></div>
      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-yellow-400 rounded-full blur-3xl opacity-10 -translate-x-1/2 -translate-y-1/2"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">

        {/* Header */}
        <div className="text-center mb-12">

          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white px-5 py-2 rounded-full font-semibold mb-6">
            <Sparkles size={16} />
            WEL.X Career Matchmaking Day
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-pink-400 via-yellow-300 to-purple-300 bg-clip-text text-transparent">
              Complete Your Registration
            </span>
          </h1>

          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            You're one step away from meeting recruiters, mentors, and industry leaders.
            Get ready to build meaningful connections and discover your next opportunity.
          </p>
        </div>

        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-8">

          {/* Left Side */}
          <div className="space-y-6">

            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-white">
              <h2 className="text-2xl font-bold mb-6">
                What You'll Access
              </h2>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <CheckCircle className="text-green-400 flex-shrink-0" />
                  <span>25+ recruiters</span>
                </div>

                <div className="flex gap-3">
                  <CheckCircle className="text-green-400 flex-shrink-0" />
                  <span>Industry mentors</span>
                </div>

                <div className="flex gap-3">
                  <CheckCircle className="text-green-400 flex-shrink-0" />
                  <span>Internship and career opportunities</span>
                </div>

                <div className="flex gap-3">
                  <CheckCircle className="text-green-400 flex-shrink-0" />
                  <span>Exclusive networking with industry leaders</span>
                </div>

                <div className="flex gap-3">
                  <CheckCircle className="text-green-400 flex-shrink-0" />
                  <span>Meaningful career connections</span>
                </div>

                <div className="flex gap-3">
                  <CheckCircle className="text-green-400 flex-shrink-0" />
                  <span>A stronger path toward your next opportunity</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-pink-500 via-orange-400 to-violet-600 rounded-3xl p-8 text-white shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <Users />
                <span className="font-bold">
                  200+ Expected Participants
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CalendarDays size={18} />
                  <span>30 June 2026</span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock size={18} />
                  <span>Wellington Campus</span>
                </div>

                <div className="font-bold text-xl mt-4">
                  🔥 Limited Seats Available
                </div>

                <div className="text-white/90">
                  Open to students and graduates ready to meet recruiters and mentors.
                </div>
              </div>
            </div>

          </div>

          {/* Right Side Form */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">

            <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 p-6">
              <h2 className="text-2xl font-bold text-white">
                Reserve Your Seat
              </h2>

              <p className="text-purple-100 mt-2">
                Complete the registration form below.
              </p>
            </div>

            <iframe
              src="https://docs.google.com/forms/d/e/1FAIpQLSeoCqTpYdUj-CqE4Yj00idDVDs0sQuG5aoUNspEAgQstl-sIg/viewform"
              title="WEL.X Career Matchmaking Day Registration"
              width="100%"
              height="1000"
              frameBorder="0"
              className="w-full"
            />
          </div>

        </div>
      </div>
    </div>
  );
}


