import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../services/authService.js";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = await forgotPassword(email);
      setMessage(data.message);
    } catch (err) {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="w-full max-w-sm bg-white dark:bg-gray-900 p-8 rounded-lg shadow-md border border-transparent dark:border-gray-800">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
          Reset your password
        </h1>

        {message ? (
          <div className="p-3 rounded bg-blue-50 text-blue-700 text-sm dark:bg-blue-950 dark:text-blue-300">
            {message}
          </div>
        ) : (
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
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}

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

export default ForgotPasswordPage;
