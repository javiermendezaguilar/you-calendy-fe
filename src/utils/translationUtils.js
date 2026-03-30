import { translateText, translateBatch } from '../services/translationAPI';

// Common UI text that needs translation
export const COMMON_TEXTS = {
  // Dashboard
  appointments: 'Appointments',
  timeBooked: 'Time Booked',
  confirmed: 'Confirmed',
  finished: 'Finished',
  noShows: 'No Shows',
  cancelled: 'Cancelled',
  
  // Navigation
  dashboard: 'Dashboard',
  marketing: 'Marketing',
  clients: 'Clients',
  staffManagement: 'Staff & Management',
  businessSettings: 'Business Settings',
  purchaseCredits: 'Purchase Credits',
  support: 'Support',
  profile: 'Profile',
  
  // Actions
  save: 'Save',
  cancel: 'Cancel',
  delete: 'Delete',
  edit: 'Edit',
  add: 'Add',
  create: 'Create',
  update: 'Update',
  submit: 'Submit',
  close: 'Close',
  
  // Status
  active: 'Active',
  inactive: 'Inactive',
  
  // Client Table
  actions: 'Actions',
  assignedStaff: 'Assigned Staff',
  notAssigned: 'Not assigned',
  resend: 'Resend',
  resendInvitationSMS: 'Resend invitation SMS',
  idLabel: 'ID',
  activated: 'Activated',
  deactivated: 'Deactivated',
  activate: 'Activate',
  deactivate: 'Deactivate',
  pending: 'Pending',
  completed: 'Completed',
  failed: 'Failed',
  
  // Messages
  loading: 'Loading...',
  noData: 'No data available',
  error: 'Error',
  success: 'Success',
  warning: 'Warning',
  
  // Marketing
  growYourBusiness: 'Grow Your Business with Smart Marketing',
  marketingDescription: 'Use targeted messaging and promotions to engage clients, boost retention, and drive sales.',
  messageBlast: 'Message Blast',
  messageBlastDescription: 'Stay top of mind with your clients through quick and effective messaging.',
  promotions: 'Promotions',
  promotionsDescription: 'Leverage promotion tools to attract and engage your clients.',
  
  // Staff Management
  manageYourTeam: 'Manage Your Team',
  manageYourTeamDescription: 'View your staff list, add new team members, and organize your barbers effortlessly.',
  addNewMember: 'Add New Member',
  searchByNameEmail: 'Search by name & email address',
  sortBy: 'Sort by',
  filter: 'Filter',
  filterStaff: 'Filter Staff',
  workingDay: 'Working Day',
  selectWorkingDay: 'Select working day',
  position: 'Position',
  selectPosition: 'Select position',
  reset: 'Reset',
  apply: 'Apply',
  viewDetails: 'View Details',
  all: 'All',
  unread: 'Unread',
  read: 'Read',
  notification: 'Notification',
  neverMissUpdate: 'Never Miss an Important Update',
  markAsAllRead: 'Mark as all read',
  logoutConfirmation: 'Logout Confirmation',
  areYouSureLogout: 'Are you sure you want to logout?',
  cancel: 'Cancel',
  logout: 'Logout',
  profileSettings: 'Profile Settings',
  
  // Client Management
  addYourClients: 'Add Your Clients',
  addYourClientsDescription: 'Register new clients to manage their services seamlessly. Keep track of appointments and purchase history.',
  addClient: 'Add Client',
  uploadingProcessingCSV: 'Uploading and processing CSV file...',
  readyToImport: 'Ready to import',
  importing: 'IMPORTING...',
  importClient: 'IMPORT CLIENT',
  selectCSVFile: 'SELECT CSV FILE',
  bringClientsOnboard: 'Bring Your Clients Onboard By Uploading CSV',
  importClientDetails: 'Import client details seamlessly for quick access and better organization.',
  
  // Business Settings
  servicesComboServices: 'Services & Combo Services',
  businessInformation: 'Business Information',
  businessInformationDescription: 'Customize your business profile, update location settings, and create forms tailored to your customers.',
  setUpServices: 'Set Up Services',
  setUpServicesDescription: 'Provide service details, customize preferences, and group them for better visibility.',
  
  // Business Details
  businessDetail: 'Business Detail',
  goBack: 'Go Back',
  businessOverview: 'Business Overview',
  businessOverviewDescription: 'Introduce your business, add contact details, and connect your social profiles.',
  workingHours: 'Working Hours',
  workingHoursDescription: 'Share your availability so customers can schedule appointments easily.',
  uploadYourPhoto: 'Upload Your Photo',
  uploadYourPhotoDescription: 'Customize your profile with a logo, workspace images, and a cover photo.',
  officeLocation: 'Office Location',
  officeLocationDescription: 'Set your location, service areas, and map preferences to ensure accurate availability.',
  invalidCoordinatesDetected: 'Invalid coordinates detected. Please reposition the pin before saving.',
  
  // Clients Note
  clientsNotes: 'Clients Notes',
  clientsNotesDescription: 'Track personal notes, preferences, and feedback for each client.',
  clientName: 'Client Name',
  phoneNumber: 'Phone Number',
  lastVisit: 'Last Visit',
  viewSuggestion: 'View Suggestion',
  viewReport: 'View Report',
  issueReport: 'Issue Report',
  suggestionNote: 'Suggestion Note',
  from: 'From',
  issueDescription: 'Issue Description:',
  suggestion: 'Suggestion:',
  rating: 'Rating:',
  client: 'Client',
  phone: 'Phone',
  respondHere: 'Respond Here',
  send: 'Send',
  noDataAvailable: 'No data available',
  
  // Support
  createNewTicket: 'Create New Ticket',
  submitRequestGetSupport: 'Submit a Request & Get Support',
  fullName: 'Full name',
  emailAddress: 'Email Address',
  subject: 'Subject',
  enterSubject: 'Enter the subject',
  description: 'Description',
  describeYourIssue: 'Describe your issue',
  create: 'Create',
  enterSubjectError: 'Enter subject.',
  enterDescriptionError: 'Enter description.',
  
  // Suggest Feature
  suggestFeature: 'Suggest a Feature',
  submit: 'Submit',
  suggestFeatureDescription: 'Suggest an improvement or new feature to make YouCalendy truly feel tailored to you',
  featureTitle: 'Feature Title',
  writeHere: 'Write here',
  featureDescription: 'Feature Description',
  describeHere: 'Describe here',
  titleMinLengthError: 'Title must have at least 2 letters',
  descriptionMinLengthError: 'Description must have at least 2 letters',
  
  // Profile
  addGallery: 'Add Gallery',
  addGalleryDescription: 'Use your Portfolio to show off your skills and set yourself apart from the rest. Easily upload photos from Instagram or your device.',
  uploadFromInstagram: 'Upload From Instagram',
  uploadFromDevice: 'Upload From Device',
  
  // Support Tickets
  yourTicket: 'Your Ticket',
  createNewTicketForSupport: 'Create a new ticket for support',
  noTicketsYet: 'You have no tickets yet! Create one by hitting the Create Button',
  createTicket: 'Create Ticket',
  yourTicketNotification: 'Your Ticket Notification',
  activeTickets: 'You have {count} active ticket{s}',
  noActiveTickets: 'No active tickets',
  recentTickets: 'Recent Tickets',
  postedOn: 'Posted on',
  yourQuestion: 'Your question:',
  noRepliesYet: 'No replies yet from the support team.',
  repliesFromSupportTeam: 'Replies from Support Team',
  resolvedOn: 'Resolved on',
  by: 'by',
  
  // Profile Settings
  userProfile: 'User Profile',
  saveChanges: 'Save Changes',
  chooseFile: 'Choose File',
  remove: 'Remove',
  fullName: 'Full Name',
  email: 'Email',
  passwordSecurity: 'Password & Security',
  passwordRequirements: 'Your password must be at least 6 characters and should include a combination of uppercase letters, lowercase letters, and numbers.',
  currentPassword: 'Current Password',
  newPassword: 'New Password',
  confirmNewPassword: 'Confirm New Password',
  
  // Dashboard & Appointments
  appointmentsOccupancy: 'Appointments & Occupancy',
  revenueProjection: 'Revenue Projection',
  totalRevenue: 'Total Revenue',
  totalAppointments: 'Total Appointments',
  avgPerAppointment: 'Avg per Appointment',
  months: 'Months',
  days: 'Days',
  viewYearlyOverview: 'View yearly overview',
  noDataAvailable: 'No data available',
  errorLoadingRevenueData: 'Error loading revenue data',
  askForFeedbackTrigger: 'Ask for Feedback Trigger',
  sendReviewRequest: 'Would you like to send a review request to the {clientName} via SMS?',
  yes: 'Yes',
  no: 'No',
  confirm: 'Confirm',
  automatedReminders: 'Automated Reminders',
  remindersEnabled: 'Reminders Enabled',
  reminderTime: 'Reminder Time',
  customMessage: 'Custom Message',
  save: 'Save',
  cancel: 'Cancel',
  
  // Notifications & Client Management
  notifyOfDelay: 'Notify of Delay',
  sendDelayMessage: 'Send a delay message to one or more clients scheduled for today.',
  selectClients: 'Select Clients',
  message: 'Message',
  newDate: 'New Date',
  newStartTime: 'New Start Time',
  messageMinLength: 'Message must have at least 3 letters',
  newDateRequired: 'New date is required',
  newStartTimeRequired: 'New start time is required',
  selectAtLeastOneClient: 'Please select at least one client',
  send: 'Send',
  client: 'Client',
  email: 'Email',
  phone: 'Phone',
  
  // Additional Dashboard & Calendar
  loadingClients: 'Loading clients...',
  noClientsAvailable: 'No clients available',
  rescheduleDetails: 'Reschedule Details',
  writeYourMessage: 'Write Your Message',
  penaltyFor: 'Penalty for {clientName}',
  amount: 'Amount',
  timePenalty: 'Time Penalty',
  comment: 'Comment',
  uploadHaircutPhoto: 'Upload Haircut Photo',
  
  // Staff Management
  editStaffMember: 'Edit Staff Member',
  addStaffMember: 'Add Staff Member',
  staffMemberDetails: 'Staff Member Details',
  personalInformation: 'Personal Information',
  contactInformation: 'Contact Information',
  workingSchedule: 'Working Schedule',
  services: 'Services',
  permissions: 'Permissions',
  firstName: 'First Name',
  lastName: 'Last Name',
  phoneNumber: 'Phone Number',
  address: 'Address',
  position: 'Position',
  hourlyRate: 'Hourly Rate',
  workingDays: 'Working Days',
  startTime: 'Start Time',
  endTime: 'End Time',
  assignedServices: 'Assigned Services',
  selectServices: 'Select Services',
  adminAccess: 'Admin Access',
  canManageAppointments: 'Can Manage Appointments',
  canManageClients: 'Can Manage Clients',
  canViewReports: 'Can View Reports',
  
  // Services
  serviceHours: 'Service hours',
  serviceName: 'Service Name',
  servicePrice: 'Service Price',
  serviceDuration: 'Service Duration',
  serviceDescription: 'Service Description',
  
  // Welcome & Landing
  welcomeToYouCalendy: 'Welcome to YouCalendy',
  manageYourBusiness: 'Manage Your Business',
  getStarted: 'Get Started',
  chooseYourPlan: 'Choose Your Plan',
  planFeatures: 'Plan Features',
  monthlyBilling: 'Monthly Billing',
  yearlyBilling: 'Yearly Billing',
  startFreeTrial: 'Start Free Trial',
  subscription: 'Subscription',
  subscriptionStatus: 'Subscription Status',
  currentPlan: 'Current Plan',
  trialDaysLeft: 'Trial Days Left',
  upgradePlan: 'Upgrade Plan',
  viewPlans: 'View Plans',
  daysRemaining: 'days remaining',
  nextBillingDate: 'Next Billing Date',
  subscriptionIssues: 'Subscription Issues',
  noActiveSubscription: 'No active subscription',
  renewsOn: 'Renews on',
  changePlan: 'Change Plan',
  planPriceBilling: 'Plan price & billing',
  
  // Client Components
  profileCompletion: 'Profile Completion',
  completeYourProfile: 'Complete Your Profile',
  profileInformation: 'Profile Information',
  preferences: 'Preferences',
  notifications: 'Notifications',
  privacySettings: 'Privacy Settings',
  
  // Common Actions
  loading: 'Loading...',
  saving: 'Saving...',
  updating: 'Updating...',
  deleting: 'Deleting...',
  searching: 'Searching...',
  filtering: 'Filtering...',
  sorting: 'Sorting...',
  refreshing: 'Refreshing...',
  
  // Status Messages
  success: 'Success',
  error: 'Error',
  warning: 'Warning',
  info: 'Information',
  successMessage: 'Operation completed successfully',
  errorMessage: 'An error occurred',
  warningMessage: 'Please check your input',
  infoMessage: 'Please note this information',
  
  // Time & Date
  today: 'Today',
  yesterday: 'Yesterday',
  tomorrow: 'Tomorrow',
  thisWeek: 'This Week',
  thisMonth: 'This Month',
  thisYear: 'This Year',
  lastWeek: 'Last Week',
  lastMonth: 'Last Month',
  lastYear: 'Last Year',
  nextWeek: 'Next Week',
  nextMonth: 'Next Month',
  nextYear: 'Next Year',
  
  // Validation Messages
  required: 'This field is required',
  invalidEmail: 'Please enter a valid email address',
  invalidPhone: 'Please enter a valid phone number',
  invalidDate: 'Please enter a valid date',
  invalidTime: 'Please enter a valid time',
  minLength: 'Must be at least {min} characters',
  maxLength: 'Must be no more than {max} characters',
  passwordMismatch: 'Passwords do not match',
  invalidFormat: 'Invalid format',
  
  // Navigation & UI
  back: 'Back',
  next: 'Next',
  previous: 'Previous',
  continue: 'Continue',
  finish: 'Finish',
  skip: 'Skip',
  retry: 'Retry',
  reload: 'Reload',
  refresh: 'Refresh',
  close: 'Close',
  open: 'Open',
  expand: 'Expand',
  collapse: 'Collapse',
  show: 'Show',
  hide: 'Hide',
  more: 'More',
  less: 'Less',
  
  // Data & Lists
  noData: 'No data available',
  noResults: 'No results found',
  emptyState: 'Nothing to display',
  loadingData: 'Loading data...',
  failedToLoad: 'Failed to load data',
  tryAgain: 'Try again',
  refreshPage: 'Refresh page',
  
  // Confirmation & Modals
  confirmAction: 'Confirm Action',
  areYouSure: 'Are you sure?',
  thisActionCannotBeUndone: 'This action cannot be undone',
  proceed: 'Proceed',
  cancel: 'Cancel',
  delete: 'Delete',
  remove: 'Remove',
  archive: 'Archive',
  restore: 'Restore',
  duplicate: 'Duplicate',
  copy: 'Copy',
  paste: 'Paste',
  cut: 'Cut',
  undo: 'Undo',
  redo: 'Redo',
  
  // Search & Filter
  search: 'Search',
  searchPlaceholder: 'Search...',
  filter: 'Filter',
  sort: 'Sort',
  clear: 'Clear',
  reset: 'Reset',
  apply: 'Apply',
  all: 'All',
  none: 'None',
  selectAll: 'Select All',
  deselectAll: 'Deselect All',
  
  // Pagination
  page: 'Page',
  of: 'of',
  showing: 'Showing',
  to: 'to',
  entries: 'entries',
  perPage: 'per page',
  goToPage: 'Go to page',
  firstPage: 'First page',
  lastPage: 'Last page',
  previousPage: 'Previous page',
  nextPage: 'Next page',
  
  // Topbar & Navigation
  welcomeToYouCalendyManagement: 'Welcome to YouCalendy Management',
  dashboard: 'Dashboard',
  appointment: 'Appointment',
  viewDetails: 'View Details',
  sendAReviewRequest: 'Send a Review Request',
  generateCustomGoogleReviewLink: 'Generate a custom Google review link and send it to your client to get feedback',
  selectClient: 'Select Client',
  writeMessage: 'Write Message',
  markAsAllRead: 'Mark as all read',
  linkGenerated: 'Link Generated',
  clientReview: 'Client Review',
  defaultReviewMessage: 'Hey {clientName}, thank you for visiting! Would you mind leaving us a quick review on Google? It really helps us a lot!',
  
  // Client Management
  clientManagement: 'Client Management',
  addNewClient: 'Add New Client',
  editClient: 'Edit Client',
  deleteClient: 'Delete Client',
  clientDetails: 'Client Details',
  clientList: 'Client List',
  searchClients: 'Search Clients',
  filterClients: 'Filter Clients',
  sortClients: 'Sort Clients',
  exportClients: 'Export Clients',
  importClients: 'Invite Clients',
  clientHistory: 'Client History',
  clientNotes: 'Client Notes',
  clientPreferences: 'Client Preferences',
  clientAppointments: 'Client Appointments',
  clientServices: 'Client Services',
  clientBilling: 'Client Billing',
  addAndInvite: 'Invite',
  addClientDescription: 'Add a client with their phone number and assign them to a staff member. They\'ll receive an SMS invitation to complete their profile.',
  generalInfo: 'General Info',
  additionalInfo: 'Additional Info',
  phoneNumberRequired: 'Phone number is required',
  selectStaffMember: 'Please select a staff member',
  
  // Client Management Additional
  clientDirectory: 'Client Directory',
  manageClientsAppointments: 'Manage your clients and their appointments.',
  filterOptions: 'Filter Options',
  clientName: 'Client Name',
  searchByName: 'Search by name',
  itemsPerPage: 'Items per page',
  name: 'Name',
  emailAddress: 'Email Address',
  status: 'Status',
  notFilledYet: 'Not Filled Yet',
  noNotesYet: 'No notes yet',
  inactive: 'Inactive',
  
  // File Upload & CSV
  dragAndDropCSV: 'Drag and drop your CSV file here, or click to browse',
  browseFiles: 'Browse Files',
  uploadFile: 'Upload File',
  fileUploaded: 'File uploaded successfully',
  uploadFailed: 'Upload failed',
  invalidFileType: 'Invalid file type. Please select a CSV file.',
  fileTooLarge: 'File too large. Please select a smaller file.',
  processingFile: 'Processing file...',
  fileProcessed: 'File processed successfully',
  
  // Common UI Elements
  loading: 'Loading...',
  saving: 'Saving...',
  updating: 'Updating...',
  deleting: 'Deleting...',
  searching: 'Searching...',
  filtering: 'Filtering...',
  sorting: 'Sorting...',
  refreshing: 'Refreshing...',
  processing: 'Processing...',
  uploading: 'Uploading...',
  downloading: 'Downloading...',
  exporting: 'Exporting...',
  importing: 'Importing...',
  
  // Status & Messages
  success: 'Success',
  error: 'Error',
  warning: 'Warning',
  info: 'Information',
  successMessage: 'Operation completed successfully',
  errorMessage: 'An error occurred',
  warningMessage: 'Please check your input',
  infoMessage: 'Please note this information',
  noDataAvailable: 'No data available',
  noResultsFound: 'No results found',
  nothingToDisplay: 'Nothing to display',
  failedToLoad: 'Failed to load data',
  tryAgain: 'Try again',
  refreshPage: 'Refresh page',
  
  // Actions & Buttons
  add: 'Add',
  edit: 'Edit',
  delete: 'Delete',
  save: 'Save',
  cancel: 'Cancel',
  confirm: 'Confirm',
  submit: 'Submit',
  close: 'Close',
  open: 'Open',
  view: 'View',
  download: 'Download',
  upload: 'Upload',
  export: 'Export',
  import: 'Import',
  search: 'Search',
  filter: 'Filter',
  sort: 'Sort',
  clear: 'Clear',
  reset: 'Reset',
  apply: 'Apply',
  back: 'Back',
  next: 'Next',
  previous: 'Previous',
  continue: 'Continue',
  finish: 'Finish',
  skip: 'Skip',
  retry: 'Retry',
  reload: 'Reload',
  refresh: 'Refresh',
};

// Batch translate common texts
export const translateCommonTexts = async (targetLang) => {
  if (targetLang === 'en') return COMMON_TEXTS;
  
  const texts = Object.values(COMMON_TEXTS);
  const translatedTexts = await translateBatch(texts, targetLang);
  
  const translatedCommonTexts = {};
  Object.keys(COMMON_TEXTS).forEach((key, index) => {
    translatedCommonTexts[key] = translatedTexts[index];
  });
  
  return translatedCommonTexts;
};

// Get translated text by key
export const getTranslatedText = (key, translatedTexts, fallback = key) => {
  return translatedTexts?.[key] || fallback;
};

// Preload common translations for better performance
export const preloadTranslations = async (targetLang) => {
  try {
    const translatedTexts = await translateCommonTexts(targetLang);
    return translatedTexts;
  } catch (error) {
    console.error('Failed to preload translations:', error);
    return COMMON_TEXTS; // Fallback to English
  }
};

// Utility function to automatically translate text elements
export const translateElement = (text, targetLang, fallback = text) => {
  if (targetLang === 'en') return text;
  
  // For now, return the text as is - translation will be handled by the API
  // This function can be enhanced to include local translations or caching
  return text;
};

// Utility function to wrap text elements with translation
export const wrapWithTranslation = (text, className = "", props = {}) => {
  return {
    type: 'translated',
    text,
    className,
    props
  };
};
