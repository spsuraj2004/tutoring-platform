import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { AssignmentContext } from "../../context/AssignmentContext";

function AdminDashboard() {

  const navigate = useNavigate();

  const {
    tutors,
    students,
    assignments,
    setAssignments,
    fetchAssignments,
    setCurrentUser,
  } = useContext(AssignmentContext);

  const [selectedTutor, setSelectedTutor] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");

  // Logout
  const handleLogout = () => {

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    setCurrentUser(null);

    navigate("/");
  };

  // Assign Tutor + Student
  const handleAssign = async () => {

    if (!selectedTutor || !selectedStudent) {
      alert("Select tutor and student");
      return;
    }

    try {
      // Find old assignments involving this tutor or student
      const oldAssignments = assignments.filter(
        (a) => a.tutor === selectedTutor || a.student === selectedStudent
      );

      // Delete old assignments from backend
      for (const old of oldAssignments) {
        if (old._id) {
          await axios.delete(`https://tutoring-platform-2ach.onrender.com/sessions/${old._id}`);
        }
      }

      // New assignment
      await axios.post("https://tutoring-platform-2ach.onrender.com/sessions", {
        tutorId: selectedTutor,
        studentId: selectedStudent,
        subject: "General"
      });

      // Fetch updated assignments
      await fetchAssignments();

      // Reset selection
      setSelectedTutor("");
      setSelectedStudent("");

      alert("Session Assigned Successfully");
    } catch (error) {
      console.error("Error assigning session:", error);
      alert("Failed to assign session");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-red-950 text-white p-8">

      {/* Header */}
      <div className="flex justify-between items-center mb-10">

        <h1 className="text-4xl font-bold text-red-500">
          Admin Dashboard
        </h1>

        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-xl"
        >
          Logout
        </button>

      </div>

      {/* Assignment Panel */}
      <div className="bg-zinc-900 border border-red-700 shadow-lg shadow-red-900/30 p-6 rounded-2xl mb-10">

        <h2 className="text-2xl mb-6">
          Assign Sessions
        </h2>

        <div className="grid grid-cols-3 gap-4">

          {/* Tutor Select */}
          <select
            value={selectedTutor}
            onChange={(e) =>
              setSelectedTutor(e.target.value)
            }
            className="p-3 rounded-xl bg-zinc-800 outline-none"
          >
            <option value="">
              Select Tutor
            </option>

            {tutors.map((tutor, index) => (
              <option
                key={index}
                value={tutor}
              >
                {tutor}
              </option>
            ))}
          </select>

          {/* Student Select */}
          <select
            value={selectedStudent}
            onChange={(e) =>
              setSelectedStudent(e.target.value)
            }
            className="p-3 rounded-xl bg-zinc-800 outline-none"
          >
            <option value="">
              Select Student
            </option>

            {students.map((student, index) => (
              <option
                key={index}
                value={student}
              >
                {student}
              </option>
            ))}
          </select>

          {/* Assign Button */}
          <button
            onClick={handleAssign}
            className="bg-blue-600 hover:bg-blue-700 rounded-xl p-3 font-semibold"
          >
            Assign Session
          </button>

        </div>

      </div>

      {/* Current Assignments */}
      <div className="bg-zinc-900 border border-red-700 shadow-lg shadow-red-900/30 p-6 rounded-2xl">

        <h2 className="text-2xl mb-6">
          Current Assignments
        </h2>

        {assignments.length === 0 ? (

          <div className="bg-zinc-800 p-4 rounded-xl text-zinc-400">
            No Sessions Assigned
          </div>

        ) : (

          <div className="space-y-4">

            {assignments.map((assignment, index) => (

              <div
                key={index}
                className="bg-zinc-800 p-4 rounded-xl flex justify-between items-center"
              >

                <span className="font-semibold">
                  {assignment.tutor}
                </span>

                <span className="text-zinc-400">
                  teaches
                </span>

                <span className="font-semibold">
                  {assignment.student}
                </span>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
}

export default AdminDashboard;