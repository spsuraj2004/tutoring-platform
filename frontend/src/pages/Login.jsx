import { useState, useContext,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { AssignmentContext } from "../context/AssignmentContext";

function Login() {
  const navigate = useNavigate();

  const { setCurrentUser } =
    useContext(AssignmentContext);

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);
    
  useEffect(() => {
  },[navigate,setCurrentUser]);
  

  const handleLogin = async () => {

    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    try {

      setLoading(true);

      const response =
        await axios.post(
          "http://localhost:3000/auth/login",
          {
            email,
            password,
          }
        );

      const {
        token,
        user,
      } = response.data;

      // Save JWT
      sessionStorage.setItem(
        "token",
        token
      );

      // Save User
      sessionStorage.setItem(
        "user",
        JSON.stringify(user)
      );

      // Save Context
      setCurrentUser(user);

      // Redirect based on role
      if (user.role === "admin") {

        navigate("/admin");

      } else if (
        user.role === "tutor"
      ) {

        navigate("/tutor");

      } else {

        navigate("/student");
      }

    } catch (error) {

      console.error(error);

      alert(
        "Invalid Email or Password"
      );

    } finally {

      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-black flex items-center justify-center">

      <div className="bg-zinc-900 border border-red-700 shadow-lg shadow-red-900/30 p-10 rounded-2xl w-96 shadow-2xl">

        <h1 className="text-white text-3xl font-bold mb-8 text-center">
          Tution4All
        </h1>

        {/* Email */}
        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          className="w-full p-3 mb-4 rounded-xl bg-zinc-800 text-white outline-none"
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          className="w-full p-3 mb-6 rounded-xl bg-zinc-800 text-white outline-none"
        />

        {/* Login Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 transition-all duration-300 p-3 rounded-xl text-white font-semibold"
        >
          {loading
            ? "Logging In..."
            : "Login"}
        </button>

      </div>

    </div>
  );
}

export default Login;