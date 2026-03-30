export const useAuth = () => {
  const token = localStorage.getItem("token");
  if (token) return true;
  return false;
};

export const userGetRole = () => {
  return JSON.parse(localStorage.getItem("user")).role;
};

export const userGetData = () => {
  return JSON.parse(localStorage.getItem("user"));
};
