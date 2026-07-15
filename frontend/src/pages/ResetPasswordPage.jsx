import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useToast } from "../context/ToastContext.jsx";
import { resetPassword } from "../services/authService.js";

function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await resetPassword(token, password);
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not reset password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="w-full max-w-sm bg-white dark:bg-gray-900 p-8 rounded-lg shadow-md border border-transparent dark:border-gray-800">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
          Set a new password
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              New Password
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
            className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
          <Link
            to="/login"
            className="text-blue-600 dark:text-blue-400 font-medium"
          >
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
