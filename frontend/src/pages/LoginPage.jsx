import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../services/authService.js";
import useAuthStore from "../store/authStore.js";
import { useToast } from "../context/ToastContext.jsx";

function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = await login(email, password);
      setAuth(data.user, data.accessToken);
      navigate("/dashboard");
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="w-full max-w-sm bg-white dark:bg-gray-900 p-8 rounded-lg shadow-md border border-transparent dark:border-gray-800">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
          Log in to your account
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-blue-600 dark:text-blue-400 font-medium"
          >
            Sign up
          </Link>
        </p>
        <p className="mt-2 text-sm text-center">
          <Link
            to="/forgot-password"
            className="text-blue-600 dark:text-blue-400 font-medium"
          >
            Forgot password?
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
