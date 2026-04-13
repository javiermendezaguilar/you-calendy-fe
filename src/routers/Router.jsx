import { lazy, Suspense } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import AdminProtectedRoute from "../components/admin/AdminProtectedRoute";
import BarberProtectedRoute from "../components/barber/BarberProtectedRoute";
import BrandLoader from "../components/common/BrandLoader";
import HomeLayout from "../layouts/HomeLayout";
import LandingPage from "../pages/home/LandingPage";
import Login from "../pages/Auth/Login";
import Registration from "../pages/Auth/Registration";
const Configuration = lazy(() => import("../pages/Address/Configuration"));
const Location = lazy(() => import("../pages/Address/Location"));
const Details = lazy(() => import("../pages/Auth/Details"));
const Businesshour = lazy(() => import("../pages/Business-Hours/Businesshour"));
const Services = lazy(() => import("../pages/Services/services"));
const Plan = lazy(() => import("../pages/Welcome/Plan"));
const Welcome = lazy(() => import("../pages/Welcome/welcome"));
const ClientLayout = lazy(() => import("../layouts/ClientLayout"));
const ClientHomepage = lazy(() => import("../pages/Client/Homepage"));
const ClientProfile = lazy(() => import("../pages/Client/ClientProfile"));
const InvitationRedirect = lazy(() => import("../components/InvitationRedirect"));
const Profile = lazy(() => import("../pages/Profile/profile"));
const PublicBarberProfile = lazy(() => import("../pages/Barber/PublicBarberProfile"));
const UserClientManagement = lazy(() => import("../pages/Client-Section/ClientManagement"));
const HelpCenter = lazy(() => import("../pages/Support/HelpCenter"));
const TermsAndConditions = lazy(() => import("../pages/Support/TermsAndConditions"));
const PrivacyPolicy = lazy(() => import("../pages/Support/PrivacyPolicy"));
import AdminLogin from "../pages/Auth/AdminLogin";
import ForgotPassword from "../pages/Auth/ForgotPassword";
import ResetPassword from "../pages/Auth/ResetPassword";
const SessionExpired = lazy(() => import("../pages/SessionExpired"));
const PaymentPage = lazy(() => import("../pages/Payment/PaymentPage"));
const PaymentSuccess = lazy(() => import("../pages/Payment/PaymentSuccess"));
const PaymentFailure = lazy(() => import("../pages/Payment/PaymentFailure"));
const DashboardLayout = lazy(() => import("../layouts/DashboardLayout"));
const Appointment = lazy(() => import("../pages/Dashboard/Appointment"));
const CreateAppointment = lazy(() => import("../pages/Dashboard/CreateAppointment"));
const BusinessSettings = lazy(() => import("../pages/Business-Settings/businessSettings"));
const BusinessDetail = lazy(() => import("../pages/Business-Settings/businessDetails"));
const ServiceSetup = lazy(() => import("../pages/Business-Settings/serviceSetup"));
const AddServices = lazy(() => import("../pages/Business-Settings/addServices"));
const BusinessInfo = lazy(() => import("../pages/Business-Settings/BusinessInfo"));
const EditBusinessHours = lazy(() => import("../pages/Business-Settings/EditBusinessHours"));
const ProfileImages = lazy(() => import("../pages/Business-Settings/profileimages"));
const LocationPage = lazy(() => import("../pages/Business-Settings/LocationPage"));
const AutomatedReminders = lazy(() => import("../pages/Business-Settings/AutomatedReminders"));
const SuggestFeature = lazy(() => import("../pages/Suggest-Feature/suggest-feature"));
const Marketing = lazy(() => import("../pages/Dashboard/Marketing"));
const MessageBlast = lazy(() => import("../pages/Dashboard/MessageBlast"));
const Promotion = lazy(() => import("../pages/Dashboard/Promotion"));
const FlashSale = lazy(() => import("../pages/Dashboard/FlashSale"));
const AddYourClients = lazy(() => import("../pages/Client-Section/AddyourClients"));
const EditClient = lazy(() => import("../pages/Client-Section/EditClient"));
const ClientSection = lazy(() => import("../pages/Client-Section/ClientSection"));
const StaffManagement = lazy(() => import("../pages/Staff-Management/StaffManagement"));
const AddStaffMember = lazy(() => import("../pages/Staff-Management/AddStaffMember"));
const EditStaffMember = lazy(() => import("../pages/Staff-Management/EditStaffMember"));
const HappyHours = lazy(() => import("../pages/Dashboard/HappyHours"));
const Tickets = lazy(() => import("../pages/Support/Ticket"));
const CreateTicket = lazy(() => import("../pages/Support/CreateTicket"));
const AppointmentHistory = lazy(() => import("../pages/Appointment-History/AppointmentHistory"));
const ProfileSetting = lazy(() => import("../pages/Profile-Setting/ProfileSetting"));
const ClientsNote = lazy(() => import("../pages/ClientsNote/ClientsNote"));
const PurchaseCredits = lazy(() => import("../pages/Dashboard/PurchaseCredits"));
const CreditSuccess = lazy(() => import("../pages/Billing/CreditSuccess"));
const SubscriptionRequired = lazy(() => import("../pages/Subscription/SubscriptionRequired"));
const SubscriptionStatus = lazy(() => import("../pages/Dashboard/SubscriptionStatus"));
const AdminLayout = lazy(() => import("../layouts/AdminLayout"));
const AdminDashboard = lazy(() => import("../pages/Admin/AdminDashboard"));
const BarberManagement = lazy(() => import("../pages/Admin/BarberManagement"));
const ClientManagement = lazy(() => import("../pages/Admin/ClientManagement"));
const CreditManagement = lazy(() => import("../pages/Admin/CreditManagement"));
const SubscriptionManagement = lazy(() => import("../pages/Admin/SubscriptionManagement"));
const AdminProfile = lazy(() => import("../pages/Admin/AdminProfile"));
const BarberProfile = lazy(() => import("../pages/Admin/BarberProfile"));
const Support = lazy(() => import("../pages/Admin/Support"));
const Security = lazy(() => import("../pages/Admin/Security"));
const ProposedInterfaces = lazy(() => import("../pages/Admin/ProposedInterfaces"));

const Router = () => {
  return (
    <Suspense fallback={<BrandLoader label="Loading" fullscreen />}>
      <Routes>
      <Route path="/" element={<HomeLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/help-center" element={<HelpCenter />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      </Route>

      {/* barberside */}
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/registration" element={<Registration />} />
      <Route path="/details" element={<Details />} />
      <Route path="/configuration" element={<Configuration />} />
      <Route path="/location" element={<Location />} />
      <Route path="/business-hours" element={<Businesshour />} />
      <Route path="/services" element={<Services />} />
      <Route path="/welcome" element={<Welcome />} />
      <Route path="/plan" element={<Plan />} />
      
      {/* Payment Flow Routes */}
      <Route path="/payment" element={<PaymentPage />} />
      <Route path="/payment/success" element={<PaymentSuccess />} />
      <Route path="/payment/failure" element={<PaymentFailure />} />
  <Route path="/subscription-required" element={<SubscriptionRequired />} />

      <Route path="/dashboard" element={
        <BarberProtectedRoute>
          <DashboardLayout />
        </BarberProtectedRoute>
      }>
        <Route path="/dashboard" element={<Appointment />} />
        <Route
          path="/dashboard/create-appointment"
          element={<CreateAppointment />}
        />


        <Route path="/dashboard/marketing" element={<Marketing />} />
        <Route
          path="/dashboard/marketing/message-blast"
          element={<MessageBlast />}
        />
        <Route path="/dashboard/marketing/promotions" element={<Promotion />} />
        <Route
          path="/dashboard/marketing/promotions/flash-sale"
          element={<FlashSale />}
        />
        <Route
          path="/dashboard/marketing/promotions/happy-hours"
          element={<HappyHours />}
        />
        <Route path="/dashboard/clients" element={<UserClientManagement />} />
        <Route path="/dashboard/clients/invite" element={<ClientSection />} />



        <Route
          path="/dashboard/clients/add"
          element={<AddYourClients />}
        />
        <Route
          path="/dashboard/client-section/edit/:clientId"
          element={<EditClient />}
        />

        <Route
          path="/dashboard/staff-management"
          element={<StaffManagement />}
        />
        <Route
          path="/dashboard/staff-management/add-member"
          element={<AddStaffMember />}
        />
        <Route
          path="/dashboard/staff-management/edit-member/:id"
          element={<EditStaffMember />}
        />

        {/* <Route
          path="/dashboard/appointment-history"
          element={<AppointmentHistory />}
        /> */}

        <Route path="/dashboard/profile" element={<Profile />} />
        <Route
          path="/dashboard/business-setting"
          element={<BusinessSettings />}
        />
        <Route
          path="/dashboard/business-setting/details"
          element={<BusinessDetail />}
        />
        <Route
          path="/dashboard/business-setting/business-info"
          element={<BusinessInfo />}
        />
        <Route
          path="/dashboard/business-setting/business-hours"
          element={<EditBusinessHours />}
        />
        <Route
          path="/dashboard/business-setting/profile-images"
          element={<ProfileImages />}
        />
        <Route
          path="/dashboard/business-setting/location"
          element={<LocationPage />}
        />
        <Route
          path="/dashboard/business-setting/appointment-reminders"
          element={<AutomatedReminders />}
        />
        <Route
          path="/dashboard/business-setting/service-setup"
          element={<ServiceSetup />}
        />
        <Route path="/dashboard/support" element={<Tickets />} />
        <Route path="/dashboard/create-ticket" element={<CreateTicket />} />
        <Route
          path="/dashboard/business-setting/add-service"
          element={<AddServices />}
        />
        <Route
          path="/dashboard/suggest-feature"
          element={<SuggestFeature />}
        />

        <Route
          path="/dashboard/setting"
          element={<ProfileSetting />}
        />

        <Route
          path="/dashboard/clients-note"
          element={<ClientsNote />}
        />
        <Route
          path="/dashboard/purchase-credits"
          element={<PurchaseCredits />}
        />
        <Route
          path="/dashboard/subscription-status"
          element={<SubscriptionStatus />}
        />
      </Route>
      
      {/* Billing Routes */}
      <Route path="/billing/credits" element={
        <BarberProtectedRoute>
          <CreditSuccess />
        </BarberProtectedRoute>
      } />
      
      {/* client side */}
      <Route path="/client" element={<ClientLayout />}>
        <Route path="/client" element={<ClientHomepage />} />
        <Route path="/client/profile" element={<ClientProfile />} />
        <Route path="/client/invitation/:token" element={<InvitationRedirect />} />
      </Route>
      
      {/* Public barber profile */}
      <Route path="/barber/profile/:linkToken" element={<PublicBarberProfile />} />
      
       {/* Admin Side */}
      {/* /admin is always the login page */}
      <Route path="/admin/login" element={<Navigate to="/admin" replace />} />
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      {/* Protected admin routes - all routes under /admin/* except /admin itself */}
      <Route path="/admin" element={
        <AdminProtectedRoute>
          <AdminLayout />
        </AdminProtectedRoute>
      }>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/barber-management" element={<BarberManagement />} />
        <Route path="/admin/barber-profile/:id" element={<BarberProfile />} />
        <Route path="/admin/client-management" element={<ClientManagement />} />
        <Route path="/admin/credit-management" element={<CreditManagement />} />
        <Route path="/admin/platform-settings" element={<SubscriptionManagement />} />
        <Route path="/admin/support-and-communication" element={<Support />} />
        <Route path="/admin/security-and-auditing" element={<Security />} />
        <Route path="/admin/setting" element={<AdminProfile />} />
        <Route path="/admin/proposed-interfaces" element={<ProposedInterfaces />} />
      </Route>
      
      {/* Session expired route */}
      <Route path="/session-expired" element={<SessionExpired />} />
      <Route path="/client-session-expired" element={<SessionExpired />} />
      </Routes>
    </Suspense>
  );
};

export default Router;
