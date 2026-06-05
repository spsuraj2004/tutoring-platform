import {
  createContext,
  useEffect,
  useState,
} from "react";

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
  const [assignments, setAssignments] =
    useState(() => {

      const savedAssignments =
        localStorage.getItem(
          "assignments"
        );

      return savedAssignments
        ? JSON.parse(
            savedAssignments
          )
        : [];
    });

  // Save assignments automatically
  useEffect(() => {

    localStorage.setItem(
      "assignments",
      JSON.stringify(
        assignments
      )
    );

  }, [assignments]);

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
        currentUser,
        setCurrentUser,
      }}
    >
      {children}
    </AssignmentContext.Provider>
  );
}

export default AssignmentProvider;