import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import batchTranslationService from '../services/batchTranslationService';
import textExtractionService from '../services/textExtractionService';
import contextDetectionService from '../services/contextDetectionService';
import { formAxios } from '../configs/axios.config';
import dayjs from 'dayjs';
import { DatesProvider } from '@mantine/dates';
import 'dayjs/locale/es'; // Import Spanish locale for calendar dates
import 'dayjs/locale/en'; // Import English locale

// Common texts that are used across multiple pages
const COMMON_TEXTS = [
  'Dashboard', 'Appointments', 'Clients', 'Marketing', 'Settings',
  'Profile', 'Logout', 'Save', 'Cancel', 'Delete', 'Edit', 'Add',
  'Create', 'Update', 'Confirm', 'Close', 'Back', 'Next', 'Previous',
  'Submit', 'Search', 'Filter', 'Sort', 'Refresh', 'Loading...',
  'Error', 'Success', 'Warning', 'Information', 'Active', 'Inactive',
  'Pending', 'Completed', 'Cancelled', 'Approved', 'Rejected',
  'Today', 'Yesterday', 'Tomorrow', 'This Week', 'Last Week',
  'This Month', 'Last Month', 'Barber Dashboard', 'Appointment Management',
  'Client Management', 'Service Setup', 'Business Settings', 'Notifications',
  'Reports', 'Analytics', 'Calendar', 'Schedule', 'Availability',
  'Services', 'Pricing', 'Gallery', 'Reviews', 'Earnings', 'Payments',
  'Invoices', 'Tax', 'Expenses', 'First Name', 'Last Name', 'Email',
  'Phone', 'Address', 'City', 'State', 'Zip Code', 'Country',
  'Password', 'Confirm Password', 'New Password', 'Current Password',
  'Remember Me', 'Forgot Password?', 'Sign In', 'Sign Up', 'Sign Out',
  'Welcome to your dashboard', 'No data found', 'No results found',
  'Please try again', 'Something went wrong', 'Operation completed successfully',
  'Operation failed', 'Are you sure?', 'This action cannot be undone',
  'Please wait...', 'Processing...', 'Uploading...', 'Downloading...',
  'This field is required', 'Please enter a valid email address',
  'Please enter a valid phone number', 'Passwords do not match',
  'Password must be at least 8 characters', 'Invalid format',
  'Date', 'Time', 'Start Time', 'End Time', 'Duration',
  'Appointment Date', 'Appointment Time', 'Client Name', 'Client Email',
  'Client Phone', 'Client Address', 'Client History', 'Client Notes',
  'Client Preferences', 'Service Name', 'Service Description',
  'Service Price', 'Service Duration', 'Service Category',
  'Business Name', 'Business Address', 'Business Phone', 'Business Email',
  'Business Hours', 'Business Description', 'Select Language', 'Language',
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese',
  'Russian', 'Chinese', 'Japanese', 'Korean', 'Arabic', 'Hindi',
  'Notification', 'Notifications', 'Mark all as read', 'No notifications',
  'New notification', 'Profile Settings', 'Account Settings',
  'Personal Information', 'Contact Information', 'Security Settings',
  'Privacy Settings', 'Preferences', 'Logout Confirmation',
  'Are you sure you want to logout?', 'Write Message', 'Select Client',
  'Send Message', 'Message History', 'New Message', 'Link Generated',
  'Copy Link', 'Share Link', 'Never Miss an Important Update',
  'dashboard', 'businessSettings', 'appointment', 'logoutConfirmation',
  'areYouSureLogout', 'cancel', 'logout', 'sendReviewRequest',
  'generateCustomGoogleReviewLink', 'selectClient', 'viewDetails',
  'notification', 'profileSettings', 'timeBooked', 'confirmed',
  'finished', 'noShows', 'noShow', 'generateReviewLink', 'autoReminders',
  'notifyOfDelay', 'newAppointment', 'generateReviewLinkTooltip',
  'autoRemindersTooltip', 'notifyDelayTooltip', 'newAppointmentTooltip',
  'Choose File', 'Remove', 'Full Name', 'Support', 'Suggest Feature',
  'User Profile', 'Save Changes', 'No changes to save', 'Profile updated successfully',
  'Failed to update profile', 'Welcome to YouCalendy Management Panel', 'No description added'
];

// Translation key to English text mapping
const TRANSLATION_KEYS = {
  // Navigation
  'dashboard': 'Dashboard',
  'appointments': 'Appointments',
  'clients': 'Clients',
  'marketing': 'Marketing',
  'settings': 'Settings',
  'profile': 'Profile',
  'purchaseCredits': 'Purchase Credits',
  'currentPlan': 'Current Plan',
  'trialDaysLeft': 'Trial Days Left',
  'upgradePlan': 'Upgrade Plan',
  'viewPlans': 'View Plans',
  'daysRemaining': 'days remaining',
  'nextBillingDate': 'Next Billing Date',
  'subscriptionIssues': 'Subscription Issues',
  'noActiveSubscription': 'No active subscription',
  'renewsOn': 'Renews on',
  'changePlan': 'Change Plan',
  'planPriceBilling': 'Plan price & billing',
  'resolveNow': 'Resolve Now',
  'youAreCurrentlyOnFreeTrial': 'You are currently on a free trial.',

  // Client Management
  'creditManagement': 'Credit Management',
  'creditPackageManagement': 'Credit Package Management',
  'addNewPackage': 'Add New Package',
  'createCreditPackage': 'Create Credit Package',
  'editCreditPackage': 'Edit Credit Package',
  'deleteCreditPackage': 'Delete Credit Package',
  'packageTitle': 'Package Title',
  'packageDescription': 'Package Description',
  'price': 'Price',
  'currency': 'Currency',
  'smsCredits': 'SMS Credits',
  'emailCredits': 'Email Credits',
  'package': 'Package',
  'actions': 'Actions',
  'confirmDeletePackage': 'Are you sure you want to delete this credit package?',
  'packageCreatedSuccessfully': 'Credit package created successfully',
  'packageUpdatedSuccessfully': 'Credit package updated successfully',
  'packageDeletedSuccessfully': 'Credit package deleted successfully',
  'failedToCreatePackage': 'Failed to create credit package',
  'failedToUpdatePackage': 'Failed to update credit package',
  'failedToDeletePackage': 'Failed to delete credit package',
  'failedToLoadPackages': 'Failed to load credit packages',
  'manageCreditPackagesDescription': 'Manage credit packages and pricing',
  'packageName': 'Package Name',
  'enterPackageName': 'Enter package name',
  'enterPackageDescription': 'Enter package description',
  'enterPrice': 'Enter price',
  'credits': 'Credits',
  'enterCredits': 'Enter credits',
  'type': 'Type',
  'selectType': 'Select type',
  'both': 'Both',
  'enterSmsCredits': 'Enter SMS credits',
  'enterEmailCredits': 'Enter Email credits',
  'atLeastOneCreditRequired': 'Enter at least one non-zero SMS or Email credit value',
  'active': 'Active',
  'packageAvailableForPurchase': 'Package available for purchase',
  'noPackagesFound': 'No packages found',
  'createFirstPackage': 'Create your first package',
  'thisActionCannotBeUndone': 'This action cannot be undone',
  'nameRequired': 'Name is required',
  'descriptionRequired': 'Description is required',
  'priceRequired': 'Price must be greater than 0',
  'creditsRequired': 'Credits must be greater than 0',
  'typeRequired': 'Type is required',
  'apiEndpointNotFound': 'API endpoint not found',
  'authenticationRequired': 'Authentication required',
  'developmentMode': 'Development Mode',
  'checkBackendServer': 'Check backend server at',
  'manageClientsAppointments': 'Manage Clients & Appointments',
  'searchClients': 'Search clients...',
  'sortClients': 'Sort Clients',
  'filterClients': 'Filter Clients',
  'filterOptionsText': 'Filter Options',
  'searchByName': 'Search by name...',
  'name': 'Name',
  'emailAddress': 'Email Address',
  'status': 'Status',
  'inactive': 'Inactive',
  'noNotesYet': 'No notes yet',
  'of': 'of',
  'entries': 'entries',
  'itemsPerPageText': 'items per page',
  'importClients': 'Invite Clients',
  'addNewClient': 'Add New Client',

  // Common Actions
  'save': 'Save',
  'delete': 'Delete',
  'edit': 'Edit',
  'add': 'Add',
  'create': 'Create',
  'update': 'Update',
  'confirm': 'Confirm',
  'close': 'Close',
  'back': 'Back',
  'next': 'Next',
  'previous': 'Previous',
  'submit': 'Submit',
  'search': 'Search',
  'filter': 'Filter',
  'sort': 'Sort',
  'refresh': 'Refresh',
  'error': 'Error',
  'success': 'Success',
  'warning': 'Warning',
  'info': 'Information',

  // Status
  'pending': 'Pending',
  'completed': 'Completed',
  'cancelled': 'Cancelled',
  'approved': 'Approved',
  'rejected': 'Rejected',

  // Time
  'today': 'Today',
  'yesterday': 'Yesterday',
  'tomorrow': 'Tomorrow',
  'thisWeek': 'This Week',
  'lastWeek': 'Last Week',
  'thisMonth': 'This Month',
  'lastMonth': 'Last Month',

  // Barber specific
  'barberDashboard': 'Barber Dashboard',
  'appointmentManagement': 'Appointment Management',
  'serviceSetup': 'Service Setup',
  'businessSettings': 'Business Settings',
  'reports': 'Reports',
  'analytics': 'Analytics',
  'calendar': 'Calendar',
  'schedule': 'Schedule',
  'availability': 'Availability',
  'services': 'Services',
  'pricing': 'Pricing',
  'gallery': 'Gallery',
  'earnings': 'Earnings',
  'payments': 'Payments',
  'invoices': 'Invoices',
  'tax': 'Tax',
  'expenses': 'Expenses',

  // Appointment Calendar specific
  'before': 'before',

  // Penalty Modal
  'penaltyFor': 'Penalty for {clientName}',
  'selectPenaltyType': 'Select Penalty Type',
  'money': 'Money',
  'timePenalty': 'Time Penalty',
  'amount': 'Amount',
  'comment': 'Comment',
  'explainPenaltyReason': 'Explain the reason for the penalty...',
  '15minutes': '15 minutes',
  '30minutes': '30 minutes',
  '45minutes': '45 minutes',
  '1hour': '1 hour',
  'penaltyTypeRequired': 'Penalty type is required',
  'amountRequired': 'Amount is required',
  'timePenaltyRequired': 'Time penalty is required',
  'commentRequired': 'Comment is required',

  // Form labels
  'firstName': 'First Name',
  'lastName': 'Last Name',
  'email': 'Email',
  'phone': 'Phone',
  'address': 'Address',
  'city': 'City',
  'state': 'State',
  'zipCode': 'Zip Code',
  'country': 'Country',
  'password': 'Password',
  'confirmPassword': 'Confirm Password',
  'newPassword': 'New Password',
  'currentPassword': 'Current Password',
  'rememberMe': 'Remember Me',
  'forgotPassword': 'Forgot Password?',
  'signIn': 'Sign In',
  'signUp': 'Sign Up',
  'signOut': 'Sign Out',
  'enterEmailToSignIn': 'Enter your email address to sign in',
  'dontHaveAccount': "Don't have an account?",
  'alreadyHaveAccount': 'Already have an account?',
  'accountNotFound': 'Account not found. Please create an account.',
  'signInSuccessful': 'Signed in successfully',
  'errorSigningIn': 'Error signing in. Please try again.',

  // Messages
  'welcomeMessage': 'Welcome to your dashboard',
  'noDataFound': 'No data found',
  'noResultsFound': 'No results found',
  'tryAgain': 'Please try again',
  'somethingWentWrong': 'Something went wrong',
  'operationSuccessful': 'Operation completed successfully',
  'operationFailed': 'Operation failed',
  'areYouSure': 'Are you sure?',
  'pleaseWait': 'Please wait...',
  'processing': 'Processing...',
  'uploading': 'Uploading...',
  'downloading': 'Downloading...',

  // Service assignment
  'serviceNotAssignedToAnyStaff': 'This service is not assigned to any staff member yet',
  'goToStaffManagementToAssignService': 'Go to Staff Management to assign this service to staff',

  // Validation messages
  'required': 'This field is required',
  'businessNameRequired': 'Business name is required',
  'pleaseSelectWorkType': 'Please select work type',
  'addressRequired': 'Address is required',
  'addressTooShort': 'Address is too short',
  'serviceNameRequired': 'Service name is required',
  'serviceTypeRequired': 'Service type is required',
  'serviceTypeTooShort': 'Service type must be at least 2 characters',
  'durationCannotBeZero': 'Duration cannot be zero',
  'priceMustBeNumber': 'Price must be a number',
  'priceCannotBeNegative': 'Price cannot be negative',
  'onlyJpegPngAllowed': 'Only JPEG and PNG images are allowed',
  'endTimeMustBeAfterStartTime': 'End time must be after start time',
  'shiftsCannotOverlap': 'Shifts cannot overlap',
  'instagram': 'Instagram',
  'facebook': 'Facebook',
  'shortDescriptionPlaceholder': 'Short description for your business (recommended)',
  'invalidEmail': 'Please enter a valid email address',
  'invalidPhone': 'Please enter a valid phone number',
  'invalidProfileLinkFormat': 'Invalid profile link format',
  'passwordMismatch': 'Passwords do not match',
  'passwordTooShort': 'Password must be at least 8 characters',
  'invalidFormat': 'Invalid format',

  // Create Appointment validation
  'serviceIsRequired': 'Service is required',
  'staffIsRequired': 'Staff is required',
  'dateIsRequired': 'Date is required',
  'startTimeMustBeSelected': 'A start time must be selected',
  'pleaseSelectClient': 'Please select a client',
  'couldNotFindServiceDetails': 'Could not find selected service details.',
  'appointmentCreated': 'Appointment Created!',
  'appointmentSuccessfullyScheduled': 'Your appointment has been successfully scheduled.',

  // Client Form validation
  'phoneNumberRequired': 'Phone number is required',
  'pleaseSelectStaffMember': 'Please select a staff member',
  'pleaseSelectStaff': 'Please select a staff member',
  'staffSelectedSuccessfully': 'Staff member selected successfully',
  'errorLoadingStaff': 'Error loading staff members',
  'selectStaffMember': 'Select a staff member',
  'addAndInvite': 'Invite',
  'selectClients': 'Select Clients',
  'rescheduleDetails': 'Reschedule Details',
  'newDate': 'New Date',
  'newStartTime': 'New Start Time',
  // NotifyClient.jsx specific additions
  'sendDelayMessage': 'Send a delay message to one or more clients scheduled for today.',
  'noClientsAvailable': 'No clients available',
  'newDateRequired': 'New date is required',
  'newStartTimeRequired': 'New start time is required',
  'contactInfo': 'Contact Info',

  // Date and time
  'date': 'Date',
  'time': 'Time',
  'startTime': 'Start Time',
  'endTime': 'End Time',
  'duration': 'Duration',
  'appointmentDate': 'Appointment Date',

  // Client related (duplicate removed)
  'clientEmail': 'Client Email',
  'clientPhone': 'Client Phone',
  'clientAddress': 'Client Address',
  'clientHistory': 'Client History',
  'clientNotes': 'Client Notes',
  'clientPreferences': 'Client Preferences',

  // Service related
  'serviceName': 'Service Name',
  'serviceDescription': 'Service Description',
  'servicePrice': 'Service Price',
  'serviceDuration': 'Service Duration',
  'serviceCategory': 'Service Category',

  // Business related
  'businessName': 'Business Name',
  'businessAddress': 'Business Address',
  'businessPhone': 'Business Phone',
  'businessEmail': 'Business Email',
  'businessHours': 'Business Hours',
  'businessDescription': 'Business Description',

  // Language selector
  'selectLanguage': 'Select Language',
  'language': 'Language',
  'english': 'English',
  'spanish': 'Spanish',
  'french': 'French',
  'german': 'German',
  'italian': 'Italian',
  'portuguese': 'Portuguese',
  'russian': 'Russian',
  'chinese': 'Chinese',
  'japanese': 'Japanese',
  'korean': 'Korean',
  'arabic': 'Arabic',
  'hindi': 'Hindi',

  // Notification
  'markAllAsRead': 'Mark all as read',
  'pleaseLoginToViewNotifications': 'Please log in to view notifications',
  'newNotification': 'New notification',
  'notificationPreferences': 'Notification Preferences',
  'receiveNotifications': 'Receive Notifications',
  'customizeAlertsDescription': 'Customize alerts for applications, reviews, and updates to suit your needs.',

  // Profile settings
  'profileSettings': 'Profile Settings',
  'accountSettings': 'Account Settings',
  'personalInformation': 'Personal Information',
  'contactInformation': 'Contact Information',
  'securitySettings': 'Security Settings',
  'privacySettings': 'Privacy Settings',
  'preferences': 'Preferences',

  // Logout

  // Message

  'selectClient': 'Select Client',
  'messageHistory': 'Message History',
  'newMessage': 'New Message',

  // Link generated
  'linkGenerated': 'Link Generated',
  'shareLink': 'Share Link',

  // Never miss updates
  'neverMissImportantUpdate': 'Never Miss an Important Update',

  // Marketing
  'growYourBusiness': 'Grow Your Business',
  'marketingDescription': 'Explore marketing tools to expand your client base',
  'messageBlast': 'Message Blast',
  'messageBlastDescription': 'Send bulk messages to your clients',
  'promotions': 'Promotions',
  'promotionsDescription': 'Create and manage promotional offers',

  // Support/Tickets
  'createNewTicketForSupport': 'Create a new ticket for support',
  'noTicketsYet': 'No tickets yet. Create your first one!',
  'createTicket': 'Create Ticket',
  'noActiveTickets': 'No active tickets',
  'noRepliesYet': 'No replies yet',
  'repliesFromSupportTeam': 'Replies from Support Team',
  'recentTickets': 'Recent Tickets',
  'postedOn': 'Posted on',
  'yourQuestion': 'Your Question',
  'resolvedOn': 'Resolved on',
  'by': 'by',
  'admin': 'Admin',

  // Status translations
  'statusPending': 'Pending',
  'statusResolved': 'Resolved',
  'statusCompleted': 'Completed',

  // Priority translations
  'priorityCritical': 'Critical',
  'priorityHigh': 'High',
  'priorityMedium': 'Medium',
  'priorityLow': 'Low',

  // Client Notes
  'clientsNotes': 'Clients Notes',
  'clientsNotesDescription': 'View and manage client suggestions and reports',
  'phoneNumber': 'Phone Number',
  'privateNotesOptional': 'Private Notes (Optional)',
  'enterAdditionalNotes': 'Enter your additional notes',
  'clientWillBeAssociated': 'The client will be associated with this staff member and receive an SMS invitation to complete their profile.',
  'lastVisit': 'Last Visit',
  'viewSuggestion': 'View Suggestion',
  'viewReport': 'View Report',
  'issueReport': 'Issue Report',
  'suggestionNote': 'Suggestion Note',
  'from': 'from',
  'issueDescription': 'Issue Description',
  'suggestion': 'Suggestion',
  'noContentAvailable': 'No content available',
  'rating': 'Rating',
  'barberResponse': 'Barber response',
  'respondHere': 'Respond here...',
  'pleaseEnterAResponse': 'Please enter a response',
  'responseSent': 'Response sent',
  'send': 'Send',
  'suggestionNotes': 'Suggestion Notes',
  'issueReports': 'Issue Reports',
  'noSuggestionNotesFound': 'No suggestion notes found',
  'noIssueReportsFound': 'No issue reports found',
  'clientSuggestion': 'Client Suggestion',
  'failedToReportImage': 'Failed to report image',

  // View details

  // Staff Management
  'staffManagement': 'Staff Management',
  'manageYourTeam': 'Manage Your Team',
  'manageYourTeamDescription': 'Add, edit, and manage your staff members',
  'addNewMember': 'Add New Member',
  'searchByNameEmail': 'Search by name or email...',
  'sortBy': 'Sort By',
  'sortByField': 'Sort by field',
  'filterStaff': 'Filter Staff',
  'workingDay': 'Working Day',
  'selectWorkingDay': 'Select working day',
  'position': 'Position',
  'selectPosition': 'Select position',
  'reset': 'Reset',
  'apply': 'Apply',
  'memberName': 'Member Name',
  'workingHours': 'Working Hours',
  'timeInterval': 'Time Interval (minutes)',
  'enterTimeInterval': 'Enter time interval in minutes',
  'timeIntervalMustBeBetween5And120Minutes': 'Time interval must be between 5 and 120 minutes',
  'bookingBuffer': 'Booking Buffer',
  'enterBookingBufferMinutes': 'Enter minutes (0–1440)',
  'bookingBufferMustBeBetween0And1440Minutes': 'Booking buffer must be between 0 and 1440 minutes',
  'bookingBufferDescription': 'Prevents last-minute bookings by blocking slots within the buffer from now.',
  'breakPeriods': 'Break Periods',
  'addBreak': 'Add Break',
  'noBreakPeriodsAdded': 'No break periods added',
  'replicateSchedule': 'Replicate Schedule',
  'replicateScheduleDescription': 'Copy working hours and breaks from one day to others',
  'sourceDay': 'Source Day',
  'selectSourceDay': 'Select source day',
  'targetDays': 'Target Days',
  'selectTargetDays': 'Select target days',
  'replicate': 'Replicate',
  'hours': 'Hours',
  'mustBeBetween': 'Must be between',
  'and': 'and',
  'selectHours': 'Select hours',
  'selectMinutes': 'Select minutes',
  'minimumTimeInterval': 'Minimum 5 minutes required',
  'totalInterval': 'Total interval',
  'loadingAvailableSlots': 'Loading available slots...',
  'errorLoadingSlots': 'Error loading available time slots',
  'noAvailableSlots': 'No available time slots for this date',
  'action': 'Action',
  'id': 'ID',
  'notSet': 'Not set',
  'notAvailable': 'Not Available',
  'staffer': 'Staffer',
  'monday': 'Monday',
  'tuesday': 'Tuesday',
  'wednesday': 'Wednesday',
  'thursday': 'Thursday',
  'friday': 'Friday',
  'saturday': 'Saturday',
  'sunday': 'Sunday',
  'addNewStaffMember': 'Add New Staff Member',
  'expandTeamAddBarbers': 'Expand your team by adding barbers and staff members',
  'enterFirstName': 'Enter first name',
  'enterLastName': 'Enter last name',
  'enterEmailAddress': 'Enter email address',
  'selectRole': 'Select role',
  'barber': 'Barber',
  'hairStylist': 'Hair Stylist',
  'colorist': 'Colorist',
  'assistant': 'Assistant',
  'setPosition': 'Set position',
  'assignServices': 'Assign Services',
  'selectServices': 'Select services',
  'serviceSpecificTimeIntervals': 'Service-Specific Time Intervals',
  'setTimeIntervalForEachService': 'Set the time interval for each service. This determines the appointment slot duration for that service.',
  'allServicesMustHaveValidTimeInterval': 'All services must have a time interval between 5 and 120 minutes',
  'showStaffMemberInCalendar': 'Show staff member in calendar',
  'checkBoxStaffMemberOffersServices': 'Check this box if the staff member offers services',
  'availableForOnlineBooking': 'Available for online booking',
  'enableOnlineBooking': 'Enable online booking',
  'editStaffMember': 'Edit Staff Member',
  'updateStaffMemberDetails': 'Update staff member details and information',
  'updateStaff': 'Update Staff',
  'atLeastOneWorkingDayRequired': 'At least one working day must be enabled.',
  'goBack': 'Go Back',
  'areYouSureDeleteStaffMember': 'Are you sure you want to delete this staff member?',
  'deleteStaffDescription': 'This action cannot be undone. Deleting this member will remove all their data from the system permanently.',
  'reason': 'Reason...',
  'pleaseProvideReasonForDeletion': 'Please provide a reason for deletion',

  // Support
  'createNewTicket': 'Create New Ticket',
  'submitRequestGetSupport': 'Submit a request to get support',
  'enterSubjectError': 'Subject is required',
  'enterDescriptionError': 'Description is required',
  'fullName': 'Full Name',
  'subject': 'Subject',
  'enterSubject': 'Enter subject',
  'description': 'Description',
  'describeYourIssue': 'Describe your issue...',

  // Suggest Feature
  'titleMinLengthError': 'Title must be at least 2 characters',
  'descriptionMinLengthError': 'Description must be at least 2 characters',
  'suggestFeatureDescription': 'Help us improve by suggesting new features',
  'featureTitle': 'Feature Title',
  'writeHere': 'Write here...',
  'featureDescription': 'Feature Description',
  'describeHere': 'Describe here...',

  // Profile Settings
  'fullNameRequired': 'Full name is required',
  'pleaseEnterValidEmail': 'Please enter a valid email address',

  // Client Table
  'deactivated': 'Deactivated',
  'activated': 'Activated',
  'activate': 'Activate',
  'deactivate': 'Deactivate',
  'idLabel': 'ID',
  'notAssigned': 'Not Assigned',
  'view': 'View',
  'resendInvitationSMS': 'Resend invitation SMS',
  'resend': 'Resend',

  // Topbar
  'appointment': 'Appointment',

  // Business Settings
  'businessInformation': 'Business Information',
  'businessInformationDescription': 'Manage your business details and contact information',
  'setUpServices': 'Set Up Services',
  'setUpServicesDescription': 'Configure your services and pricing',
  'servicesComboServices': 'Services & Combo Services',
  'businessOverview': 'Business Overview',
  'businessOverviewDescription': 'Manage your business profile and settings',
  'workingHoursDescription': 'Set your business operating hours',
  'uploadYourPhoto': 'Upload Your Photo',
  'uploadYourPhotoDescription': 'Add your profile picture',
  'officeLocation': 'Office Location',
  'officeLocationDescription': 'Set your business location',
  'businessDetail': 'Business Detail',
  // Business Info page additions
  'generalInfo': 'General Info',
  'businessNameLabel': 'Business Name',
  'businessNamePlaceholder': 'Enter your business name',
  'phoneNumberLabel': 'Phone Number',
  'linkToYourPublicProfile': 'Link to your public profile',
  'hashtag': 'hashtag',

  // Client Management
  'assignedStaff': 'Assigned Staff',
  'firstNameRequired': 'First name is required',
  'lastNameRequired': 'Last name is required',
  'clientUpdatedSuccessfully': 'Client updated successfully',
  'failedToUpdateClient': 'Failed to update client',
  'clientAddedSuccessfully': 'Client added successfully!',
  'failedToAddClient': 'Failed to add client',
  'clientAlreadyExists': 'A client with this email or phone number already exists.',
  'editClient': 'Edit Client',
  'updateClientDetailsBelow': 'Update client details below',

  // Profile Settings
  'currentPasswordRequired': 'Current password is required',
  'passwordMinLength': 'Password must be at least 8 characters',
  'passwordRequirements': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  'pleaseConfirmPassword': 'Please confirm your password',
  'passwordsDoNotMatch': 'Passwords do not match',
  'noChangesToSave': 'No changes to save',
  'profileUpdatedSuccessfully': 'Profile updated successfully',
  'failedToUpdateProfile': 'Failed to update profile',
  'userProfile': 'User Profile',
  'saveChanges': 'Save Changes',
  'chooseFile': 'Choose File',
  'remove': 'Remove',
  'passwordSecurity': 'Password Security',
  'confirmNewPassword': 'Confirm New Password',

  // Appointment Dashboard
  'makeAnAppointment': 'Make an appointment',
  'easilyManageClientsBookings': 'Easily manage your clients and bookings.',
  'errorLoadingAppointmentStatistics': 'Error loading appointment statistics',
  'appointmentsOccupancy': 'Appointments & Occupancy',
  'revenueProjection': 'Revenue Projection',
  'totalAppointments': 'Total Appointments',
  'avgPerAppointment': 'Avg per Appointment',
  'months': 'Months',
  'days': 'Days',
  'viewYearlyOverview': 'View Yearly Overview',
  'timeBooked': 'Time Booked',
  'confirmed': 'Confirmed',
  'finished': 'Finished',
  'noShows': 'No Shows',
  
  // Dashboard Stats - Agenda Occupancy
  'agendaOccupancy': 'Agenda Occupancy',
  'agendaOccupancyTooltip': 'Agenda Occupancy Tooltip',
  'appointmentsTooltip': 'Appointments Tooltip',
  'appointmentStatus': 'Appointment Status',
  'appointmentStatusTooltip': 'Appointment Status Tooltip',
  'finishedTooltip': 'Finished Status Tooltip',
  'cancelledTooltip': 'Cancelled Status Tooltip',
  'noShowTooltip': 'No-Show Status Tooltip',
  'day': 'Day',
  'noDataAvailable': 'No data available',
  'errorLoadingRevenueData': 'Error loading revenue data',
  'unknownClient': 'Unknown Client',
  'loading': 'Loading...',
  'registered': 'App User',
  'unregistered': 'Walk-in / Phone',

  'automatedAppointmentReminders': 'Automated Appointment Reminders',
  'setupSmsReminders': 'Setup SMS Reminders',
  'appointmentReminders': 'Appointment Reminders',
  'remindersTime': 'Reminders Time',
  '1hourBefore': '1 hour before',
  '2hourBefore': '2 hour before',
  '3hourBefore': '3 hour before',
  '4hourBefore': '4 hour before',
  'customComment': 'Custom Comment',
  'addYourCustomCommentHere': 'Add your custom comment here...',
  'jan': 'Jan',
  'feb': 'Feb',
  'mar': 'Mar',
  'apr': 'Apr',
  'may': 'May',
  'jun': 'Jun',
  'jul': 'Jul',
  'aug': 'Aug',
  'sep': 'Sep',
  'oct': 'Oct',
  'nov': 'Nov',
  'dec': 'Dec',
  'percentageChangeTooltip': 'Percentage Change Tooltip',
  'comparedToPreviousMonth': 'Compared to previous month',
  'total': 'Total',
  'allStaff': 'All Staff',
  'selectStaff': 'Select Staff',
  'global': 'Global',
  'showingGlobalPerformance': 'Showing Global Performance',
  'showingIndividualPerformance': 'Showing Individual Performance',
  'ourBusiness': 'our business',
  'unnamedClient': 'Unnamed Client',
  'clientName': 'Client Name',
  'appointmentTime': 'Appointment Time',
  'writeYourMessage': 'Write Your Message',
  'writeYourMessageHere': 'Write your message here...',
  'selectAtLeastOneClient': 'Select at least one client',
  'noShowConfirmation': 'No-Show Confirmation',
  'blockExplanationPart1': 'If you select yes, the client will be redirected to call by phone the next time they try to book. This allows you to personally speak with them about the absence and decide whether to accommodate a new appointment.',
  'blockExplanationPart2': 'This measure helps reduce no-shows and promotes responsible appointment management.',
  'blockClientFutureAppointmentsQuestion': 'Do you want to temporarily block this client from making future booking requests through the app?',
  'yesBlockClient': 'Yes, block client',
  'noJustRecord': 'No, just record no-show',
  'hasNoShowHistoryTooltip': 'Has no-show history',
  'noSuggestionsAvailable': 'No suggestions available',
  'clientNotifiedOfDelay': 'Client notified of delay',
  'penalty': 'Penalty',
  'min': 'min',
  'promotion': 'Promotion',
  'delay': 'Delay',
  'paid': 'Paid',
  'unpaid': 'Unpaid',

  // Agenda View Modes
  'generalAgenda': 'General Agenda',
  'selectBarberToView': 'Select barber',
  'unnamed': 'Unnamed',
  'askForFeedbackTrigger': 'Ask for Feedback Trigger',
  'yes': 'Yes',
  'no': 'No',
  // Review Link Modal (Shared & Inline)
  'sendAReviewRequest': 'Send a Review Request',
  'defaultReviewMessage': 'Hey {clientName}, thank you for visiting! Would you mind leaving us a quick review on Google? It really helps us a lot!',
  'loadingClients': 'Loading clients...',
  'sendReviewRequestViaSmsDescription': 'Send a Google review request to your client via SMS. Make sure your business has a Google Place ID configured in settings.',
  'writeMessage': 'Write message',
  'sending': 'Sending...',
  'reviews': 'Reviews',
  'client': 'client',
  'notFilledYet': 'not filled yet',

  // Happy Hours
  'manageYourHappyHours': 'Manage Your Happy Hours',
  'happyHoursDescription': 'When business is slow, use special discounts to encourage client bookings. You can choose the discount amount and the specific days and times for the offer.',
  'happyHoursSet': 'Happy hours set',
  'selectTimeAndDiscount': 'Select time and discount',

  // Message Blast
  'composeYourMessage': 'Compose Your Message',
  'secureMessagingInfo': 'To ensure secure messaging, only links related to your business (your-business.yourcalendly.com) can be included in SMS and push notifications. External links will be automatically removed.',
  'pushEmail': 'Push Email',
  'pushSMS': 'Push SMS',

  // Promotions
  'boostYourBookingsWithSmartPromotions': 'Boost Your Bookings with Smart Promotions',
  'attractMoreClientsWithTimeLimitedDiscounts': 'Attract more clients with time-limited discounts and special offers. Customize and activate deals to keep your schedule full',
  'flashSale': 'Flash Sale',
  'boostYourSalesByPromotingExclusiveDeals': 'Boost your sales by promoting exclusive time-sensitive deals.',
  'happyHours': 'Happy Hours',
  'happyHour': 'Happy Hour',
  'happyHourPromotionFor': 'Happy hour promotion for',
  'editHappyHours': 'Edit Happy Hours',
  'encourageMoreBookingsByOfferingSpecialRates': 'Encourage more bookings by offering special rates during slower hours.',

  // Flash Sale
  'pleaseSelectStartAndEndDate': 'Please select a start and end date.',
  'off': 'off',
  'aFlashSaleOffering': 'A flash sale offering a',
  'discount': 'discount',
  'sendTo': 'Send To',
  'boostYourBookingsWithLimitedTimeOffer': 'Boost your bookings with a limited-time offer. It\'s a great way to introduce a new service, celebrate a special event, or just fill up your calendar.',
  'flashSaleDiscount': 'Flash sale discount',
  'offTheServicePrice': 'Off the service price',
  'setPackageDuration': 'Set Package Duration',
  'startDate': 'Start Date',
  'endDate': 'End Date',

  // Promotion Success Modal
  'promotionCreatedSuccessfully': 'Promotion Created Successfully!',
  'wantToOfferSameHappyHoursOnDifferentDay': 'Want to offer the same Happy Hours on different day of the week? After you click "Start Promotion" you\'ll be able to select your additional day',
  'ok': 'OK',

  // Admin Dashboard
  'adminDashboard': 'Admin Dashboard',
  'overviewOfPlatformStatistics': 'Overview of platform statistics and key metrics',
  'exportCSV': 'Export CSV',
  'exportPDF': 'Export PDF',
  'monthlyAppointments': 'Monthly Appointments',
  'totalRevenue': 'Total Revenue',
  'totalBarbers': 'Total Barbers',
  'completionRate': 'Completion Rate',
  'failedToLoadDashboardStatistics': 'Failed to load dashboard statistics.',

  // Admin Layout
  'welcomeToYouCalendyManagement': 'Welcome to YouCalendy Management Panel',

  // Admin Barber Management
  'manageRegisteredBarbers': 'Manage Registered Barbers',
  'monitorManageAndMaintainAllRegisteredBarbers': 'Monitor, manage, and maintain all registered barbers on the platform. View their status, subscriptions, and activity at a glance.',
  'searchByIdNameEmailAddress': 'Search by ID, name & email address',
  'barberAdmin': 'Barber Admin',
  'filterByAppointments': 'Filter by appointments',
  'filterByRevenue': 'Filter by revenue',
  'filterByStatus': 'Filter by status',
  'failedToLoadBarbers': 'Failed to load barbers.',
  'items': 'items',
  'itemsPerPage': 'Items per page',

  // Admin Client Management
  'clientDirectory': 'Client Directory',
  'browseAllClientAccountsCheckRecentActivity': 'Browse all client accounts, check recent activity, and perform administrative actions.',

  // Admin Support
  'na': 'N/A',
  'issue': 'Issue',
  'priority': 'Priority',
  'low': 'Low',
  'medium': 'Medium',
  'high': 'High',
  'critical': 'Critical',
  'resolved': 'Resolved',

  // No-Show Management
  'clientHasNoShowHistory': 'Client has No-Show History',
  'thisClientHas': 'This client has',
  'noShowIncidents': 'no-show incidents',
  'latestNote': 'Latest Note',
  'noDetails': 'No details',
  'incidentNote': 'Incident Note (saved to client profile)',
  'incidentNotePlaceholder': 'e.g., Client did not show up and did not call to notify. This note will be visible when creating future appointments for this client.',

  // Review Link & Completion
  'appointmentCompletedAndReviewSent': 'Appointment completed and review request sent to client!',
  'appointmentCompletedSuccessfully': 'Appointment completed successfully!',
  'messageNotSentError': 'Message not sent. Error:',
  'reviewRequestNoCredits': 'Review request could not be sent because you have 0 SMS credits. Please purchase SMS credits to send review requests.',
  'reviewRequestFailed': 'Review request could not be sent. Please check your SMS credits or try again.',
  'failedToCompleteAppointment': 'Failed to complete appointment',
  'massNotification': 'Mass Notification',
  'sendPlatformWideAlertsAndManageUserSupportTickets': 'Send platform-wide alerts and manage user support tickets efficiently.',
  'massNotifications': 'Mass Notifications',
  'technicalSupport': 'Technical Support',
  'enterYourMessageNotification': 'Enter your message Notification',
  'targetAudience': 'Target Audience',
  'allUsers': 'All Users',
  'barbers': 'Barbers',
  'sendNotification': 'Send Notification',
  'loadingTickets': 'Loading tickets...',
  'noTechnicalSupportTicketsFound': 'No technical support tickets found.',

  // Admin Subscription Management
  'include': 'Include',
  'enterNewFeature': 'Enter new feature',
  'areYouSureDeletePlan': 'Are you sure you want to delete this plan? This action cannot be undone.',
  'planDeletedSuccessfully': 'Plan deleted successfully',
  'failedToDeletePlan': 'Failed to delete plan',
  'planCreatedSuccessfully': 'Plan created successfully',
  'planUpdatedSuccessfully': 'Plan updated successfully',
  'featureAddedSuccessfully': 'Feature added successfully',
  'featureRemovedSuccessfully': 'Feature removed successfully',

  // Plan Management
  'createNewPlan': 'Create New Plan',
  'setupNewSubscriptionPlan': 'Set up a new subscription plan for your business',
  'basicInformation': 'Basic Information',
  'planTitle': 'Plan Title',
  'planTitlePlaceholder': 'Enter plan title (e.g., Premium Package)',
  'planTitleRequired': 'Plan title is required',
  'planDescriptionRequired': 'Plan description is required',
  'descriptionPlaceholder': 'Describe what this plan includes and its benefits',
  'pricingAndBilling': 'Pricing & Billing',
  'priceGreaterThanZero': 'Price must be greater than zero',
  'usdLabel': 'USD ($)',
  'eurLabel': 'EUR (€)',
  'gbpLabel': 'GBP (£)',
  'cadLabel': 'CAD ($)',
  'audLabel': 'AUD ($)',
  'billingInterval': 'Billing Interval',
  'yearly': 'Yearly',
  'planFeatures': 'Plan Features',
  'addFeaturePlaceholder': 'Add a feature (e.g., Unlimited bookings)',
  'featuresIncluded': '{count} feature{s} included',
  'atLeastOneFeatureRequired': 'At least one feature is required',
  'createPlan': 'Create Plan',
  'editPlan': 'Edit Plan',
  'updatePlan': 'Update Plan',

  // Subscription Management
  'freeTrialStartedSuccessfully': 'Free trial started successfully',
  'subscriptionCreatedSuccessfully': 'Subscription created successfully',
  'planStatus': 'Plan Status',
  'activePlan': 'Active Plan',
  'toggleActivateDeactivatePlan': 'Toggle to activate or deactivate this plan',
  'modifyPlanDetailsPricingFeatures': 'Modify plan details, pricing, and features',
  'currencyBillingIntervalCannotChange': 'Note: Currency and billing interval cannot be changed after creation',
  'describePlanIncludesBenefits': 'Describe what this plan includes and its benefits',
  'daily': 'Daily',
  'weekly': 'Weekly',
  'monthly': 'Monthly',

  'subscriptions': 'Subscriptions',
  'managePricingPlansTrialsAndPromotionalOffers': 'Manage pricing plans, trials, and promotional offers to optimize platform monetization.',
  'integrations': 'Integrations',
  'connectAndManageThirdPartyTools': 'Connect and manage third-party tools to enhance analytics and communication capabilities.',
  'failedToLoadPlans': 'Failed to load plans. Please try again later.',
  'noPlansFoundCreateFirstPlan': 'No plans found. Create your first plan to get started.',
  'createNewPackage': 'Create New Package',
  'googleAnalytics': 'Google Analytics',
  'connectGoogleAnalytics': 'Connect Google Analytics',
  'googleAnalyticsConnected': 'Google Analytics is connected:',
  'connectGA4Property': 'Connect your GA4 property to track website analytics and user behavior.',
  'ga4MeasurementId': 'GA4 Measurement ID',
  'measurementIdPlaceholder': 'G-XXXXXXXXXX',
  'findInGA4Settings': 'You can find this in your GA4 property settings under Data Streams.',
  'dontHaveGA': "Don't have Google Analytics?",
  'setupHere': 'Set up here',
  'updateConnection': 'Update Connection',
  'howToFindMeasurementId': 'How to find your Measurement ID',
  'goToGoogleAnalytics': 'Go to Google Analytics (analytics.google.com)',
  'selectWebStream': 'Select your property and click on the web data stream',
  'copyMeasurementId': 'Copy the Measurement ID (starts with G-)',
  'trackUserBehaviorAndPlatformAnalytics': 'Track user behavior and platform analytics.',
  'connected': 'Connected',
  'connectNow': 'Connect Now',


  // Admin Security
  'noBackupAvailableToRestore': 'No backup available to restore.',
  'system': 'System',
  'activityLogs': 'Activity Logs',
  'automaticBackups': 'Automatic Backups',
  'monitorCriticalSystemActionsAndManageAutomatedDataBackups': 'Monitor critical system actions and manage automated data backups to maintain platform integrity.',
  'searchByIdEvent': 'Search by ID, event',
  'searchByIdAction': 'Search by ID or action...',
  'user': 'User',
  'filterByDate': 'Filter by date',
  'dateRange': 'Date Range',
  'backupFrequency': 'Backup Frequency',
  'lastBackup': 'Last Backup',
  'noBackupsFound': 'No backups found',
  'runManualBackup': 'Run Manual Backup',
  'restoring': 'Restoring...',
  'restoreFromLastBackup': 'Restore From Last Backup',
  'confirmRestore': 'Confirm Restore',
  'areYouSureRestoreFromLastBackup': 'Are you sure you want to restore from the last backup? This action cannot be undone and will overwrite current data.',
  'restore': 'Restore',

  // Admin Profile
  'pleaseEnterNewPasswordToUpdate': 'Please enter a new password to update.',
  'yourPasswordMustBeAtLeast6Characters': 'Your password must be at least 6 characters and should include a combination of uppercase letters, lowercase letters, and numbers.',

  // Support Tickets
  'failedToFetchSupportTickets': 'Failed to fetch support tickets',
  'ticketPriorityUpdated': 'Ticket priority updated successfully',
  'failedToUpdateTicketPriority': 'Failed to update ticket priority',
  'ticketStatusUpdated': 'Ticket status updated successfully',
  'failedToUpdateTicketStatus': 'Failed to update ticket status',
  'failedToFetchYourTickets': 'Failed to fetch your tickets',
  'supportTicketCreatedSuccessfully': 'Support ticket created successfully',
  'failedToFetchTicketDetails': 'Failed to fetch ticket details',
  'ticketUpdatedSuccessfully': 'Ticket updated successfully',
  'ticketDeletedSuccessfully': 'Ticket deleted successfully',

  // Services Management
  'serviceAddedSuccessfully': 'Service added successfully',
  'serviceUpdatedSuccessfully': 'Service updated successfully',
  'serviceDeletedSuccessfully': 'Service deleted successfully',

  // Marketing
  'flashSaleCreatedSuccessfully': 'Flash sale created successfully',
  'promotionUpdatedSuccessfully': 'Promotion updated successfully',
  'failedToCreateFlashSale': 'Failed to create flash sale',
  'failedToFetchFlashSales': 'Failed to fetch flash sales',
  'failedToCreatePromotion': 'Failed to create promotion',
  'failedToUpdatePromotion': 'Failed to update promotion',
  'failedToFetchPromotions': 'Failed to fetch promotions',
  'appointmentCreatedSuccessfully': 'Appointment created successfully!',
  'appointmentUpdatedSuccessfully': 'Appointment updated successfully!',
  'appointmentMarkedAs': 'Appointment marked as',
  'penaltyAppliedSuccessfully': 'Penalty applied successfully!',
  'penaltyPaidSuccessfully': 'Penalty paid successfully!',
  'timeBasedPenaltiesNotSupported': 'Time-based penalties are not yet supported. Please use money penalties.',
  'delayNotificationSent': 'Delay notification sent successfully!',
  'reminderSettingsUpdated': 'Reminder settings updated successfully!',
  'appointmentRemindersEnabled': 'Appointment reminders successfully Enabled',
  'appointmentRemindersDisabled': 'Appointment reminders Disabled',
  'automatedReminderSent': 'Automated reminder sent successfully!',
  'reviewLinkGenerated': 'Review link generated successfully!',
  'errorCreatingAppointment': 'Error creating appointment',
  'errorFetchingAppointments': 'Error fetching appointments',
  'errorFetchingAppointment': 'Error fetching appointment',
  'errorUpdatingAppointment': 'Error updating appointment',
  'errorUpdatingAppointmentStatus': 'Error updating appointment status',
  'errorFetchingAppointmentStats': 'Error fetching appointment stats',
  'errorFetchingRevenueProjection': 'Error fetching revenue projection',
  'errorFetchingAppointmentHistory': 'Error fetching appointment history',
  'errorApplyingPenalty': 'Error applying penalty',
  'errorFetchingClientPenalties': 'Error fetching client penalties',
  'errorPayingPenalty': 'Error paying penalty',
  'errorSendingDelayNotification': 'Error sending delay notification',
  'errorFetchingDelayInfo': 'Error fetching delay info',
  'errorUpdatingReminderSettings': 'Error updating reminder settings',
  'errorSendingAutomatedReminders': 'Error sending automated reminders',
  'remindersSentSuccessfully': 'Reminders sent successfully!',
  'errorGeneratingReviewLink': 'Error generating review link',

  // Gallery Management
  'haircutImageUploadedSuccessfully': 'Haircut image uploaded successfully!',
  'failedToUploadHaircutImage': 'Failed to upload haircut image',
  'suggestionAddedSuccessfully': 'Suggestion added successfully!',
  'failedToAddSuggestion': 'Failed to add suggestion',
  'suggestionUpdatedSuccessfully': 'Suggestion updated successfully!',
  'failedToUpdateSuggestion': 'Failed to update suggestion',
  'cannotEditThisSuggestionInvalidSuggestionId': 'Cannot edit this suggestion. Invalid suggestion ID.',
  'invalidSelectionPleaseTryAgain': 'Invalid selection. Please try again.',
  'pleaseEnterASuggestionNote': 'Please enter a suggestion note',
  'noGalleryImagesAvailable': 'No gallery images available for this business.',
  'imageReportedSuccessfully': 'Image reported successfully!',
  'reportReviewedSuccessfully': 'Report reviewed successfully!',
  'failedToReviewReport': 'Failed to review report',
  'galleryImageDeletedSuccessfully': 'Gallery image deleted successfully!',
  'failedToDeleteGalleryImage': 'Failed to delete gallery image',
  'photoUploadedSuccessfully': 'Photo uploaded successfully!',
  'failedToUploadPhoto': 'Failed to upload photo',
  'photoDeletedSuccessfully': 'Photo deleted successfully!',
  'failedToDeletePhoto': 'Failed to delete photo',
  'deletePhotoConfirmation': 'Are you sure you want to delete this photo? This action cannot be undone.',
  'deletePhoto': 'Delete Photo',
  'addPhoto': 'Add Photo',
  'removePhoto': 'Remove Photo',
  'removePhotoConfirmation': 'Are you sure you want to remove your profile photo?',
  'removeAccountDescription': 'To permanently delete your account and all associated data, click the button below. This action cannot be undone.',
  'doYouWantToRemoveAccount': 'Do you want to remove account?',
  'issueReportedSuccessfully': 'Issue reported successfully!',
  'failedToReportIssue': 'Failed to report issue',
  'notificationPreferencesUpdated': 'Notification preferences updated!',
  'failedToUpdateNotifications': 'Failed to update notifications',

  // Staff Management
  'staffMemberAddedSuccessfully': 'Staff member added successfully',
  'staffMemberUpdatedSuccessfully': 'Staff member updated successfully',
  'staffMemberDeletedSuccessfully': 'Staff member deleted successfully',

  // Appointments
  'pleaseSelectClientFirst': 'Please select a client first',
  'invalidClientIdFormat': 'Invalid client ID format',
  'reviewLinkCopiedToClipboard': 'Review link copied to clipboard',
  'failedToGenerateReviewLink': 'Failed to generate review link',
  'reviewRequestSentSuccessfully': 'Review request sent successfully via SMS!',
  'reviewLinkGeneratedButSmsNotSent': 'Review link generated but SMS was not sent',

  'googleReviewSettings': 'Google Review Settings',
  'googlePlaceId': 'Google Place ID',
  'googlePlaceIdPlaceholder': 'Enter your Google Place ID (e.g., ChIJ...)',
  'googlePlaceIdHelp': 'Find your Place ID using the Google Places API or Google Business Profile. This creates a direct review link.',
  'googleReviewUrl': 'Direct Review URL',
  'googleReviewUrlPlaceholder': 'https://g.page/.../review',
  'googleReviewUrlHelp': 'Alternative: Paste your direct Google review URL here if you don\'t have a Place ID.',
  'generateReviewLink': 'Send Review Request',
  'sendReviewRequest': 'Send Review Request',
  'sendReviewRequestToClient': 'Send review request to {clientName}',
  'noClientsWithPhone': 'No clients with phone numbers found',
  'noClientsAvailableHint': 'Add clients with phone numbers to send review requests.',
  'reviewLinkSentSuccessfully': 'Review link sent successfully via SMS!',

  // Notify Clients
  'notifyClients': 'Notify Clients',
  'notifyClientsTooltip': 'Send notifications to clients with appointments',
  'notifyClientsDescription': 'Select a date and clients to send them a notification message.',
  'selectDate': 'Select Date',
  'quickMessageTemplates': 'Quick Message Templates',
  'runningLateTitle': 'Running Late',
  'runningLateDescription': 'Are you running late today? Notify your clients so they can arrive a few minutes later.',
  'runningLatePreset': 'running_late',
  'runningLatePresetMessage': "Hi {clientName}, I'm running a bit late today. You can arrive a few minutes later than your scheduled appointment time. Thanks for your understanding!",
  'aheadOfScheduleTitle': 'Ahead of Schedule',
  'aheadOfScheduleDescription': 'Are you ahead of schedule today? Let your clients know they can come earlier than planned.',
  'aheadOfSchedulePreset': 'ahead_of_schedule',
  'aheadOfSchedulePresetMessage': "Hi {clientName}, I'm ahead of schedule today! Feel free to come earlier than your planned appointment time if that works for you. See you soon!",
  'cancelDayTitle': 'Cancel Day (Force Majeure)',
  'cancelDayDescription': 'Do you need to cancel the day due to force majeure? Inform your clients that you won\'t be able to attend appointments today.',
  'cancelDayPreset': 'cancel_day',
  'cancelDayPresetMessage': "Hi {clientName}, I regret to inform you that due to unforeseen circumstances, I won't be able to attend appointments today. We'll need to reschedule your appointment. I apologize for the inconvenience and will contact you soon to find a new time.",
  'clientsWithAppointments': 'Clients with Appointments',
  'loadingAppointments': 'Loading appointments...',
  'noAppointmentsForDate': 'No appointments scheduled for this date. Please select another date.',
  'messagePersonalizationHint': 'Tip: Use {clientName} in your message to automatically insert the client\'s name.',
  'notificationsSentSuccessfully': 'Notifications sent successfully to {count} client(s)!',
  'notificationsPartiallySent': 'Sent to {success} client(s), failed for {failure} client(s).',
  'failedToSendNotifications': 'Failed to send notifications. Please ensure selected clients have appointments on the selected date.',
  'someClientsMissingAppointments': 'Some selected clients are missing appointment information. Please refresh and try again.',

  // Unregistered Clients
  'walkInOrPhone': 'Walk-in / Phone',
  'appUser': 'App User',
  'invitationPending': 'Invitation Pending',
  'hasNoShowHistory': 'Has No-Show History',
  'unregisteredClientDescription': 'For walk-in clients or phone bookings. No account will be created - this is for internal tracking only.',
  'registeredClientDescription': 'For clients who will use the app. An invitation will be sent to create their account.',
  'enterEmail': 'Enter email address',
  'internalNotes': 'Internal Notes',
  'internalNotesPlaceholder': 'Add any notes about this client (preferences, history, etc.)',
  'optional': 'optional',
  'addClient': 'Add Client',
  'unregisteredClientCreated': 'Unregistered client created successfully',
  'existingClientFound': 'Client already exists - using existing record',
  'failedToCreateUnregisteredClient': 'Failed to create unregistered client',

  // Staff Filter (legacy - kept for backward compatibility)

  'appointmentBookedSuccessfully': 'Appointment booked successfully',
  'errorOccurredBookingAppointment': 'An error occurred while booking the appointment',
  'serviceInformationMissing': 'Service information is missing',
  'dateMissing': 'Date is missing',
  'timeSlotMissing': 'Time slot is missing',
  'businessInformationMissing': 'Business information is missing',
  'clientAuthenticationRequired': 'Client authentication is required',
  'staffInformationMissing': 'Staff information is missing',

  // Authentication & Login
  'loginSuccessful': 'Login successful',
  'networkErrorBackendNotAccessible': 'Network error: Backend not accessible',
  'noResponseReceivedFromServer': 'No response received from server',
  'loginSuccessfulWith': 'Login successful with {provider}',
  'logoutSuccessful': 'Logout successful',
  'registrationSuccessfulWelcome': 'Registration successful! Welcome',
  'serverConnectionFailedCheckInternet': 'Server connection failed. Please check your internet connection',
  'passwordChangedSuccessfully': 'Password changed successfully',

  // Client Management
  'pleaseSelectCSVFile': 'Please select a CSV file',
  'pleaseSelectCSVFileFirst': 'Please select a CSV file first',
  'welcomeBackProfileComplete': 'Welcome back! Your profile is complete',
  'failedToLoadClientInformation': 'Failed to load client information',
  'failedToProcessInvitation': 'Failed to process invitation',
  'welcomeProfileCompletedSuccessfully': 'Welcome! Your profile has been completed successfully',
  'pleaseCompleteProfileToContinue': 'Please complete your profile to continue',
  'barberRemovedSuccessfully': 'Barber removed successfully',
  'pleaseSelectFileFirst': 'Please select a file first',
  'pleaseAddNoteForReport': 'Please add a note for the report',
  'pleaseAddNoteForSuggestion': 'Please add a note for the suggestion',
  'clientDataFixedRefreshing': 'Client data fixed, refreshing...',
  'failedToFixClientData': 'Failed to fix client data',
  'errorFixingClientData': 'Error fixing client data: ',
  'noInvitationTokenFound': 'No invitation token found',
  'failedToCompleteProfile': 'Failed to complete profile',

  // Google Analytics & Validation
  'pleaseEnterValidMeasurementId': 'Please enter a valid measurement ID',
  'invalidMeasurementIdFormat': 'Invalid measurement ID format',
  'failedToConnectGA': 'Failed to connect Google Analytics',

  // Flash Sales & Dates

  // General Validation
  'nameEmailAndPasswordAreRequired': 'Name, email and password are required',
  'pleaseCheckInformationTryAgain': 'Please check your information and try again',
  'registrationFailedTryAgain': 'Registration failed. Please try again',
  'newBarberRegistrations': 'New Barber Registrations',
  'getNotifiedWheneverNewBarberCompletesOnboarding': 'Get notified whenever a new barber completes the onboarding process.',
  'subscriptionExpiryAlerts': 'Subscription Expiry Alerts',
  'receiveAlertsWhenBarberSubscriptionAboutToExpire': 'Receive alerts when a barber\'s subscription is about to expire or has been canceled.',
  'highAppointmentVolume': 'High Appointment Volume',
  'stayInformedIfBarberExperiencesSuddenSpikeInBookings': 'Stay informed if a barber experiences a sudden spike in bookings that may need support.',

  // Admin Barber Profile
  'barberNotFoundOrFailedToLoad': 'Barber not found or failed to load',
  'barberProfile': 'Barber Profile',
  'accessAccountStatusRevenueInsightsAndServiceHistory': 'Access account status, revenue insights, and service history in one place',
  'activateAccount': 'Activate Account',
  'deactivateAccount': 'Deactivate Account',
  'resetPassword': 'Reset Password',
  'removeAccount': 'Remove Account',
  'statistics': 'Statistics',
  'businessInfo': 'Business Info',
  'contact': 'Contact',
  'joinedDate': 'Joined Date',
  'areYouSureResetBarberPassword': 'Are you sure you want to reset this barber\'s password?',
  'removeBarber': 'Remove Barber',
  'areYouSureRemoveBarberThisActionCannotBeUndone': 'Are you sure you want to remove this barber? This action cannot be undone',

  // Admin Proposed Interfaces
  'administratorOverview': 'Administrator Overview',
  'centralHubForViewingPlatformMetricsAndManagingSubAdminRoles': 'Central hub for viewing platform metrics and managing sub-admin roles.',
  'appointmentsThisMonth': 'APPOINTMENTS THIS MONTH',
  'revenueThisMonth': 'REVENUE THIS MONTH',
  'manageSubAdministrators': 'Manage Sub-Administrators',
  'johnDoe': 'John Doe',
  'johnExampleCom': 'john@example.com',
  'role': 'Role',
  'supportOnly': 'support only',
  'completeAccess': 'complete access',
  'managementAccess': 'management access',
  'addSubAdmin': 'Add Sub-Admin',

  // Admin Components
  'neverMissAnImportantUpdate': 'Never Miss an Important Update',
  'notificationDisabled': 'Notification disabled',
  'youHaveNoNotifications': 'You have no {filter} notifications.',
  'appointmentsTrend': 'Appointments Trend',
  'failedToLoadAppointmentTrends': 'Failed to load appointment trends',
  'noAppointmentDataAvailableYet': 'No appointment data available yet',
  'unknown': 'Unknown',
  'topBarber': 'Top Barber',
  'failedToLoadTopBarbersData': 'Failed to load top barbers data',
  'noBarberDataAvailableYet': 'No barber data available yet',
  'revenue': 'Revenue',
  'failedToLoadRevenueData': 'Failed to load revenue data',

  // Admin Menu Items
  'subscriptionStatus': 'Subscription Status',
  'support': 'Support',
  'suggestFeature': 'Suggest Feature',
  'barberManagement': 'Barber Management',
  'clientManagement': 'Client Management',
  'platformSettings': 'Platform Settings',
  'supportAndCommunication': 'Support and Communication',
  'securityAndAuditing': 'Security and Auditing',
  'proposedInterfaces': 'Proposed Interfaces',
  'setting': 'Setting',
  'minutes': 'minutes',
  'viewDetails': 'View Details',
  'logoutConfirmation': 'Logout Confirmation',
  'areYouSureLogout': 'Are you sure you want to logout?',
  'logout': 'Logout',
  'notification': 'Notification',
  'notifications': 'Notifications',
  'neverMissUpdate': 'Never miss an update',
  'markAsAllRead': 'Mark all as read',
  'all': 'All',
  'unread': 'Unread',
  'read': 'Read',
  'noNotifications': 'No notifications {filter}',
  'smsSentSuccessfully': 'SMS Sent Successfully',
  'reviewLinkSentToClient': 'Review link sent to client',
  'reviewLinkCopy': 'Review Link (for reference):',
  'copyLink': 'Copy Link',
  'sendReviewLink': 'Send Review Link',
  'sendingReviewLink': 'Sending...',
  'generateCustomGoogleReviewLink': 'Generate a custom Google review link and send it to your clients via SMS.',

  'closeNotificationPanel': 'Close notification panel',
  'thankYouForVisiting': 'Hey {clientName}, thank you for visiting {businessName}! Would you mind leaving us a quick review on Google? {link}',
  'notif.appointmentCreatedTitle': 'Appointment Created',
  'notif.appointmentCreatedMessage': 'Barber created appointment for {clientName} on {date} at {time}',
  'notif.subscriptionActivatedTitle': 'Subscription Activated',
  'notif.subscriptionActivatedMessage': 'Subscription has been activated for business "{businessName}". (ID: {subscriptionId})',
  'notif.creditPurchaseInitiatedTitle': 'Credit Purchase Initiated',
  'notif.creditPurchaseInitiatedMessage': 'Business "{businessName}" initiated a credit purchase checkout session. (ID: {sessionId})',
  'notif.creditPurchaseSucceededTitle': 'Credit Purchase Completed',
  'notif.creditPurchaseSucceededMessage': 'Business "{businessName}" completed a credit purchase successfully.',
  'notif.creditPurchaseFailedTitle': 'Credit Purchase Failed',
  'notif.creditPurchaseFailedMessage': 'Business "{businessName}" failed to complete the credit purchase. Reason: {reason}',
  'notif.creditPurchaseCompletedTitle': 'Credit Purchase Completed',
  'notif.creditPurchaseCompletedMessage': 'Business "{businessName}" completed a credit purchase successfully.',

  // Topbar Additional
  'generateLink': 'Generate Link',
  'clientReview': 'Client Review',

  // Client-Side Keys
  'myProfile': 'My Profile',
  'emailNotAvailable': 'Email not available',
  'initializingClientProfile': 'Initializing client profile...',
  'clientInformationMissing': 'Client Information Missing',
  'pleaseUseValidInvitationLink': 'Please use a valid invitation link to access your profile.',
  'saveToGallery': 'Save to Gallery',
  'deleteProfileWarning': 'Are you sure? Deleting your profile will also remove all your photos and personal data.',
  'reportIssue': 'Report Issue',
  'reportProblemWithHaircut': 'Report a Problem with Your Last Haircut',
  'addNoteHere': 'Add Note here',
  'writeConsiderationsOrReportIssue': 'Write here any considerations for the next cut or report any issue with this haircut',
  'uploadImage': 'Upload Image',
  'givePersonalFeedback': 'Give Personal Feedback',
  'addSuggestion': 'Add Suggestion',
  'addSuggestionForHaircut': 'Add suggestion for your haircut',
  'viewAndManageProfile': 'View and manage your profile',
  'clientProfile': 'Client Profile',
  'viewAndManageClientDetails': 'View and manage client details.',
  'editProfile': 'Edit Profile',
  'notes': 'Notes',
  'defaultClientNotes': 'Prefers a high-fade haircut, careful around the mole on the left side. Likes to talk about football.',
  'photosAndGallery': 'Photos & Gallery',

  // Client-Side Component Keys
  'emailRequired': 'Email is required',
  'emailInvalid': 'Email is invalid',
  'completeYourProfile': 'Complete Your Profile',
  'completeProfileDescription': 'Please complete your profile to continue. This information will help us provide you with better service!',
  'welcomeYouHaveInvitation': 'Welcome! You have an invitation',
  'completingFormWillCompleteProfile': 'Completing this form will complete your profile with the salon',
  'profilePhotoOptional': 'Profile Photo (Optional)',
  'enterYourFirstName': 'Enter your first name',
  'enterYourLastName': 'Enter your last name',
  'enterYourEmailAddress': 'Enter your email address',
  'completingProfile': 'Completing Profile...',
  'completeProfile': 'Complete Profile',

  // Additional Client Profile Keys
  'debugInfo': 'Debug info',
  'clientId': 'Client ID',
  'businessId': 'Business ID',
  'invitationToken': 'Invitation Token',
  'missing': 'Missing',
  'goToHomepage': 'Go to Homepage',
  'tryAutoFix': 'Try Auto-Fix',
  'uploadPhoto': 'Upload Photo',
  'profileVisibleToBarberMessage': 'This profile is also visible to the barber. You must only upload photos strictly related to your previous haircuts',
  'dragAndDrop': 'Drag & Drop',
  'clickTo': 'Click to',
  'upload': 'Upload',
  'or': 'or',
  'noPhotosInGalleryYet': 'No photos in gallery yet. Upload your first photo!',

  // Business Hooks/Toasts
  'failedToFetchBusinessDetails': 'Failed to fetch business details',
  'businessInformationUpdatedSuccessfully': 'Business information updated successfully',
  'failedToUpdateBusinessInformation': 'Failed to update business information',
  'businessAddressUpdatedSuccessfully': 'Business address updated successfully',
  'failedToUpdateBusinessAddress': 'Failed to update business address',
  'locationUpdatedSuccessfully': 'Location updated successfully.',
  'failedToUpdateLocation': 'Failed to update location.',
  'businessHoursUpdatedSuccessfully': 'Business hours updated successfully',
  'failedToUpdateBusinessHours': 'Failed to update business hours',
  'settingsUpdatedSuccessfully': 'Settings updated successfully.',
  'failedToUpdateSettings': 'Failed to update settings.',
  'imagesUploadedSuccessfully': 'Images uploaded successfully',
  'failedToUploadImages': 'Failed to upload images',

  // Gallery Keys
  'barberStylingClientHair': "Barber styling client's hair",
  'barberWithClient': 'Barber with client',
  'clientGettingHaircut': 'Client getting haircut',
  'stylishHaircut': 'Stylish haircut',
  'modernHairstyle': 'Modern hairstyle',
  'galleryImage': 'Gallery image {number}',
  'ourGallery': 'Our Gallery',
  'haircutGallery': 'Haircut Gallery',
  'profileTutorialMessage': 'In your profile you can upload photos of your recent haircuts, which you can use to suggest changes for future cuts or, if necessary, report an issue with your current cut so the barber can address it as soon as possible.',
  'noImagesFound': 'No Images Found',
  'failedToLoadBusinessInformation': 'Failed to load business information',

  // Home Page Keys
  'closed': 'Closed',
  'showTodayOnly': 'Show today only',
  'showFullWeek': 'Show full week',
  'socialNetworks': 'Social Networks',

  // Dashboard and Calendar
  'noShow': 'No-Show',
  'cancel': 'Cancel',
  'sendMessage': 'Send Message',

  // Action Buttons
  'autoReminders': 'Auto Reminders',
  'notifyOfDelay': 'Notify of Delay',
  'newAppointment': 'New Appointment',

  // New Appointment
  'autoRemindersTooltip': 'Set up automated SMS reminders for appointments.',
  'generateReviewLinkTooltip': 'Generate Review Link Tooltip',
  'newAppointmentTooltip': 'New Appointment Tooltip',
  'hasLeftANote': 'has left a note',
  'clientNote': 'Client Note',
  'referenceImage': 'Reference Image',

  // Calendar Events
  'clientHasGivenSuggestion': 'Client has given a suggestion about the haircut style',
  'forMyUpcomingAppointment': 'For my upcoming appointment, I\'d like to try a specific haircut style. Let me know if it suits me!',
  'mins': 'Mins',

  // Common UI Actions
  'share': 'Share',
  'shareAppointment': 'Share Appointment',
  'logIn': 'Log in',
  'signUpFree': 'Sign Up Free',

  // Push Message Form Keys
  'recipientGroup': 'Recipient Group',
  'selectRecipientGroup': 'Select recipient group',
  'selectRecipients': 'Select Recipients',
  'useRecipientGroup': 'Use Recipient Group',
  'selectSpecificClients': 'Select Specific Clients',
  'emailSubject': 'Email Subject',
  'enterEmailSubject': 'Enter email subject',
  'emailContent': 'Email Content',
  'personalizeMessage': 'Write your message to send to all selected clients.',
  'helloFirstNameOffer': 'Hello, we have an exciting offer for you...',
  'deliveryTimeline': 'Delivery timeline',
  'sendNow': 'Send Now',
  'sendLater': 'Send Later',
  'recurring': 'Recurring',
  'dateInput': 'Date input',
  'timeOfDay': 'Time of Day',
  'recurringInterval': 'Recurring Interval (in days)',
  'recurringIntervalDescription': 'The message will be sent automatically based on the client\'s last visit.',
  'exampleThirty': 'e.g., 30',
  'smsContent': 'SMS Content',
  'smsContentPlaceholder': 'SMS-Content',

  // Form Validation Messages
  'subjectMinLength': 'Subject must have at least 3 characters',
  'messageMinLength': 'Message must have at least 10 characters',
  'selectRecipientGroupError': 'Select recipient group',
  'selectDeliveryTimeline': 'Select delivery timeline',
  'selectDeliveryDate': 'Select delivery date',
  'selectDeliveryTime': 'Select delivery time',
  'emailContentMinLength': 'Email content must have at least 3 letters',

  // Profile Settings

  // Admin/ProposedInterfaces.jsx

  // Support/Ticket.jsx

  // Admin/ClientManagement.jsx
  'filterOptions': 'Filter Options',
  'failedToLoadClients': 'Failed to load clients',

  // Admin/BarberManagement.jsx

  // Admin/Security.jsx

  // Services/services.jsx
  'typeOfServiceRequired': 'Type of service is required',
  'durationRequired': 'Duration is required',
  'nameOfService': 'Name of service...',
  'typeOfService': 'Type of service...',

  // Admin/Support.jsx
  'message': 'Message',

  // Dashboard/CreateAppointment.jsx
  'easilyScheduleClientForNextCut': 'Easily schedule a client for their next cut',
  'selectService': 'Select Service',
  'start': 'Start',
  'selectTime': 'Select Time',
  'end': 'End',
  'bookAppointment': 'Book Appointment',
  'addClientDirect': 'Add Client Direct',
  'searchByNameOrPhoneNumber': 'Search by name or phone number...',
  'noClientsFound': 'No clients found',
  'noMatchingClientsTryAgain': 'No matching clients. Try again with a different search term.',

  // Dashboard/FlashSale.jsx
  'endDateMustBeAfterStartDate': 'End date must be after start date',
  'flashSaleName': 'Flash Sale Name',
  'enterFlashSaleName': 'Enter flash sale name',
  'enterDescription': 'Enter description',
  'searchFlashSales': 'Search flash sales',
  'noFlashSalesFound': 'No flash sales found',
  'createFirstFlashSale': 'Create your first flash sale',
  'createFlashSale': 'Create Flash Sale',
  'editFlashSale': 'Edit Flash Sale',
  'deleteFlashSale': 'Delete Flash Sale',
  'areYouSureDeleteFlashSaleGeneric': 'Are you sure you want to delete this flash sale?',
  'selectStartDate': 'Select start date',
  'selectEndDate': 'Select end date',
  'upcoming': 'Upcoming',
  'ended': 'Ended',
  'originalPrice': 'Original Price',
  'flashSaleDiscountApplied': 'Flash sale discount will be applied when booking',
  'happyHourDiscountApplied': 'Happy hour discount will be applied when booking',
  'bothDiscountsApplied': 'Both discounts will be applied when booking',
  'flashSaleOverlapTitle': 'Flash Sale Conflict',
  'activeFlashSale': 'Active Flash Sale',
  'applyBothDiscountsQuestion': 'Apply both discounts during happy hour time?',
  'yesApplyBoth': 'Yes, Apply Both',
  'noOnlyHappyHour': 'No, Only Happy Hour',
  'promotionOverlapTitle': 'Happy Hour Conflict',
  'activeHappyHours': 'Active Happy Hours',
  'noOnlyFlashSale': 'No, Only Flash Sale',
  'selectAll': 'Select All',
  'selected': 'selected',
  'selectAtLeastOneService': 'Please select at least one service',

  // ClientsNote.jsx keys

  // profileimages.jsx keys
  'preview': 'Preview',
  'logo': 'Logo',
  'logoDescription': 'Upload your business logo to enhance your brand visibility',
  'addLogo': 'Add Logo',
  'workplacePhotos': 'Workplace Photos',
  'workplacePhotosDescription': 'Upload photos of your workplace to showcase your environment',

  // Preview Modal keys
  'imagePreview': 'Image Preview',
  'allUploadedImages': 'All Uploaded Images',
  'businessLogo': 'Business Logo',
  'noLogoUploaded': 'No Logo Uploaded',
  'uploadLogoToSeePreview': 'Upload a logo to see preview',
  'noWorkplacePhotos': 'No Workplace Photos',
  'uploadWorkplacePhotosToSeePreview': 'Upload workplace photos to see preview',
  'noGalleryImages': 'No Gallery Images',
  'uploadGalleryImagesToSeePreview': 'Upload gallery images to see preview',
  'workplacePhoto': 'Workplace Photo',
  'workplace': 'Workplace',
  'max5Photos': 'Max 5 Photos',
  'unlimited': 'Unlimited',
  'totalImages': 'Total Images',
  'lastUpdated': 'Last Updated',
  'failedToFetchBusinessSettings': 'Failed to fetch business settings',

  // Client/Header.jsx keys

  // MessageBlast.jsx keys

  // Promotion.jsx keys

  // Client-Section/ClientManagement.jsx keys

  // Client-Section/ClientSection.jsx keys (Mass Invite)
  'massInviteClients': 'Mass Invite Clients',
  'selectExistingClientsDescription': 'Select existing clients to send custom messages (email + SMS) inviting them to book appointments through the app.',
  'selectFromPhoneContacts': 'Select from Phone Contacts',
  'deselectAll': 'Deselect All',
  'searchClientByName': 'Search client by name (e.g., John, John Doe)',
  'clear': 'Clear',
  'result': 'result',
  'results': 'results',
  'invitationMessage': 'Invitation Message',
  'enterInvitationMessage': 'Enter your invitation message...',
  'messageSentViaEmailSMS': 'This message will be sent via both email and SMS to all selected clients.',
  'processingMessages': 'Processing messages...',
  'noClientsSelected': 'No clients selected',
  'clientsSelected': 'client',
  'clientsSelectedPlural': 'clients',
  'sendMessages': 'Send Messages',
  'sendingMessages': 'Sending Messages...',
  'messagesSentSuccessfully': 'Messages sent successfully!',
  'pleaseSelectAtLeastOneClient': 'Please select at least one client',
  'pleaseEnterMessage': 'Please enter a message',
  'noClientsMatchedSearch': 'No clients matched your search. Try a different name.',
  'noClientsFoundAddFirst': 'No clients found. Please add clients first.',
  'contactPickerNotSupported': 'Contact Picker API is not supported on this device. Please select from existing clients list.',
  'selectedClientsFromContacts': 'Selected {count} existing client(s) from your contacts',
  'contactsNotFoundInList': '{count} contact(s) not found in your client list. Please add them as clients first.',
  'failedToAccessContacts': 'Failed to access contacts. Please select from existing clients list.',
  'foundMatchingClients': 'Found {count} matching client(s)',
  'noClientsMatchedName': 'No clients matched that name',
  'pleaseEnterNameToSearch': 'Please enter a name to search',
  'failedToSendMessages': 'Failed to send messages',

  // Support/Ticket.jsx keys
  'yourTicket': 'Your ticket',
  'yourTicketNotification': 'Your ticket notification',
  'activeTickets': 'You have {count} active ticket{s}',
  // Admin reply UI
  'adminReply': 'Admin Reply',
  'replyToBarber': 'Reply to Barber',
  'enterYourReply': 'Enter your reply',
  'sendReply': 'Send Reply',

  // AutomatedReminders.jsx keys
  'smsReminders': 'SMS Reminders',
  'smsMessageTemplate': 'SMS Message Template',
  'smsMessageTemplateDescription': 'Customize your SMS reminder message template',
  'smsMessagePlaceholder': 'Enter your SMS message template here',

  // AddyourClients.jsx keys
  'addClientDescription': 'Add client description',
  'additionalInfo': 'Additional Info',
  'assignToStaffMember': 'Assign to Staff Member',

  // businessDetails.jsx keys

  // suggest-feature.jsx keys

  // LocationPage.jsx keys
  'locationMobileServices': 'Location & Mobile Services',
  'iWork': 'I work',
  'atMyPlaceOnly': 'At my place only',
  'bothMyPlaceAndMobile': 'Both my place and mobile',
  'onlyMobile': 'Only mobile',
  'notWorking': 'Not working',
  'startTypingToSearchLocations': 'Start typing to search locations',
  'mapLocation': 'Map Location',
  'adjustMap': 'Adjust Map',
  'invalidCoordinatesDetected': 'Invalid coordinates detected. Please reposition the pin before saving.',
  'googlePlaceIdTooltip': 'This ID is automatically detected from your map location and is used for the Google Review link feature.',
  'detectingPlaceId': 'Detecting Google Place ID...',
  'placeIdDetected': 'Place ID Detected',
  'placeIdNotFound': 'Place ID not found for this location',
  'placeIdNotFoundHint': 'Try moving the marker closer to your business location on the map.',
  'selectLocationForPlaceId': 'Select a location on the map to auto-detect Place ID',

  // Gallery.jsx keys

  // serviceSetup.jsx keys

  // BusinessInfo.jsx keys

  // Homepage.jsx keys

  // HappyHours.jsx keys
  'selectStartTime': 'Select start time',
  'selectEndTime': 'Select end time',
  'happyHoursDiscount': 'Happy Hours Discount',
  'noServicesFound': 'No services found',
  'copySettingsApplyToOtherDays': 'Copy settings and apply to other days',
  'startPromotion': 'Start Promotion',
  'updatePromotion': 'Update Promotion',

  // DeleteBarberModal.jsx keys
  'deleteBarberAccount': 'Delete Barber Account',
  'areYouSurePermanentlyDeleteBarber': 'Are you sure you want to permanently delete',
  'thisBarber': 'this barber',
  'thisActionCannotBeUndoneRemoveAllData': 'This action cannot be undone and will remove all data',
  'noCancel': 'No, Cancel',
  'yesDelete': 'Yes, Delete',

  // NoShowPenalty.jsx keys
  'amountIsRequired': 'Amount is required',
  'commentIsRequired': 'Comment is required',

  // No-Show Dialog (NoShowPenalty.jsx) - Walk-in view
  'noShowFor': 'No-Show for {clientName}',
  'appointmentService': 'Service',
  'clientIncidentHistory': 'Client Incident History',
  'noIncidentHistoryFound': 'No incident history found',
  'incidentNotes': 'Incident Notes',
  'addIncidentNotePlaceholder': 'Enter a note about this no-show incident...',
  'incidentNoteWillBePermanentlyAssociated': 'This note will be permanently saved to the client profile.',


  // ClientProfileSidebar.jsx - Blocked client badge and unblock button
  'appBookingBlocked': 'App Booking Blocked',
  'unblockClient': 'Unblock client',
  'incidentHistory': 'Incident History',
  'recordedByBarber': 'BARBER',

  // useClients.js - Hardcoded toast messages now using tc()
  'clientDeletedSuccessfully': 'Client deleted successfully!',
  'failedToDeleteClient': 'Failed to delete client',
  'clientNotesUpdatedSuccessfully': 'Client notes updated successfully!',
  'failedToUpdateClientNotes': 'Failed to update client notes',
  'csvUploadedWithErrors': 'CSV uploaded with {count} errors. Check console for details.',
  'csvUploadedSuccessfully': 'CSV uploaded successfully!',
  'failedToUploadCSV': 'Failed to upload CSV',
  'invitationSmsSentSuccessfully': 'Invitation SMS sent successfully!',
  'failedToSendInvitationSms': 'Failed to send invitation SMS',
  'messagesSentSummary': 'Messages sent: {emailSent} emails, {smsSent} SMS to {total} clients',
  'clientUnblockedSuccessfully': 'Client unblocked successfully!',
  'failedToUnblockClient': 'Failed to unblock client',

  // Topbar.jsx keys
  'johnSmith': 'John Smith',
  'emilyJohnson': 'Emily Johnson',
  'mickWilson': 'Mick Wilson',

  // LocationPage.jsx keys
  'geolocationNotSupported': 'Geolocation is not supported by this browser',
  'errorProcessingLocation': 'Error processing current location',
  'locationPermissionDenied': 'Location access denied by user',
  'locationUnavailable': 'Location information is unavailable',
  'locationTimeout': 'Location request timed out',
  'unknownLocationError': 'An unknown error occurred while retrieving location',
  'useCurrentLocation': 'Use Current Location',
  'startTypingCityName': 'Start typing city name',
  'howPinWorks': 'How pin works',
  'updatingAddress': 'Updating address...',

  // AdminDashboard.jsx keys
  'csvExportedSuccessfully': 'CSV exported successfully!',
  'csvExportFailed': 'Failed to export CSV file',

  // Authentication hooks keys
  'loginFailed': 'Login failed',
  'socialLoginFailed': 'Social login failed',
  'failedToStartFreeTrial': 'Failed to start free trial',
  'failedToCreateSubscription': 'Failed to create subscription',

  // Client components keys
  'welcomeBackMessage': 'We\'re glad to see you again! Continue where you left off.',
  'bookingFailed': 'Booking failed',
  'failedToBookAppointment': 'Failed to book appointment',
  'errorBookingAppointment': 'Error booking appointment',

  // CreateAppointment.jsx keys
  'selectedStaffDoesNotOfferService': 'Selected staff does not offer the chosen service',
  'selectedServiceNotOfferedByStaff': 'Selected service is not offered by the chosen staff',

  // Marketing.jsx keys

  // EditStaffMember.jsx keys
  'invalidEmailAddress': 'Invalid email address',
  'roleRequired': 'Role is required',
  'positionRequired': 'Position is required',

  // profile.jsx keys
  'uploadFromInstagram': 'Upload from Instagram',
  'uploadFromDevice': 'Upload from Device',
  'addGallery': 'Add Gallery',
  'addGalleryDescription': 'Add photos to your gallery',


  // ProfileSetting.jsx keys

  // AddStaffMember.jsx keys

  // ClientSection.jsx keys
  'addYourClients': 'Add Your Clients',
  'addYourClientsDescription': 'Add your clients to the system',
  'uploadingProcessingCSV': 'Uploading and processing CSV',
  'readyToImport': 'Ready to Import',
  'importing': 'Importing',
  'importClient': 'Import Client',
  'selectCSVFile': 'Select CSV File',
  'bringClientsOnboard': 'Bring Clients Onboard',
  'importClientDetails': 'Import client details',

  // CreateAppointment.jsx keys

  // EditClient.jsx keys
  'savingChanges': 'Saving changes',

  // Home.jsx keys

  // StaffManagement.jsx keys


  // EditBusinessHours.jsx keys
  'businessHoursDescription': 'Set your business operating hours',
  'firstShift': 'First Shift',
  'secondShift': 'Second Shift',
  'thirdShift': 'Third Shift',
  'shift': 'Shift',
  'addAnotherShift': 'Add Another Shift',
  'timeFormatPreference': 'Time Format Preference',
  'timeFormatPreferenceDescription': 'Choose how you want to enter and display working hours across your profile.',
  'timeFormatOption12h': '12-hour (AM/PM)',
  'timeFormatOption24h': '24-hour',
  'closedTimeRange': '00:00 - 00:00',

  // businessSettings.jsx keys
  'businessSettingsDescription': 'Manage your business settings and preferences',
  'businessHoursSettings': 'Business Hours Settings',
  'businessHoursSettingsDescription': 'Set your operating hours',
  'locationSettings': 'Location Settings',
  'locationSettingsDescription': 'Manage your business location',
  'gallerySettings': 'Gallery Settings',
  'gallerySettingsDescription': 'Manage your business gallery',

  // addServices.jsx keys
  'addNewService': 'Add New Service',
  'addNewServiceDescription': 'Add a new service to your business',
  'addStartServices': 'Add Start Services',
  'addAtLeastOneServiceNote': 'You must add at least one service now. Later, you will be able to add more services, edit the details, and group the services by categories.',
  'nameOfTheService': 'Name of the service',
  'serviceHours': 'Service hours',
  'hourShort': 'h',
  'minuteShort': 'min',
  'pricePlaceholder': '10.00',
  'currencySymbol': '$',
  'colorRed': 'Red',
  'colorOrange': 'Orange',
  'colorBlue': 'Blue',
  'colorGreen': 'Green',
  'colorPurple': 'Purple',
  'colorPink': 'Pink',
  'colorIndigo': 'Indigo',
  'colorYellow': 'Yellow',
  'enterServiceName': 'Enter service name',
  'enterServiceDescription': 'Enter service description',
  'selectDuration': 'Select duration',
  'assignStaff': 'Assign Staff',
  'selectStaffMembers': 'Select staff members',
  'selectCategory': 'Select category',
  'addService': 'Add Service',

  // services.jsx keys
  'editService': 'Edit Service',
  'startAddingServices': 'Start Adding Services',
  'updateServiceDetailsBelow': 'Update your service details below.',
  'youMustAddAtLeastOneService': 'You must add at least one service now. Later, you will be able to add more services, edit the details, and group the services by categories.',
  'keepThisSection': 'Keep this section',

  // HelpCenter.jsx keys
  'helpCenter': 'Help Center',
  'frequentlyAskedQuestions': 'Frequently Asked Questions',
  'howDoICreateAnAccount': 'How do I create an account?',
  'toCreateAnAccountClickOnTheSignUpButton': 'To create an account, click on the \'Sign Up\' button on the homepage and fill in the required details. You will receive a confirmation email to verify your account.',
  'howDoIBookAnAppointment': 'How do I book an appointment?',
  'onceLoggedInYouCanBrowseAvailableServices': 'Once logged in, you can browse available services and professionals. Select your desired service, choose a time slot, and confirm your booking. You will receive a notification once your appointment is confirmed.',
  'canIRescheduleOrCancelMyAppointment': 'Can I reschedule or cancel my appointment?',
  'yesYouCanRescheduleOrCancelYourAppointment': 'Yes, you can reschedule or cancel your appointment through your dashboard. Please check our cancellation policy for any applicable fees.',
  'howDoIUpdateMyProfileInformation': 'How do I update my profile information?',
  'youCanUpdateYourProfileInformation': 'You can update your profile information by navigating to the \'Profile\' section in your account settings. Here you can change your personal details, password, and notification preferences.',
  'whatPaymentMethodsDoYouAccept': 'What payment methods do you accept?',
  'weAcceptVariousPaymentMethods': 'We accept various payment methods, including credit/debit cards and other digital payment options. All transactions are securely processed.',

  // CreateTicket.jsx keys
  'createSupportTicket': 'Create Support Ticket',
  'createSupportTicketDescription': 'Create a new support ticket for assistance',
  'ticketTitle': 'Ticket Title',
  'enterTicketTitle': 'Enter ticket title',
  'ticketDescription': 'Ticket Description',
  'enterTicketDescription': 'Enter ticket description',
  'ticketPriority': 'Ticket Priority',
  'selectPriority': 'Select priority',
  'attachments': 'Attachments',
  'addAttachment': 'Add Attachment',
  'submitTicket': 'Submit Ticket',

  // ReservationModal.jsx keys
  'personalizeYourHaircutExperience': 'Personalize Your Haircut Experience',
  'uploadReferencePhotos': 'Upload Reference Photos',
  'addPhotos': 'Add Photos',
  'addSpecificHaircutInstructions': 'Add Specific Haircut Instructions',
  'enterDetailedInstructionsForYourHaircut': 'Enter detailed instructions for your haircut',
  'skip': 'Skip',
  'booking': 'Booking...',
  'welcomeBack': 'Welcome Back!',
  'continue': 'Continue',
  // Added missing keys referenced in ReservationModal.jsx (English defaults)
  'noAvailabilityOnThisDate': 'No availability on this date',
  'findFirstAvailableDateMessage': 'Click below to jump to the first date with availability',
  'findFirstAvailableDate': 'Find first available date',
  'thereIsNoAvailabilityOnThisDate': 'There is no availability on this date.',
  'findTheFirstAvailableDate': 'Find the first available date',
  'loadingAvailableTimeSlots': 'Loading available time slots...',
  'noAvailableTimeSlotsForThisDate': 'No available time slots for this date',
  'pleaseSelectADifferentDate': 'Please select a different date',
  'employee': 'Employee:',
  'any': 'Any',
  'usd': 'USD',
  'checkingProfile': 'Checking Profile...',
  'serviceInformationIsMissingPleaseTryAgain': 'Service information is missing. Please try again.',
  'dateIsMissingPleaseTryAgain': 'Date is missing. Please try again.',
  'timeSlotIsMissingPleaseTryAgain': 'Time slot is missing. Please try again.',
  'businessInformationIsMissingPleaseTryAgain': 'Business information is missing. Please try again.',
  'clientAuthenticationRequiredPleaseCompleteYourProfileFirst': 'Client authentication required. Please complete your profile first.',
  'staffInformationIsMissingPleaseTryAgain': 'Staff information is missing. Please try again.',
  'failedToBookAppointmentPleaseTryAgain': 'Failed to book appointment. Please try again.',
  'anErrorOccurredWhileBookingYourAppointmentPleaseTryAgain': 'An error occurred while booking your appointment. Please try again.',
  'yourAppointmentHasBeenBookedSuccessfully': 'Your appointment has been booked successfully!',
  'errorLoadingClientProfile': 'Error loading client profile:',
  'errorCheckingClientProfile': 'Error checking client profile:',
  'errorAuthenticatingClient': 'Error authenticating client:',

  // FlashSale.jsx keys
  'flashSalePromotion': 'Flash Sale Promotion',
  'flashSalePromotionDescription': 'Create time-limited flash sale promotions',
  'promotionName': 'Promotion Name',
  'enterPromotionName': 'Enter promotion name',
  'discountPercentage': 'Discount Percentage',
  'enterDiscountPercentage': 'Enter discount percentage',
  'validFrom': 'Valid From',
  'validTo': 'Valid To',
  'chooseServices': 'Choose services for this promotion',
  'createPromotion': 'Create Promotion',
  'manageFlashSales': 'Manage Flash Sales',
  'manageFlashSalesDescription': 'Create and manage your flash sale promotions',
  'noFlashSalesYet': 'No flash sales yet',
  'createYourFirstFlashSale': 'Create your first flash sale',
  'validUntil': 'Valid Until',
  'expired': 'Expired',

  // ClientProfile.jsx keys
  'clientDetails': 'Client Details',
  'appointmentHistory': 'Appointment History',
  'noAppointmentsYet': 'No appointments yet',
  'memberSince': 'Member Since',
  'totalSpent': 'Total Spent',
  'averageRating': 'Average Rating',
  'noRatingYet': 'No rating yet',
  'personalNotes': 'Personal Notes',
  'addNote': 'Add Note',
  'editNote': 'Edit Note',
  'deleteNote': 'Delete Note',
  'noteAdded': 'Note Added',
  'noteUpdated': 'Note Updated',
  'noteDeleted': 'Note Deleted',
  'confirmDeleteNote': 'Are you sure you want to delete this note?',
  'enterYourNote': 'Enter your note',
  'saveNote': 'Save Note',

  // AppointmentHistory.jsx keys
  'manageAppointmentHistory': 'Manage Appointment History',
  'trackAndManagePastAppointments': 'Track and Manage Past Appointments',
  'searchByIdNameEmail': 'Search by ID, name & email address',
  'canceled': 'Canceled',
  'selectStatus': 'Select Status',
  'thirtyMinutes': '30 Minutes',
  'fortyFiveMinutes': '45 Minutes',
  'sixtyMinutes': '60 Minutes',

  // BusinessInfo.jsx keys
  'socialMedia': 'Social Media',
  'twitter': 'Twitter',
  'website': 'Website',
  'onlineShop': 'Online Shop',

  // Configuration.jsx keys
  'addressConfiguration': 'Address Configuration',
  'fineTuneYourAddressSettings': 'Fine-Tune Your Address Settings for Seamless Navigation',
  'enterYourStreetName': 'Enter your street name',
  'enterYourHouseBuildingNumber': 'Enter your house/building number',
  'newYork': 'New York',
  'losAngeles': 'Los Angeles',
  'chicago': 'Chicago',
  'houston': 'Houston',
  'phoenix': 'Phoenix',
  'postalCode': 'Postal Code',
  'streetNameRequired': 'Street name is required',
  'houseBuildingNumberRequired': 'House/building number is required',
  'pleaseSelectCity': 'Please select a city',
  'postalCodeRequired': 'Postal code is required',

  // addServices.jsx color keys
  'red': 'Red',
  'orange': 'Orange',
  'blue': 'Blue',
  'green': 'Green',
  'purple': 'Purple',
  'pink': 'Pink',
  'indigo': 'Indigo',
  'yellow': 'Yellow',
  'beardTrimming': 'Beard trimming',
  'gentlemansCut': "Gentleman's Cut",
  'shaven': 'Shaven',

  // Client-side History.jsx strings
  'history': 'History',
  'reviewYourPastHaircuts': 'Review your past haircuts, services, and personal notes all in one place.',
  'shareYourThoughtsForYourNextCut': 'Share Your Thoughts for Your Next Cut',
  'writeHereAnyConsiderations': 'Write here any considerations for the next cut or report any issue with this haircut',
  'service': 'Service',
  'barberName': 'Barber Name',
  'barberProfileLoadedSuccessfully': 'Barber profile loaded successfully',
  'failedToLoadBarberProfile': 'Failed to load barber profile',
  'unableToLoadBarberProfile': 'Unable to Load Barber Profile',
  'barberProfileDescription': 'View barber information and services',
  'createAccount': 'Create Account',
  'createAccountToBookAppointment': 'Create an account to book your appointment',
  'phoneRequired': 'Phone number is required',
  'invalidEmailFormat': 'Please enter a valid email address',
  'clientCreatedSuccessfully': 'Client created successfully',
  'errorCreatingClient': 'Error creating client',
  'creating': 'Creating...',
  'enterPhone': 'Enter phone number',
  'invalidBookingFlow': 'Invalid booking flow',
  'dateTime': 'Date & Time',
  'noteIsRequired': 'Note is required',
  'pleaseGiveAtLeastOneStar': 'Please give at least 1 star',
  'addReply': 'Add Reply',
  'gotItIllKeepTheSidesLonger': 'Got it! I\'ll keep the sides longer on your next cut.',
  'writeYourReply': 'Write your reply...',

  // Client-side Home.jsx footer strings
  'aboutUs': 'About Us',
  'howItWorks': 'How It Works',
  'careers': 'Careers',
  'privacyPolicy': 'Privacy Policy',
  'termsOfService': 'Terms of Service',
  'blog': 'Blog',
  'pressKit': 'Press Kit',
  'apiDocumentation': 'API Documentation',
  'statusPage': 'Status Page',
  'features': 'Features',
  'security': 'Security',
  'enterprise': 'Enterprise',
  'developers': 'Developers',
  'community': 'Community',
  'contactSupport': 'Contact Support',
  'reportBug': 'Report Bug',
  'requestFeature': 'Request Feature',
  'systemStatus': 'System Status',
  'serviceUpdates': 'Service Updates',
  'maintenanceSchedule': 'Maintenance Schedule',
  'downloadApp': 'Download App',
  'mobileApp': 'Mobile App',
  'desktopApp': 'Desktop App',
  'browserExtension': 'Browser Extension',
  'partnerships': 'Partnerships',
  'affiliateProgram': 'Affiliate Program',
  'referralProgram': 'Referral Program',
  'becomePartner': 'Become a Partner',
  'investorRelations': 'Investor Relations',
  'newsroom': 'Newsroom',
  'events': 'Events',
  'webinars': 'Webinars',
  'newsletter': 'Newsletter',
  'followUs': 'Follow Us',
  'joinCommunity': 'Join Community',
  'testimonials': 'Testimonials',
  'faqs': 'FAQs',
  'newsUpdates': 'News & Updates',

  // Client-side Homepage.jsx toast messages

  // Client-side ClientProfile.jsx strings

  // Client-side ReservationModal.jsx day names

  // Footer Component
  'youCalendyDescription': 'YouCalendy makes scheduling easy and fast. Connect your calendar and share your availability. Ideal for professionals and teams.',
  'quickLinks': 'Quick Links',
  'advantages': 'Advantages',
  'termsAndConditions': 'Terms & Conditions',
  'copyrightAllRightsReserved': 'Copyright All Rights Reserved',
  'designDevelopedBy': 'Design & Developed by',

  // Barber Profile specific keys
  'whoWeAre': 'Who We Are',
  'noDescriptionAdded': 'No description added',
  'openingHours': 'Opening Hours',
  'searchForService': 'Search for service',
  'servicesWeProvide': 'Services We Provide',
  'reserve': 'Reserve',

  // Days of the week

  // Social Media

  // Reservation Modal
  'enterDetails': 'Enter Details',
  'pleaseProvideYourInformation': 'Please provide your information to book an appointment',
  'chooseYourPreferredStaffMember': 'Choose your preferred staff member for this appointment',
  'confirmYourAppointment': 'Confirm Your Appointment',
  'readyToBookYourAppointment': 'Ready to book your appointment?',

  // Client Details Modal
  'detailsSavedSuccessfully': 'Details saved successfully',
  'failedToSaveDetails': 'Failed to save details',
  'errorSavingDetails': 'Error saving details',

  // Client Profile Access
  'mustBookFirstAppointmentToAccessProfile': 'You must book your first appointment to register as a client and gain access to your profile.',
  'registeredAsClientCanAccessProfile': 'You are now registered as a client and can access your profile!',

  // Client Authentication - Sign In
  'signInToYourAccount': 'Sign in to your account to continue',
  'signInFailed': 'Failed to sign in',
  'signingIn': 'Signing in...',
  'dontHaveAnAccount': "Don't have an account?",

  // Client Authentication - Sign Up
  'createAnAccountToContinue': 'Create an account to continue',
  'accountCreatedSuccessfully': 'Account created successfully',
  'failedToCreateAccount': 'Failed to create account',
  'errorCreatingAccount': 'Error creating account',
  'creatingAccount': 'Creating account...',
  'alreadyHaveAnAccount': 'Already have an account?',

  // Client Authentication - Password
  'passwordRequired': 'Password is required',
  'enterPassword': 'Enter your password',
  'enterNewPassword': 'Enter new password (min 6 characters)',

  // Client Authentication - Forgot Password
  'enterEmailToReceiveResetToken': 'Enter your email to receive a password reset token',
  'enterResetTokenAndNewPassword': 'Enter the reset token sent to your email and your new password',
  'resetTokenSent': 'Password reset token has been sent to your email',
  'errorSendingResetToken': 'Error sending reset token',
  'passwordResetSuccessfully': 'Password reset successfully',
  'errorResettingPassword': 'Error resetting password',
  'resetTokenRequired': 'Reset token is required',
  'resetToken': 'Reset Token',
  'enterResetToken': 'Enter the 6-digit token',
  'sendResetToken': 'Send Reset Token',
  'backToSignIn': 'Back to Sign In',
  'resetting': 'Resetting...',
  'didntReceiveToken': "Didn't receive the token?",
  'resendToken': 'Resend Token',

};

if (typeof window !== 'undefined') {
  window.__batchTranslationCatalog = { TRANSLATION_KEYS, COMMON_TEXTS };
}

export const BatchTranslationContext = createContext();

export const BatchTranslationProvider = ({ children }) => {
  const { t } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'en');
  const [commonTexts, setCommonTexts] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [autoExtractionEnabled, setAutoExtractionEnabled] = useState(true);
  const [extractedTexts, setExtractedTexts] = useState([]);
  const [translationsUpdated, setTranslationsUpdated] = useState(0);

  // Initialize context detection service
  useEffect(() => {
    contextDetectionService.initialize();
    // console.log('[BatchTranslation] Context detection service initialized');
  }, []);

  // Listen to service state changes
  // Note: We don't sync currentLanguage from service to avoid conflicts
  // The context's changeLanguage function is the source of truth
  useEffect(() => {
    const unsubscribe = batchTranslationService.addListener((state) => {
      setIsLoading(state.isLoading);
      setIsProcessingBatch(state.isProcessingBatch);
      // Don't sync currentLanguage from service - context manages it directly
      // setCurrentLanguage(state.currentLanguage);
      if (state.translationsUpdated) {
        setTranslationsUpdated(state.translationsUpdated);
      }
    });

    return unsubscribe;
  }, []);

  // Hydrate when language changes (e.g., loaded from backend after login)
  const lastHydratedLanguageRef = React.useRef(null);
  useEffect(() => {
    if (
      currentLanguage &&
      currentLanguage !== 'en' &&
      currentLanguage !== lastHydratedLanguageRef.current &&
      !isLoading &&
      !isProcessingBatch
    ) {
      lastHydratedLanguageRef.current = currentLanguage;
      dayjs.locale(currentLanguage); // Ensure dayjs locale is set on Mount too
      batchTranslationService.ensureTranslationsForCurrentLanguage();
    }
  }, [currentLanguage, isLoading, isProcessingBatch]);

  // Hydrate translations for saved/user language on mount and after DOM text registration
  useEffect(() => {
    // Attempt hydration a bit after mount to allow initial text registration
    const timeoutId = setTimeout(() => {
      // Load cached translations for current language from localStorage
      try {
        const key = `youCalendy_translationCache_${batchTranslationService.getState().currentLanguage}`;
        const raw = localStorage.getItem(key);
        if (raw) {
          const entries = JSON.parse(raw);
          if (Array.isArray(entries)) {
            entries.forEach(([k, v]) => {
              // Backfill in-memory cache without network
              window.__translationCache?.set?.(k, v);
            });
          }
        }
      } catch { }
      batchTranslationService.ensureTranslationsForCurrentLanguage();
    }, 800);
    return () => clearTimeout(timeoutId);
  }, []);

  // Initialize common texts and auto-extraction
  useEffect(() => {
    COMMON_TEXTS.forEach(text => {
      batchTranslationService.registerPageText(text, 'common');
    });

    // Initialize text extraction if enabled
    if (autoExtractionEnabled) {
      initializeAutoExtraction();
    }
  }, [autoExtractionEnabled]);

  // Auto-extraction functionality
  const initializeAutoExtraction = useCallback(() => {
    // Start text extraction after a short delay to allow DOM to settle
    setTimeout(async () => {
      await textExtractionService.initializeExtraction();

      // Get extracted texts and register them
      const extractedTexts = textExtractionService.getExtractedTexts();
      setExtractedTexts(extractedTexts);

      // console.log('Extracted texts for translation:', extractedTexts);
      // console.log('Total extracted texts count:', extractedTexts.length);

      // Register extracted texts for translation
      extractedTexts.forEach(text => {
        batchTranslationService.registerPageText(text, 'auto-extracted');
      });

      // Also register all TRANSLATION_KEYS values
      Object.values(TRANSLATION_KEYS).forEach(text => {
        batchTranslationService.registerPageText(text, 'translation-keys');
      });

      // Register COMMON_TEXTS
      COMMON_TEXTS.forEach(text => {
        batchTranslationService.registerPageText(text, 'common-texts');
      });

      // console.log('All registered texts:', batchTranslationService.getAllRegisteredTexts());
      // After registering initial texts, hydrate translations if needed
      setTimeout(() => {
        batchTranslationService.ensureTranslationsForCurrentLanguage();
      }, 300);
    }, 1000);
  }, []);

  // Auto-extract texts when page changes
  const autoExtractPageTexts = useCallback((pageId) => {
    if (!autoExtractionEnabled) return;

    // Clear previous extractions
    textExtractionService.reset();

    // Start new extraction
    setTimeout(async () => {
      await textExtractionService.initializeExtraction();
      const newTexts = textExtractionService.getExtractedTexts();

      setExtractedTexts(newTexts);

      // console.log('Page extraction for', pageId, ':', newTexts);

      // Register new texts
      newTexts.forEach(text => {
        batchTranslationService.registerPageText(text, pageId || 'current');
      });

      // Also register all TRANSLATION_KEYS values for this page
      Object.values(TRANSLATION_KEYS).forEach(text => {
        batchTranslationService.registerPageText(text, pageId || 'current');
      });

      // Register COMMON_TEXTS for this page
      COMMON_TEXTS.forEach(text => {
        batchTranslationService.registerPageText(text, pageId || 'current');
      });

      // console.log('Total registered texts for page', pageId, ':', batchTranslationService.getAllRegisteredTexts().length);
    }, 500);
  }, [autoExtractionEnabled]);

  // Change language via i18next and save to API
  // Instant transition - no loading states, all texts are local
  const changeLanguage = useCallback((newLanguage) => {
    if (newLanguage === currentLanguage) return;

    // Validate language - only allow 'en' or 'es'
    const validLanguages = ['en', 'es'];
    if (!validLanguages.includes(newLanguage)) {
      console.warn(`Invalid language "${newLanguage}", defaulting to "en"`);
      newLanguage = 'en';
    }

    // Instant update - update state immediately for instant UI feedback
    setCurrentLanguage(newLanguage);
    setTranslationsUpdated(prev => prev + 1);

    // Save to localStorage immediately
    try {
      localStorage.setItem('youCalendy_selectedLanguage', newLanguage);
    } catch { }

    // Update i18next synchronously (texts are local, should be instant)
    // Use void to explicitly ignore the promise
    void i18n.changeLanguage(newLanguage);

    // Update dayjs locale for calendar/date components
    dayjs.locale(newLanguage);

    // Also update batchTranslationService currentLanguage (for consistency)
    // Update directly without triggering async processing
    try {
      batchTranslationService.currentLanguage = newLanguage;
      batchTranslationService.saveLanguage(newLanguage);
      // Notify listeners so other components get updated
      batchTranslationService.notifyListeners();
    } catch (err) {
      console.warn('Failed to update batchTranslationService:', err);
    }

    // Save to API in background (non-blocking, fire and forget)
    // Check if user is authenticated before making API call
    const user = localStorage.getItem("user") || localStorage.getItem("adminUser");
    if (user) {
      const formData = new FormData();
      formData.append("language", newLanguage);
      console.log('Saving language to API:', newLanguage);
      formAxios.put("/auth/profile-settings", formData)
        .then((response) => {
          console.log('Language preference saved to API successfully:', newLanguage, response.data);
        })
        .catch((apiError) => {
          console.error('Failed to save language to API:', apiError.response?.data || apiError.message);
        });
    } else {
      console.log('User not authenticated, skipping API language save');
    }
  }, [currentLanguage]);

  // Translate text using i18next (fallback to English text)
  const translateText = useCallback((text, targetLang = currentLanguage) => {
    return i18n.t(text, { lng: targetLang, defaultValue: text });
  }, [currentLanguage]);

  // Get cached translation via i18next (returns key if missing)
  const getCachedTranslation = useCallback((text, targetLang = currentLanguage) => {
    return i18n.t(text, { lng: targetLang, defaultValue: text });
  }, [currentLanguage]);

  // Register text for current page
  const registerPageText = useCallback((text, pageId) => {
    batchTranslationService.registerPageText(text, pageId);
  }, []);

  // Set current page with auto-extraction
  const setCurrentPage = useCallback((pageId) => {
    batchTranslationService.setCurrentPage(pageId);
    autoExtractPageTexts(pageId);
  }, [autoExtractPageTexts]);

  // Toggle auto-extraction
  const toggleAutoExtraction = useCallback((enabled) => {
    setAutoExtractionEnabled(enabled);
    if (enabled) {
      initializeAutoExtraction();
    } else {
      textExtractionService.cleanup();
    }
  }, [initializeAutoExtraction]);

  // Manual text extraction
  const extractTextsManually = useCallback(() => {
    textExtractionService.reset();
    textExtractionService.initializeExtraction();
    const newTexts = textExtractionService.getExtractedTexts();
    setExtractedTexts(newTexts);
    return newTexts;
  }, []);

  // Bulk register texts
  const bulkRegisterTexts = useCallback((texts, pageId = 'current') => {
    texts.forEach(text => {
      batchTranslationService.registerPageText(text, pageId);
    });
  }, []);

  // Translation helper functions (i18next-backed)
  // Enhanced translation function that uses both native i18next and custom local keys
  // By using the 't' from useTranslation, it becomes reactive to i18n.changeLanguage()
  const tc = useCallback((key, params = {}) => {
    const englishText = TRANSLATION_KEYS[key] || key;
    if (!englishText) return key;
    
    // Explicitly pass the language to t() to ensure it uses the context's current state
    // but the actual re-render is triggered by the react-i18next useTranslation hook
    return t(englishText, { lng: currentLanguage, defaultValue: englishText, ...params });
  }, [t, currentLanguage]);

  const getCached = useCallback((text) => {
    return t(text, { lng: currentLanguage, defaultValue: text });
  }, [t, currentLanguage]);

  const value = {
    currentLanguage,
    commonTexts,
    isLoading,
    isProcessingBatch,
    changeLanguage,
    translateText,
    getCachedTranslation,
    registerPageText,
    setCurrentPage,
    tc,
    t,
    getCached,
    // Auto-extraction features
    autoExtractionEnabled,
    extractedTexts,
    toggleAutoExtraction,
    extractTextsManually,
    bulkRegisterTexts,
    autoExtractPageTexts
  };

  // Expose context to window for debugging
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__translationContext = {
        currentLanguage,
        isLoading,
        isProcessingBatch,
        changeLanguage,
        tc,
        t,
        getCached,
        provider: true,
        service: true
      };
    }
  }, [currentLanguage, isLoading, isProcessingBatch, changeLanguage, tc, t, getCached]);

  return (
    <BatchTranslationContext.Provider value={value}>
      <DatesProvider settings={{ locale: currentLanguage, firstDayOfWeek: 0, weekendDays: [0, 6] }}>
        {children}
      </DatesProvider>
    </BatchTranslationContext.Provider>
  );
};

export const useBatchTranslation = () => {
  const context = useContext(BatchTranslationContext);
  if (!context) {
    // Provide a fallback context to prevent crashes during development
    console.warn('useBatchTranslation used outside of BatchTranslationProvider, using fallback');
    return {
      tc: (key) => key, // Return the key as fallback
      t: (key) => key,
      currentLanguage: 'en',
      changeLanguage: () => { },
      isLoading: false,
      isProcessingBatch: false,
      getCached: () => null,
      autoExtractionEnabled: false,
      extractedTexts: [],
      toggleAutoExtraction: () => { },
      extractTextsManually: () => { },
      bulkRegisterTexts: () => { },
      autoExtractPageTexts: () => { }
    };
  }
  return context;
};

// Export TRANSLATION_KEYS for use by text extraction service
export { TRANSLATION_KEYS, COMMON_TEXTS };
