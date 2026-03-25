import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { googleLogin, login } from "../api/authApi";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isGoogleLoginEnabled = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

  const persistToken = (data) => {
    const token = data?.token ?? data?.accessToken;

    if (token) {
      localStorage.setItem("token", token);
    }
  };

  const handleChange = ({ target: { name, value } }) => {
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleLogin = async () => {
    setError("");
    setIsSubmitting(true);

    try {
      const response = await login(formData);
      persistToken(response.data);
      navigate("/home");
    } catch {
      setError("Unable to sign in right now. Please check your details and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogle = async (response) => {
    if (!response.credential) {
      setError("Google sign-in did not return a credential. Please try again.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const apiResponse = await googleLogin(response.credential);
      persistToken(apiResponse.data);
      navigate("/home");
    } catch {
      setError("Google sign-in failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center mt-20">
      <h1 className="text-2xl">Login 🍔</h1>

      {isGoogleLoginEnabled ? (
        <GoogleLogin
          onSuccess={handleGoogle}
          onError={() => setError("Google sign-in failed. Please try again.")}
        />
      ) : (
        <p className="mt-3 text-sm text-gray-600">
          Google sign-in is unavailable until `VITE_GOOGLE_CLIENT_ID` is set.
        </p>
      )}

      <input
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email"
        autoComplete="email"
        className="border mt-3 p-2"
      />
      <input
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Password"
        autoComplete="current-password"
        className="border mt-2 p-2"
      />

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

      <button
        type="button"
        onClick={handleLogin}
        disabled={isSubmitting}
        className="bg-blue-500 text-white px-4 py-2 mt-3 disabled:cursor-not-allowed disabled:opacity-70"
      >
        Login
      </button>
    </div>
  );
};

export default Login;
