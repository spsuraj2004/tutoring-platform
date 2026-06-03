import { useContext, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { AssignmentContext } from "../../context/AssignmentContext";
import socket from "../../socket";

function TutorDashboard() {
  const navigate = useNavigate();

  const {
    assignments,
    currentUser,
    setCurrentUser,
  } = useContext(AssignmentContext);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const localVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const localStreamRef = useRef(null);

  const currentTutor = currentUser?.name;

  console.log(
    "Dashboard User:",
    currentUser
  );

  const assignedSession = assignments.find(
    (assignment) =>
      assignment.tutor === currentTutor
  );

  const roomId = assignedSession
    ? `${assignedSession.tutor}-${assignedSession.student}`
    : null;

  useEffect(() => {
    if (!roomId) return;

    socket.emit("joinRoom", roomId);

    socket.on("receiveMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on(
      "answer",
      async ({ answer }) => {
        console.log(
          "ANSWER RECEIVED"
        );
        if (peerConnection.current

        ) {
          await peerConnection.current.setRemoteDescription(
            new RTCSessionDescription(answer)
          );
        }
      }
    );

    socket.on(
      "ice-candidate",
      async ({ candidate }) => {
        console.log(
          "ICE RECEIVED"
        );
        try {
          if (
            peerConnection.current &&
            candidate
          ) {
            await peerConnection.current.addIceCandidate(
              new RTCIceCandidate(candidate)
            );
          }
        } catch (error) {
          console.error(error);
        }
      }
    );

    return () => {
      socket.off("receiveMessage");
      socket.off("answer");
      socket.off("ice-candidate");
    };
  }, [roomId]);

  const startSession = async () => {
    try {
      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

      localStreamRef.current = stream;

      localVideoRef.current.srcObject =
        stream;

      peerConnection.current =
        new RTCPeerConnection({
          iceServers: [
            {
              urls:
                "stun:stun.l.google.com:19302",
            },
          ],
        });

      stream
        .getTracks()
        .forEach((track) => {
          peerConnection.current.addTrack(
            track,
            stream
            
          );
        });
        console.log(
          "Tracks Added:",
          stream.getTracks()

        );

      peerConnection.current.onicecandidate =
        (event) => {
          if (event.candidate

          ) {
            console.log(
              "TUTOR ICE GENERATED"
            );
            socket.emit(
              "ice-candidate",
              {
                roomId,
                candidate:
                  event.candidate,
              }
            );
          }
        };

      const offer =
        await peerConnection.current.createOffer();

      await peerConnection.current.setLocalDescription(
        offer
      );

      socket.emit(
        "offer",
        {
          roomId,
          offer,
        }
      );

      console.log("Offer Sent");
    } catch (error) {
      console.error(error);
    }
  };

  const endSession = () => {
    if (localStreamRef.current) {
      localStreamRef.current
        .getTracks()
        .forEach((track) =>
          track.stop()
        );
    }

    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject =
        null;
    }

    console.log("Session Ended");
  };

  const sendMessage = () => {
    if (
      !message.trim() ||
      !roomId
    )
      return;

    const chatData = {
      roomId,
      sender: currentTutor,
      role: "Tutor",
      text: message,
      timestamp:
        new Date().toLocaleTimeString(),
    };

    socket.emit(
      "sendMessage",
      chatData
    );

    setMessage("");
  };

  const handleLogout = () => {
    sessionStorage.removeItem(
      "token"
    );

    sessionStorage.removeItem(
      "user"
    );

    setCurrentUser(null);

    navigate("/");
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">

      <div className="flex justify-between items-center mb-10">

        <h1 className="text-4xl font-bold">
          Tutor Dashboard
        </h1>

        <div className="flex gap-4">

          <div className="bg-zinc-900 px-4 py-2 rounded-xl">
            {currentTutor}
          </div>

          <button
            onClick={
              handleLogout
            }
            className="bg-red-600 px-5 py-2 rounded-xl"
          >
            Logout
          </button>

        </div>

      </div>

      <div className="bg-zinc-900 p-6 rounded-2xl mb-8">

        <h2 className="text-2xl mb-4">
          Assigned Student
        </h2>

        <div className="bg-zinc-800 p-4 rounded-xl">

          {assignedSession
            ? assignedSession.student
            : "No Student Assigned"}

        </div>

      </div>

      <div className="grid grid-cols-2 gap-8">

        <div className="bg-zinc-900 p-6 rounded-2xl">

          <h2 className="text-2xl mb-4">
            Live Video
          </h2>

          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-96 bg-zinc-800 rounded-xl"
          />

          <div className="flex gap-3 mt-6">

            <button
              onClick={
                startSession
              }
              className="flex-1 bg-green-600 p-3 rounded-xl"
            >
              Start Session
            </button>

            <button
              onClick={
                endSession
              }
              className="flex-1 bg-red-600 p-3 rounded-xl"
            >
              End Session
            </button>

          </div>

        </div>

        <div className="bg-zinc-900 p-6 rounded-2xl flex flex-col">

          <h2 className="text-2xl mb-4">
            Private Chat
          </h2>

          <div className="flex-1 bg-zinc-800 rounded-xl p-4 overflow-y-auto">

            {messages.length === 0 ? (
              <p className="text-zinc-500">
                No messages yet...
              </p>
            ) : (
              messages.map(
                (
                  msg,
                  index
                ) => (
                  <div
                    key={index}
                    className="mb-3"
                  >
                    <div className="font-semibold text-blue-400">
                      {msg.sender}
                    </div>

                    <div>
                      {msg.text}
                    </div>

                    <div className="text-xs text-zinc-500">
                      {msg.timestamp}
                    </div>
                  </div>
                )
              )
            )}

          </div>

          <div className="flex mt-4 gap-2">

            <input
              value={message}
              onChange={(e) =>
                setMessage(
                  e.target.value
                )
              }
              type="text"
              placeholder="Type message..."
              className="flex-1 p-3 rounded-xl bg-zinc-800"
            />

            <button
              onClick={
                sendMessage
              }
              className="bg-blue-600 px-6 rounded-xl"
            >
              Send
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default TutorDashboard;