import Footer from "@/components/footer";
import Hero from "@/components/hero";
import Navbar from "@/components/navbar";
import {
  ArrowUpRight,
  Calendar,
  Clock,
  CreditCard,
  Image,
  MapPin,
  Users,
} from "lucide-react";
import { createClient } from "../../supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Streamline Your Photography Business
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Sessionly helps photographers manage bookings, clients, and
              payments in one elegant platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Calendar className="w-6 h-6" />,
                title: "Session Management",
                description:
                  "Create custom sessions with flexible time slots and pricing",
              },
              {
                icon: <Clock className="w-6 h-6" />,
                title: "Availability Control",
                description:
                  "Set your schedule and let clients book only when you're free",
              },
              {
                icon: <Users className="w-6 h-6" />,
                title: "Client Experience",
                description:
                  "Provide a seamless booking experience for your clients",
              },
              {
                icon: <CreditCard className="w-6 h-6" />,
                title: "Integrated Payments",
                description: "Collect retainers and track payments with Stripe",
              },
              {
                icon: <Image className="w-6 h-6" />,
                title: "Portfolio Showcase",
                description: "Display your work alongside booking options",
              },
              {
                icon: <MapPin className="w-6 h-6" />,
                title: "Location Management",
                description: "Set and share session locations with clients",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-blue-600 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2">
              <h2 className="text-3xl font-bold mb-6">
                Powerful Dashboard for Photographers
              </h2>
              <p className="text-gray-600 mb-6">
                Track your sessions, earnings, and client interactions all in
                one place. Our intuitive dashboard gives you a complete overview
                of your photography business.
              </p>
              <ul className="space-y-3">
                {[
                  "View upcoming sessions at a glance",
                  "Track earnings and payment status",
                  "Monitor client interactions and activity",
                  "Manage availability and bookings",
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <div className="mr-2 mt-1 text-green-500">✓</div>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:w-1/2 bg-gray-100 rounded-xl p-4 shadow-md">
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80"
                alt="Dashboard Preview"
                className="rounded-lg w-full h-auto shadow-sm"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Photography Business?
          </h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Join photographers who are streamlining their booking process and
            delighting clients.
          </p>
          <a
            href="/dashboard"
            className="inline-flex items-center px-8 py-4 text-blue-600 bg-white rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            Start Creating Sessions
            <ArrowUpRight className="ml-2 w-5 h-5" />
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
