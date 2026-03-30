# You Calendy - Frontend    
 
A modern, responsive React application for appointment scheduling and business management. Built with React 19, Vite, and Mantine UI, this frontend provides a seamless experience for barbershops, salons, and service-based businesses to manage appointments, clients, staff, marketing campaigns, and analytics.

## 🎯 Overview

You Calendy Frontend is a SaaS application that serves multiple user roles:
- **Admin**: Platform-wide management and analytics
- **Barber/Business Owner**: Business management, scheduling, and marketing
- **Client**: Appointment booking and profile management

The application features real-time updates, multi-language support, push notifications, and a comprehensive dashboard for business insights.

## ✨ Key Features

### 📅 Appointment Management
- **Interactive Calendar View**: Visual appointment scheduling with drag-and-drop capabilities
- **Time Slot Selection**: Dynamic availability based on staff schedules and service requirements
- **Appointment Status Tracking**: Real-time status updates (Pending, Confirmed, Completed, Canceled, No-Show)
- **Manual Booking**: Barbers can create appointments with custom pricing
- **Client Self-Booking**: Public booking interface for clients
- **Appointment History**: Complete history with filtering and search

### 👥 Client Management
- **Client Portal**: Dedicated interface for clients to manage appointments
- **Profile Management**: Complete client profiles with photo galleries
- **Client Notes**: Private notes and history tracking
- **Bulk Import**: CSV upload for client management
- **Two-Step Onboarding**: SMS invitation system with profile completion flow

### 👨‍💼 Staff Management
- **Staff Scheduling**: Flexible working hours with service-specific intervals
- **Break Management**: Define lunch breaks and unavailable periods
- **Schedule Replication**: Bulk copy schedules across multiple days
- **Performance Analytics**: Individual staff metrics and insights

### 💼 Business Management
- **Business Profile**: Complete business information and settings
- **Service Catalog**: Create and manage services with pricing
- **Business Hours**: Configure multiple shifts per day
- **Gallery Management**: Upload and showcase business photos
- **Location Management**: Address configuration with map integration

### 📧 Marketing & Communication
- **Email Campaigns**: Create and send targeted email campaigns
- **SMS Campaigns**: Bulk SMS messaging to clients
- **Message Blast**: Custom messaging to selected client groups
- **Promotions**: Create and manage promotional offers
- **Flash Sales**: Time-limited sales and discounts
- **Happy Hours**: Special time-based promotions

### 📊 Analytics & Reporting
- **Dashboard Analytics**: Revenue tracking and projections
- **Appointment Analytics**: Booking trends and completion rates
- **Staff Performance**: Individual staff metrics
- **Client Analytics**: Engagement and retention metrics
- **Interactive Charts**: ApexCharts integration for data visualization
- **Export Functionality**: PDF and CSV export capabilities

### 🌐 Multi-Language Support
- **2 Languages**: English and Spanish
- **i18next Integration**: Powered by i18next and react-i18next
- **Auto-Detection**: Browser language detection on first visit (defaults to English)
- **Language Persistence**: User language preference stored in localStorage
- **Language Switcher**: Easy language selection in UI

### 🔔 Notifications
- **Push Notifications**: Firebase Cloud Messaging integration
- **Real-time Updates**: Socket.io for live notifications
- **Notification Center**: Centralized notification management
- **Email Notifications**: Automated email alerts
- **SMS Notifications**: Twilio integration for SMS alerts

### 💳 Subscription & Credits
- **Subscription Management**: View and manage subscription plans
- **Credit Purchase**: Buy credits for SMS and email campaigns
- **Payment Integration**: Stripe payment processing
- **Subscription Status**: Real-time subscription tracking

### 🛡️ Security & Authentication
- **JWT Authentication**: Secure token-based authentication with httpOnly cookies
- **Role-Based Access Control**: Protected routes for different user roles
- **Session Management**: Automatic session validation and logout
- **Auto-Logout**: Security feature for inactive sessions

## 🏗️ Tech Stack

### Core Framework
- **React** 19.0.0 - UI library
- **Vite** 6.2.0 - Build tool and dev server
- **React Router** 7.4.1 - Client-side routing

### UI & Styling
- **Mantine UI** 7.17.7 - Primary component library
  - `@mantine/core` - Core components
  - `@mantine/dates` - Date pickers
  - `@mantine/form` - Form management
  - `@mantine/hooks` - Custom hooks
  - `@mantine/modals` - Modal dialogs
  - `@mantine/notifications` - Toast notifications
  - `@mantine/carousel` - Image carousels
- **Tailwind CSS** 4.1.2 - Utility-first CSS framework
- **PostCSS** 8.5.3 - CSS processing
- **Framer Motion** 12.23.0 - Animation library

### State Management
- **Redux Toolkit** 2.2.6 - State management
- **React Query (TanStack Query)** 5.74.4 - Server state management
- **Redux Persist** 6.0.0 - State persistence
- **React Redux** 9.1.2 - React bindings for Redux

### Data Fetching & API
- **Axios** 1.9.0 - HTTP client
- **React Query DevTools** 5.74.4 - Development tools

### Forms
- **Mantine Form** - Primary form solution
- **React Hook Form** 7.55.0 - Alternative form library

### Internationalization
- **i18next** 25.6.0 - Internationalization framework
- **react-i18next** 16.1.4 - React bindings for i18next

### Date & Time
- **Moment.js** 2.30.1 - Date manipulation
- **date-fns** 4.1.0 - Date utility library
- **dayjs** 1.11.13 - Lightweight date library

### Charts & Visualization
- **ApexCharts** 4.7.0 - Chart library
- **react-apexcharts** 1.7.0 - React wrapper for ApexCharts

### Maps
- **Leaflet** 1.9.4 - Interactive maps
- **react-leaflet** 5.0.0 - React wrapper for Leaflet
- **leaflet-defaulticon-compatibility** 0.1.2 - Icon compatibility

### Icons
- **@tabler/icons-react** 3.31.0 - Tabler icons
- **tabler-icons-react** 1.56.0 - Alternative Tabler icons
- **lucide-react** 0.487.0 - Lucide icons
- **react-icons** 5.5.0 - Popular icon libraries

### Utilities
- **clsx** 2.1.1 - Conditional class names
- **html2canvas** 1.4.1 - Screenshot generation
- **jspdf** 3.0.2 - PDF generation
- **papaparse** 5.5.3 - CSV parsing
- **react-phone-input-2** 2.15.1 - Phone number input

### Analytics
- **react-ga4** 2.1.0 - Google Analytics 4 integration

### Notifications
- **sonner** 2.0.3 - Toast notifications
- **Firebase** 11.6.0 - Push notifications (FCM)

### Tables
- **mantine-react-table** 2.0.0-beta.9 - Advanced data tables

## 📁 Project Structure

```
you-calendy-fe/
├── public/                 # Static assets
│   ├── assets/            # Images and icons
│   └── vite.svg           # Vite logo
│
├── src/
│   ├── assets/           # Application assets (images, etc.)
│   │
│   ├── components/       # Reusable React components
│   │   ├── admin/       # Admin-specific components
│   │   ├── barber/      # Barber-specific components
│   │   │   ├── appointment/    # Appointment-related components
│   │   │   ├── clientBarberSelection/  # Client selection components
│   │   │   └── marketing/     # Marketing components
│   │   ├── client/      # Client-specific components
│   │   ├── common/      # Shared/common components
│   │   ├── home/        # Landing page components
│   │   │   └── landing/ # Landing page sections
│   │   ├── icons/       # Icon components
│   │   ├── layout/      # Layout components (navbar, sidebar, etc.)
│   │   ├── modals/      # Modal dialogs
│   │   └── support/     # Support-related components
│   │
│   ├── configs/         # Configuration files
│   │   ├── axios.config.js      # Axios instance configuration
│   │   ├── firebase.config.js   # Firebase configuration
│   │   └── query.config.jsx     # React Query configuration
│   │
│   ├── constants/       # Application constants
│   │   └── currencyOptions.js
│   │
│   ├── contexts/        # React contexts
│   │   ├── AnalyticsContext.jsx
│   │   └── BatchTranslationContext.jsx
│   │
│   ├── hooks/          # Custom React hooks
│   │   ├── useAdmin.js
│   │   ├── useAnalytics.js
│   │   ├── useAppointments.js
│   │   ├── useAuth.js
│   │   ├── useAuthManager.js
│   │   ├── useBatchTranslation.js
│   │   ├── useBusiness.js
│   │   ├── useClientProfile.js
│   │   ├── useClients.js
│   │   ├── useFeatureSuggestion.js
│   │   ├── useForgotPassword.js
│   │   ├── useGallery.js
│   │   ├── useLogin.js
│   │   ├── useMarketing.js
│   │   ├── useNotifications.js
│   │   ├── usePlans.js
│   │   ├── useRegister.js
│   │   ├── useServices.js
│   │   ├── useStaff.js
│   │   ├── useSubscription.js
│   │   └── useSupport.js
│   │
│   ├── layouts/        # Layout components
│   │   ├── AdminLayout.jsx
│   │   ├── ClientLayout.jsx
│   │   ├── DashboardLayout.jsx
│   │   └── HomeLayout.jsx
│   │
│   ├── pages/         # Page components
│   │   ├── Address/          # Address configuration pages
│   │   ├── Admin/            # Admin pages
│   │   ├── Appointment-History/  # Appointment history
│   │   ├── Auth/             # Authentication pages
│   │   ├── Barber/           # Barber pages
│   │   ├── Billing/          # Billing pages
│   │   ├── Business-Hours/   # Business hours configuration
│   │   ├── Business-Settings/ # Business settings pages
│   │   ├── Client/           # Client pages
│   │   ├── Client-Section/   # Client management
│   │   ├── ClientsNote/      # Client notes
│   │   ├── Dashboard/        # Dashboard pages
│   │   ├── home/             # Landing page
│   │   ├── Payment/          # Payment pages
│   │   ├── Profile/          # Profile pages
│   │   ├── Profile-Setting/  # Profile settings
│   │   ├── Services/         # Services management
│   │   ├── Staff-Management/ # Staff management
│   │   ├── Subscription/     # Subscription pages
│   │   ├── Suggest-Feature/  # Feature suggestions
│   │   ├── Support/         # Support pages
│   │   └── Welcome/         # Welcome/onboarding pages
│   │
│   ├── routers/       # Route definitions
│   │   └── Router.jsx
│   │
│   ├── services/     # API service layer
│   │   ├── adminAPI.js
│   │   ├── analytics.js
│   │   ├── appointmentAPI.js
│   │   ├── batchTranslationService.js
│   │   ├── businessAPI.js
│   │   ├── businessPublicAPI.js
│   │   ├── clientAPI.js
│   │   ├── contextDetectionService.js
│   │   ├── creditsAPI.js
│   │   ├── geocodingAPI.js
│   │   ├── googleAnalyticsConfig.js
│   │   ├── hooks.js
│   │   ├── penaltyService.js
│   │   ├── plansAPI.js
│   │   ├── supportAPI.js
│   │   ├── textExtractionService.js
│   │   └── translationAPI.js
│   │
│   ├── store/        # Redux store
│   │   ├── registrationSlice.js
│   │   └── store.js
│   │
│   ├── utils/       # Utility functions
│   │   ├── apiErrorHandler.js
│   │   ├── authManager.js
│   │   ├── authUtils.js
│   │   ├── autoLogout.js
│   │   ├── exportUtils.js
│   │   ├── invitationUtils.js
│   │   ├── localStorageSafety.js
│   │   ├── notificationLocalization.js
│   │   ├── translationUtils.js
│   │   └── userDataSanitizer.js
│   │
│   ├── App.jsx      # Main App component
│   ├── App.css      # Global styles
│   ├── i18n.js      # i18next configuration
│   ├── index.css    # Global CSS
│   └── main.jsx     # Application entry point
│
├── .env              # Environment variables (not committed)
├── eslint.config.js  # ESLint configuration
├── index.html        # HTML template
├── package.json      # Dependencies and scripts
├── postcss.config.mjs # PostCSS configuration
├── vite.config.js    # Vite configuration
└── vercel.json       # Vercel deployment configuration
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 14.0.0
- **npm** or **yarn**
- **Backend API** running (see backend documentation)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd you-calendy-fe
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**

   Create a `.env` file in the root directory:
   ```env
   # API Configuration
   VITE_API_URL=http://localhost:5000
   # or for production:
   # VITE_API_URL=https://you-calendy-be.up.railway.app

   # Firebase Configuration (for push notifications)
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

## 📜 Available Scripts

### Development
- `npm run dev` - Start development server with hot module replacement
- `npm run preview` - Preview production build locally

### Production
- `npm run build` - Build for production (outputs to `dist/` folder)

### Code Quality
- `npm run lint` - Run ESLint to check code quality

## 🏛️ Architecture

### State Management

The application uses a hybrid approach to state management:

1. **Redux Toolkit** - For global application state
   - User authentication state
   - Registration flow state
   - Persistent state with Redux Persist

2. **React Query (TanStack Query)** - For server state
   - API data fetching
   - Caching and synchronization
   - Background updates
   - Optimistic updates

### Routing

The application uses **React Router v7** with:
- **Protected Routes**: Role-based route protection
  - `AdminProtectedRoute` - Admin-only routes
  - `BarberProtectedRoute` - Barber/Business owner routes
- **Public Routes**: Landing page, authentication, public barber profiles
- **Client Routes**: Client portal routes

### Authentication Flow

1. **Login**: User credentials sent to backend
2. **Token Storage**: JWT tokens stored in httpOnly cookies (secure, not accessible via JavaScript)
3. **User Data**: Sanitized user data stored in localStorage
4. **Session Validation**: Automatic session validation on API calls
5. **Auto-Logout**: Automatic logout on session expiration or 401 errors

### API Communication

- **Axios Instances**: 
  - Standard JSON API instance
  - Form data API instance (for file uploads)
- **Interceptors**: 
  - Request: Add authentication headers, client ID headers
  - Response: Handle 401 errors, auto-logout, error tracking
- **Cookie-based Auth**: All requests include credentials (cookies) automatically

### Internationalization

- **i18next** with **react-i18next** for translations
- **2 Languages**: English and Spanish
- **Batch Translation Context**: Custom context for dynamic translations
- **Language Detection**: Browser language detection on first visit (defaults to English)
- **Language Persistence**: User language preference stored in localStorage

### Component Architecture

- **Layout Components**: Provide structure (AdminLayout, DashboardLayout, ClientLayout)
- **Page Components**: Full-page views
- **Reusable Components**: Shared across multiple pages
- **Feature Components**: Specific to features (appointments, marketing, etc.)

### Styling Approach

- **Mantine UI**: Primary component library with built-in styling
- **Tailwind CSS**: Utility classes for custom styling
- **CSS Modules**: Component-specific styles when needed
- **Responsive Design**: Mobile-first approach with breakpoints

## 🔑 Key Features Implementation

### Real-time Notifications
- Firebase Cloud Messaging for push notifications
- Socket.io for real-time updates
- Notification center with filtering and marking as read

### Data Export
- PDF generation using jsPDF
- CSV export using PapaParse
- Screenshot generation using html2canvas

### Form Handling
- Mantine Form for most forms
- React Hook Form for complex forms
- Validation with custom rules

### Charts & Analytics
- ApexCharts for data visualization
- Interactive charts with drill-down capabilities
- Export charts as images

### Maps Integration
- Leaflet for interactive maps
- Location selection and display
- Geocoding integration

## 🌍 Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### Deployment Platforms

#### Vercel (Recommended)
1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

#### Netlify
1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Configure environment variables

#### Other Static Hosting
1. Build the project: `npm run build`
2. Upload the `dist` folder to your hosting service
3. Configure environment variables
4. Set up redirect rules for client-side routing (all routes → `index.html`)

### Environment Variables for Production

Ensure all environment variables are set in your hosting platform:
- `VITE_API_URL` - Backend API URL
- `VITE_FIREBASE_*` - Firebase configuration

## 🧪 Development Guidelines

### Code Style
- Use functional components with hooks
- Follow React best practices
- Use TypeScript-like prop validation with PropTypes (if needed)
- Keep components small and focused

### File Naming
- Components: PascalCase (e.g., `AppointmentCard.jsx`)
- Utilities: camelCase (e.g., `authManager.js`)
- Constants: camelCase (e.g., `currencyOptions.js`)

### Component Structure
```jsx
// 1. Imports
import React from 'react';
import { Button } from '@mantine/core';

// 2. Component definition
const MyComponent = ({ prop1, prop2 }) => {
  // 3. Hooks
  const [state, setState] = useState();
  
  // 4. Effects
  useEffect(() => {
    // Effect logic
  }, []);
  
  // 5. Handlers
  const handleClick = () => {
    // Handler logic
  };
  
  // 6. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
};

export default MyComponent;
```

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Errors**
   - Verify `VITE_API_URL` is correct
   - Check CORS settings on backend
   - Ensure backend is running

2. **Authentication Issues**
   - Clear cookies and localStorage
   - Check token expiration
   - Verify backend authentication endpoint

3. **Build Errors**
   - Clear `node_modules` and reinstall
   - Check for missing environment variables
   - Verify all dependencies are installed

4. **Translation Issues**
   - Check browser console for translation errors
   - Verify translation keys exist
   - Check language detection logic

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Mantine UI Documentation](https://mantine.dev/)
- [React Query Documentation](https://tanstack.com/query)
- [React Router Documentation](https://reactrouter.com/)


**Built with ❤️ for service-based businesses**
#   y o u - c a l e n d y - f e  
 "# you-calendy-fe" 
"# you-calendy-fe" 
"# you-calendy-fe" 
"# you-calendy-fe" 
