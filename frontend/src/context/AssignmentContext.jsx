import {
  createContext,
  useEffect,
  useState,
} from "react";
import axios from "axios";

export const AssignmentContext =
  createContext();

const API_URL = "https://tutoring-platform-2ach.onrender.com";

function AssignmentProvider({
  children,
}) {

  // Current Logged User
  const [currentUser, setCurrentUser] =
    useState(
      JSON.parse(
        sessionStorage.getItem("user")
      ) || null
    );
console.log(
  "Context User:",
  currentUser
);
  // Tutors
  const tutors = [
    "Maths Tutor",
    "Science Tutor",
    "English Tutor",
  ];

  // Students
  const students = [
    "Student 1",
    "Student 2",
    "Student 3",
  ];

  // Assignments
  const [assignments, setAssignments] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  // Fetch assignments from backend database
  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/sessions`
      );
      // Map backend format to frontend format
      const mapped = response.data.map(
        (session) => ({
          _id: session._id,
          tutor: session.tutorId,
          student: session.studentId,
        })
      );
      setAssignments(mapped);
    } catch (error) {
      console.error(
        "Error fetching assignments:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch assignments on mount
  useEffect(() => {
    fetchAssignments();
  }, []);

  // Save current user automatically
  useEffect(() => {

    if (currentUser) {

      sessionStorage.setItem(
        "user",
        JSON.stringify(
          currentUser
        )
      );

    } else {

      sessionStorage.removeItem(
        "user"
      );
    }

  }, [currentUser]);

  return (
    <AssignmentContext.Provider
      value={{
        tutors,
        students,
        assignments,
        setAssignments,
        loading,
        fetchAssignments,
        currentUser,
        setCurrentUser,
      }}
    >
      {children}
    </AssignmentContext.Provider>
  );
}

export default AssignmentProvider;