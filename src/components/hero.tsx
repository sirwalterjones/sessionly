import Link from "next/link";
import { ArrowUpRight, Check, Calendar, Clock, CreditCard } from "lucide-react";

export default function Hero() {
  return (
    <div className="relative overflow-hidden bg-white">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-gray-50 opacity-70" />

      <div className="relative pt-24 pb-32 sm:pt-32 sm:pb-40">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 text-left">
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 tracking-tight leading-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">
                  Sessionly
                </span>
                <br />
                Photographer's Session Management Platform
              </h1>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Streamline your photography business with elegant session
                management, seamless client booking, and integrated payments.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center px-8 py-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
                >
                  Create Your First Session
                  <ArrowUpRight className="ml-2 w-5 h-5" />
                </Link>

                <Link
                  href="#features"
                  className="inline-flex items-center px-8 py-4 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-lg font-medium"
                >
                  See How It Works
                </Link>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row items-start gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  <span>Custom session types</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <span>Flexible time slots</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-500" />
                  <span>Integrated payments</span>
                </div>
              </div>
            </div>

            <div className="lg:w-1/2 mt-12 lg:mt-0">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl blur opacity-20"></div>
                <div className="relative bg-white p-4 rounded-xl shadow-xl">
                  <img
                    src="https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&q=80"
                    alt="Calendar and Planning"
                    className="rounded-lg w-full h-auto"
                  />
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-lg mb-2">
                      Portrait Session
                    </h3>
                    <div className="flex justify-between text-sm text-gray-600 mb-3">
                      <span>60 minutes</span>
                      <span>$250</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {["10:00 AM", "1:00 PM", "3:30 PM"].map((time, i) => (
                        <div
                          key={i}
                          className="text-center py-2 bg-blue-100 text-blue-800 rounded-md text-sm font-medium"
                        >
                          {time}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
