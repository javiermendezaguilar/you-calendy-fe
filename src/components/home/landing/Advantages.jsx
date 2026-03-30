import React, { useState } from 'react';
import { Calendar, Users, Plus, FolderPen as BarberPole, FileText, Image, MessageSquare, CheckIcon, Notebook } from 'lucide-react';

function Advantages() {
  const [selectedService, setSelectedService] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('11:00');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [haircut, setHaircut] = useState('');
  const [messageText, setMessageText] = useState('');
  const [emailTitle, setEmailTitle] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [deliveryTimeline, setDeliveryTimeline] = useState('sendNow');
  const [deliveryMethod, setDeliveryMethod] = useState('optimized');

  const messagingFeatures = [
    "Send bulk messages for promotions & updates.",
    "Automated reminders for upcoming appointments.",
    "Ready-to-use SMS templates for quick communication.",
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">

      <div className="max-w-6xl mx-auto space-y-32">
        <h1 className="text-4xl font-bold text-center text-[#003B73] mb-3">Advantages</h1>
        <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
          Seamless tools designed to save your time and enhance client satisfaction.
        </p>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-8">
              <Calendar className="w-12 h-12 text-[#003B73]" />
            </div>

            <h2 className="text-3xl font-bold text-[#003B73] mb-6">
              Annoying calls outside work hours?
            </h2>

            <h3 className="text-xl font-semibold text-[#4A7B24] mb-4">Solution!</h3>

            <ul className="space-y-4">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>24/7 client self-booking.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Automated reminders reduce no-shows and keep your schedule organized</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Customize your calendar to fit your working hours and availability</span>
              </li>
            </ul>

            <div className="flex items-center gap-3 mt-8">
              <BarberPole className="w-6 h-6 text-[#003B73]" />
              <p className="font-medium">Focus on your craft — our app takes care of the rest!</p>
            </div>

            <a href="/registration" data-allow-without-login className="mt-8 inline-block bg-[#003B73] text-white px-6 py-3 rounded-md hover:bg-[#002855] focus:outline-none focus:ring-2 focus:ring-[#003B73] focus:ring-offset-2 transition-colors cursor-pointer">
              Sign Up Free
            </a>
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-8">
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-2">New Appointment</h3>
              <p className="text-gray-500 text-sm">
                Easily schedule a client for their next cut. Keep your calendar organized and your chair full.
              </p>
            </div>

            <div className="flex gap-4 mb-8">
              <button className="bg-black text-white px-4 py-2 rounded-md flex-1">
                Appointment
              </button>
              <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md flex-1">
                Notes & Info
              </button>
            </div>

            <div className="flex gap-4 mb-8">
              <button className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-md">
                <Plus className="w-4 h-4" />
                Add Another Service
              </button>
              <button className="flex items-center gap-2 bg-[#4A7B24] text-white px-4 py-2 rounded-md">
                <Users className="w-4 h-4" />
                Group Booking
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm text-gray-600 mb-2">Select Service</label>
                <select 
                  className="w-full p-3 border rounded-md bg-white"
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                >
                  <option value="">Select</option>
                  <option value="haircut">Haircut</option>
                  <option value="shave">Shave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Start</label>
                  <select 
                    className="w-full p-3 border rounded-md bg-white"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  >
                    <option value="">Select</option>
                    <option value="9:00">9:00</option>
                    <option value="10:00">10:00</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">End</label>
                  <select 
                    className="w-full p-3 border rounded-md bg-white"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  >
                    <option value="11:00">11:00</option>
                    <option value="12:00">12:00</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">Total</label>
                <div className="bg-gray-100 p-3 rounded-md">
                  <span className="font-semibold">${selectedService ? '25.00' : '0.00'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <h3 className="text-xl font-semibold mb-6">Add New Client</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-2">First Name</label>
                <input
                  type="text"
                  placeholder="Enter first name"
                  className="w-full p-3 border rounded-md"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Last Name</label>
                <input
                  type="text"
                  placeholder="Enter last name"
                  className="w-full p-3 border rounded-md"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Email</label>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="w-full p-3 border rounded-md"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Phone Number</label>
                <div className="flex gap-2">
                  <select className="w-20 p-3 border rounded-md">
                    <option value="us">🇺🇸 +1</option>
                  </select>
                  <input
                    type="tel"
                    placeholder="Your phone number"
                    className="flex-1 p-3 border rounded-md"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button className="flex-1 bg-gray-200 text-gray-800 px-4 py-3 rounded-md">
                  Add
                </button>
                <button className="flex-1 bg-black text-white px-4 py-3 rounded-md">
                  Add & Invite
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-8">
              <FileText className="w-12 h-12 text-[#4A7B24]" />
            </div>
            <h2 className="text-3xl font-bold text-[#003B73] mb-6">
              Struggling to remember client preferences?
            </h2>
            <h3 className="text-xl font-semibold text-[#4A7B24] mb-4">Solution!</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Store haircut history & personal preferences.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Add private notes for each client.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Quick access to client details before appointments.</span>
              </li>
            </ul>
            <div className="flex items-center gap-3 mt-8">
              <BarberPole className="w-6 h-6 text-[#003B73]" />
              <p className="font-medium">Personalized service = Happy & loyal clients!</p>
            </div>
            <a href="/registration" data-allow-without-login className="mt-8 inline-block bg-[#003B73] text-white px-6 py-3 rounded-md hover:bg-[#002855] focus:outline-none focus:ring-2 focus:ring-[#003B73] focus:ring-offset-2 transition-colors cursor-pointer">
              Sign Up Free
            </a>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-8">
              <MessageSquare className="w-12 h-12 text-[#003B73]" />
            </div>
            <h2 className="text-3xl font-bold text-[#003B73] mb-6">
              Clients Struggle To Explain What They Want
            </h2>
            <p className="text-gray-600 mb-4">Clients struggle to explain what they want?</p>
            <h3 className="text-xl font-semibold text-[#4A7B24] mb-4">Solution!</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Clients can upload images with booking requests.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Predefined haircut styles & descriptions for clarity.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Chat-based consultation before appointments.</span>
              </li>
            </ul>
            <div className="flex items-center gap-3 mt-8">
              <BarberPole className="w-6 h-6 text-[#003B73]" />
              <p className="font-medium">Understand clients better & deliver perfect results!</p>
            </div>
            <button className="mt-8 bg-[#003B73] text-white px-6 py-3 rounded-md hover:bg-[#002855] focus:outline-none focus:ring-2 focus:ring-[#003B73] focus:ring-offset-2 transition-colors cursor-pointer">
              Sign Up Free
            </button>
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-8">
            <h3 className="text-xl font-semibold mb-2">Personalize Your Haircut Experience</h3>
            <p className="text-gray-500 text-sm mb-8">
              Upload reference photos or provide specific instructions for your desired style.
            </p>

            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-medium mb-4">Upload Reference Photos</h4>
                <div className="bg-[#1B365D] rounded-lg p-8 text-center">
                  <Image className="w-8 h-8 text-white mx-auto mb-2" />
                  <p className="text-white text-sm">Add Photos</p>
                  <p className="text-gray-400 text-xs">size: 2MB, max</p>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-medium mb-4">Add Specific Haircut Instructions</h4>
                <textarea
                  className="w-full p-4 border rounded-lg h-32"
                  placeholder="Enter detailed instructions for your haircut"
                  value={haircut}
                  onChange={(e) => setHaircut(e.target.value)}
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <h3 className="text-xl font-semibold mb-6">Compose Your Message</h3>
            
            <div className="space-y-6">
              <div>
                <textarea 
                  className="w-full min-h-[120px] bg-[#f7f7f7] rounded-md border border-[#f3f3f3] text-base p-4 focus:outline-none focus:ring-2 focus:ring-[#003B73] focus:border-transparent resize-none"
                  placeholder="SMS/Push Text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                ></textarea>
              </div>

              <div>
                <input
                  type="text"
                  className="w-full h-[50px] bg-white rounded-md border border-gray-300 text-base px-4 focus:outline-none focus:ring-2 focus:ring-[#003B73] focus:border-transparent"
                  placeholder="Email Title"
                  value={emailTitle}
                  onChange={(e) => setEmailTitle(e.target.value)}
                />
              </div>

              <div>
                <textarea
                  className="w-full min-h-[120px] bg-white rounded-md border border-gray-300 text-base p-4 focus:outline-none focus:ring-2 focus:ring-[#003B73] focus:border-transparent resize-none"
                  placeholder="Email Content Here"
                  value={emailContent}
                  onChange={(e) => setEmailContent(e.target.value)}
                ></textarea>
              </div>

              <div className="w-full h-[120px] bg-[#1c315e] rounded-md flex items-center justify-center cursor-pointer hover:bg-[#162749] transition-colors">
                <div className="flex flex-col items-center gap-2">
                  <Image className="w-6 h-6 text-white" />
                  <span className="text-white text-sm">
                    Add header image
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-[#f1ffe9] rounded-md flex items-center justify-center">
                <MessageSquare className="w-7 h-7 text-[#4A7B24]" />
              </div>
            </div>

            <h2 className="text-3xl font-bold text-[#003B73] mb-6">
              Informing Clients About Closures Or Promotions Is Time Consuming?
            </h2>

            <h3 className="text-xl font-semibold text-[#4A7B24] mb-4">Solution!</h3>

            <ul className="space-y-4">
              {messagingFeatures.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-3 mt-8">
              <BarberPole className="w-6 h-6 text-[#003B73]" />
              <p className="font-medium">Keep clients engaged & increase repeat bookings!</p>
            </div>

            <button className="mt-8 bg-[#003B73] text-white px-6 py-3 rounded-md hover:bg-[#002855] focus:outline-none focus:ring-2 focus:ring-[#003B73] focus:ring-offset-2 transition-colors cursor-pointer">
              Sign Up Free
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Advantages;