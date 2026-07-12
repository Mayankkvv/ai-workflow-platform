import api from "./api.js";

export const getMe = async () => {
  const response = await api.get("/users/me");
  return response.data;
};

export const updateProfile = async (name, email) => {
  const response = await api.patch("/users/me", { name, email });
  return response.data;
};

export const changePassword = async (currentPassword, newPassword) => {
  const response = await api.put("/users/me/password", { currentPassword, newPassword });
  return response.data;
};