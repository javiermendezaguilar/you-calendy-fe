import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  email: '',
  password: '',
  personalName: '',
  surname: '',
  phoneNumber: '',
  businessName: '',
  address: {
    streetName: '',
    houseNumber: '',
    city: '',
    postalCode: '',
  },
  location: {
    coordinates: [0, 0],
    address: '',
    googlePlaceId: null,
  },
  businessHours: {
    monday: { enabled: true, shifts: [{ start: '09:00', end: '17:00' }] },
    tuesday: { enabled: true, shifts: [{ start: '09:00', end: '17:00' }] },
    wednesday: { enabled: true, shifts: [{ start: '09:00', end: '17:00' }] },
    thursday: { enabled: true, shifts: [{ start: '09:00', end: '17:00' }] },
    friday: { enabled: true, shifts: [{ start: '09:00', end: '17:00' }] },
    saturday: { enabled: false, shifts: [] },
    sunday: { enabled: false, shifts: [] },
  },
  services: [],
  // You can add a step counter to manage the flow
  currentStep: 1,
};

export const registrationSlice = createSlice({
  name: 'registration',
  initialState,
  reducers: {
    // Action to update email and password
    setAuthDetails: (state, action) => {
      const { email, password } = action.payload;
      state.email = email;
      state.password = password;
    },
    // Action to update personal and business details
    setPersonalDetails: (state, action) => {
      const { personalName, surname, businessName, phoneNumber } = action.payload;
      state.personalName = personalName;
      state.surname = surname;
      state.businessName = businessName;
      state.phoneNumber = phoneNumber;
    },
    // Action to update address
    setAddress: (state, action) => {
      state.address = { ...state.address, ...action.payload };
    },
    // Action to update location
    setLocation: (state, action) => {
      state.location = { ...state.location, ...action.payload };
    },
    // Action to update business hours
    setBusinessHours: (state, action) => {
      state.businessHours = { ...state.businessHours, ...action.payload };
    },
    // Action to update services
    setServices: (state, action) => {
      state.services = action.payload;
    },
    // Action to move to the next step
    nextStep: (state) => {
      state.currentStep += 1;
    },
    // Action to move to the previous step
    prevStep: (state) => {
      state.currentStep -= 1;
    },
    // Action to reset the whole form
    resetRegistration: () => initialState,
  },
});

// Export actions to be used in components
export const {
  setAuthDetails,
  setPersonalDetails,
  setAddress,
  setLocation,
  setBusinessHours,
  setServices,
  nextStep,
  prevStep,
  resetRegistration,
} = registrationSlice.actions;

// Export the reducer to be added to the store
export default registrationSlice.reducer; 