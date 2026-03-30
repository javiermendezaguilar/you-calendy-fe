import { Route, Routes, Navigate } from "react-router-dom";
import LandingPage from "../pages/home/LandingPage";
import HomeLayout from "../layouts/HomeLayout";
import Login from "../pages/Auth/Login";
import Registration from "../pages/Auth/Registration";
import Configuration from "../pages/Address/Configuration";
import Location from "../pages/Address/Location";
import Details from "../pages/Auth/Details";
import Businesshour from "../pages/Business-Hours/Businesshour";
import Services from "../pages/Services/services";
import Plan from "../pages/Welcome/Plan";
import Welcome from "../pages/Welcome/welcome";
import Appointment from "../pages/Dashboard/Appointment";
import DashboardLayout from "../layouts/DashboardLayout";
import ClientLayout from "../layouts/ClientLayout";
import ClientHomepage from "../pages/Client/Homepage";
import ClientProfile from "../pages/Client/ClientProfile";
import InvitationRedirect from "../components/InvitationRedirect";
import CreateAppointment from "../pages/Dashboard/CreateAppointment";
import Profile from "../pages/Profile/profile";
import PublicBarberProfile from "../pages/Barber/PublicBarberProfile";
import BusinessSettings from "../pages/Business-Settings/businessSettings";
import BusinessDetail from "../pages/Business-Settings/businessDetails";
import ServiceSetup from "../pages/Business-Settings/serviceSetup";
import AddServices from "../pages/Business-Settings/addServices";
import BusinessInfo from "../pages/Business-Settings/BusinessInfo";
import EditBusinessHours from "../pages/Business-Settings/EditBusinessHours";
import ProfileImages from "../pages/Business-Settings/profileimages";
import LocationPage from "../pages/Business-Settings/LocationPage";
import AutomatedReminders from "../pages/Business-Settings/AutomatedReminders";
import SuggestFeature from "../pages/Suggest-Feature/suggest-feature";
import Marketing from "../pages/Dashboard/Marketing";
import MessageBlast from "../pages/Dashboard/MessageBlast";
import Promotion from "../pages/Dashboard/Promotion";
import FlashSale from "../pages/Dashboard/FlashSale";
import AddYourClients from "../pages/Client-Section/AddyourClients";
import EditClient from "../pages/Client-Section/EditClient";
import ClientSection from "../pages/Client-Section/ClientSection";
import StaffManagement from "../pages/Staff-Management/StaffManagement";
import AddStaffMember from "../pages/Staff-Management/AddStaffMember";
import EditStaffMember from "../pages/Staff-Management/EditStaffMember";
import HappyHours from "../pages/Dashboard/HappyHours";
import Tickets from "../pages/Support/Ticket";
import CreateTicket from "../pages/Support/CreateTicket";
import AppointmentHistory from "../pages/Appointment-History/AppointmentHistory";
import ProfileSetting from "../pages/Profile-Setting/ProfileSetting";
import ClientsNote from "../pages/ClientsNote/ClientsNote";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import AdminLayout from "../layouts/AdminLayout";
import BarberManagement from "../pages/Admin/BarberManagement";
import ClientManagement from "../pages/Admin/ClientManagement";
import CreditManagement from "../pages/Admin/CreditManagement";
import UserClientManagement from "../pages/Client-Section/ClientManagement";
import SubscriptionManagement from "../pages/Admin/SubscriptionManagement";
import AdminProfile from "../pages/Admin/AdminProfile";
import BarberProfile from "../pages/Admin/BarberProfile";
import Support from "../pages/Admin/Support";
import Security from "../pages/Admin/Security";
import ProposedInterfaces from "../pages/Admin/ProposedInterfaces";
import HelpCenter from "../pages/Support/HelpCenter";
import TermsAndConditions from "../pages/Support/TermsAndConditions";
import PrivacyPolicy from "../pages/Support/PrivacyPolicy";
import AdminLogin from "../pages/Auth/AdminLogin";
import ForgotPassword from "../pages/Auth/ForgotPassword";
import ResetPassword from "../pages/Auth/ResetPassword";
import AdminProtectedRoute from "../components/admin/AdminProtectedRoute";
import BarberProtectedRoute from "../components/barber/BarberProtectedRoute";
import SessionExpired from "../pages/SessionExpired";
import PaymentPage from "../pages/Payment/PaymentPage";
import PaymentSuccess from "../pages/Payment/PaymentSuccess";
import PaymentFailure from "../pages/Payment/PaymentFailure";
import PurchaseCredits from "../pages/Dashboard/PurchaseCredits";
import CreditSuccess from "../pages/Billing/CreditSuccess";
import SubscriptionRequired from "../pages/Subscription/SubscriptionRequired";
import SubscriptionStatus from "../pages/Dashboard/SubscriptionStatus";

const Router = () => {
  return (
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
  );
};

export default Router;
