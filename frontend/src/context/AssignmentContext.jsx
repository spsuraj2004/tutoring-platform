import {
  createContext,
  useEffect,
  useState,
} from "react";
import axios from "axios";

export const AssignmentContext =
  createContext();

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
  const [assignments, setAssignments] = useState([]);

  // Fetch assignments from backend
  const fetchAssignments = async () => {
    try {
      const response = await axios.get("https://tutoring-platform-2ach.onrender.com/sessions");
      // Map backend data to frontend expected format
      const mappedAssignments = response.data.map(session => ({
        _id: session._id,
        tutor: session.tutorId,
        student: session.studentId
      }));
      setAssignments(mappedAssignments);
    } catch (error) {
      console.error("Error fetching assignments:", error);
    }
  };

  // Fetch on mount
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