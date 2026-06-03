import {
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  AssignmentContext,
} from "../../context/AssignmentContext";

import socket from "../../socket";

function StudentDashboard() {
  const navigate = useNavigate();

  const {
    assignments,
    currentUser,
    setCurrentUser,
  } = useContext(
    AssignmentContext
  );

  const [message, setMessage] =
    useState("");

  const [messages, setMessages] =
    useState([]);

  const [sessionStatus, setSessionStatus] =
    useState("idle"); // "idle" | "joined" | "ended"

  const remoteVideoRef =
    useRef(null);

  const peerConnection =
    useRef(null);

  const pendingOffer =
    useRef(null);

  const pendingIceCandidates =
    useRef([]);

  const currentStudent =
    currentUser?.name;

  const assignedSession =
    assignments.find(
      (assignment) =>
        assignment.student ===
        currentStudent
    );

  const roomId =
    assignedSession
      ? `${assignedSession.tutor}-${assignedSession.student}`
      : null;

  const connectToTutor = async (offer) => {
    peerConnection.current =
      new RTCPeerConnection({
        iceServers: [
          {
            urls:
              "stun:stun.l.google.com:19302",
          },
        ],
      });

    peerConnection.current.onconnectionstatechange =
      () => {
        console.log(
          "Connection State:",
          peerConnection.current.connectionState
        );
      };

    peerConnection.current.oniceconnectionstatechange =
      () => {
        console.log(
          "ICE State:",
          peerConnection.current.iceConnectionState
        );
      };

    // Set up ontrack BEFORE setRemoteDescription so we don't miss the event
    peerConnection.current.ontrack = (event) => {
      console.log(
        "REMOTE TRACK RECEIVED",
        event
      );

      console.log(
        "STREAMS:",
        event.streams
      );

      if (
        remoteVideoRef.current &&
        event.streams[0]
      ) {
        remoteVideoRef.current.srcObject =
          event.streams[0];

        remoteVideoRef.current.play().catch(() => {});
      }
    };

    peerConnection.current.onicecandidate =
      (event) => {
        if (
          event.candidate
        ) {
          console.log(
            "STUDENT ICE GENERATED"
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

    await peerConnection.current.setRemoteDescription(
      new RTCSessionDescription(offer)
    );

    // Add any ICE candidates that arrived before we joined
    for (const candidate of pendingIceCandidates.current) {
      try {
        await peerConnection.current.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      } catch (err) {
        console.error(err);
      }
    }
    pendingIceCandidates.current = [];

    const answer =
      await peerConnection.current.createAnswer();

    await peerConnection.current.setLocalDescription(
      answer
    );

    socket.emit(
      "answer",
      {
        roomId,
        answer,
      }
    );

    console.log(
      "Answer Sent"
    );
  };

  useEffect(() => {
    if (!roomId) return;

    socket.emit(
      "joinRoom",
      roomId
    );

    socket.on(
      "receiveMessage",
      (data) => {
        setMessages(
          (prev) => [
            ...prev,
            data,
          ]
        );
      }
    );

    // Tutor sends offer — store it, don't auto-connect
    socket.on(
      "offer",
      ({ offer }) => {
        console.log(
          "OFFER RECEIVED (stored, waiting for Join)"
        );
        pendingOffer.current = offer;
      }
    );

    // Receive ICE candidates
    socket.on(
      "ice-candidate",
      
      async ({
        candidate,
      }) => {
        console.log(
          "ICE RECEIVED"
        );

        if (
          peerConnection.current &&
          candidate
        ) {
          try {
            await peerConnection.current.addIceCandidate(
              new RTCIceCandidate(
                candidate
              )
            );
          } catch (err) {
            console.error(
              err
            );
          }
        } else if (candidate) {
          // Store ICE candidates until student joins
          pendingIceCandidates.current.push(candidate);
        }
      }
    );

    // Tutor ended session
    socket.on(
      "session-ended",
      () => {
        if (
          remoteVideoRef.current
        ) {
          remoteVideoRef.current.srcObject =
            null;
        }

        if (
          peerConnection.current
        ) {
          peerConnection.current.close();
          peerConnection.current =
            null;
        }

        pendingOffer.current = null;
        pendingIceCandidates.current = [];
        setSessionStatus("ended");
      }
    );

    return () => {
      socket.off(
        "receiveMessage"
      );

      socket.off(
        "offer"
      );

      socket.off(
        "ice-candidate"
      );

      socket.off(
        "session-ended"
      );
    };
  }, [roomId]);

  const startSession =
    async () => {
      try {
        if (!pendingOffer.current) {
          alert("Tutor has not started the session yet.");
          return;
        }

        setSessionStatus("joined");
        await connectToTutor(pendingOffer.current);
        pendingOffer.current = null;

        console.log(
          "Room:",
          roomId
        );
      } catch (error) {
        console.error(
          error
        );
      }
    };

  const sendMessage = () => {
    if (
      !message.trim() ||
      !roomId
    )
      return;

    const chatData = {
      roomId,
      sender:
        currentStudent,
      role: "Student",
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

  const handleChatKeyDown = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
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
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-red-950 text-white p-8">

      <div className="flex justify-between items-center mb-10">

        <h1 className="text-4xl font-bold text-red-500">
          Student Dashboard
        </h1>

        <div className="flex gap-4">

          <div className="bg-zinc-900 border border-red-700 shadow-lg shadow-red-900/30 px-4 py-2 rounded-xl">
            {currentStudent}
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

      <div className="bg-zinc-900 border border-red-700 shadow-lg shadow-red-900/30 p-6 rounded-2xl mb-8">

        <h2 className="text-2xl mb-4">
          Assigned Tutor
        </h2>

        <div className="bg-zinc-800 p-4 rounded-xl">

          {assignedSession
            ? assignedSession.tutor
            : "No Tutor Assigned"}

        </div>

      </div>

      <div className="grid grid-cols-2 gap-8">

        <div className="bg-zinc-900 border border-red-700 shadow-lg shadow-red-900/30 p-6 rounded-2xl">

          <h2 className="text-2xl mb-4">
            Live Session
          </h2>

          {sessionStatus === "ended" ? (
            <div className="w-full h-96 bg-zinc-800 rounded-xl flex items-center justify-center">
              <p className="text-2xl font-semibold text-red-400">
                Session Ended
              </p>
            </div>
          ) : (
            <video
              ref={
                remoteVideoRef
              }
              autoPlay
              playsInline
              className="w-full h-96 bg-zinc-800 rounded-xl"
            />
          )}

          <button
            onClick={
              startSession
            }
            disabled={sessionStatus === "joined" || sessionStatus === "ended"}
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 transition-all duration-300 p-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sessionStatus === "joined"
              ? "Joined"
              : sessionStatus === "ended"
              ? "Session Ended"
              : "Join Session"}
          </button>

        </div>

        <div className="bg-zinc-900 border border-red-700 shadow-lg shadow-red-900/30 p-6 rounded-2xl flex flex-col">

          <h2 className="text-2xl mb-4">
            Private Chat
          </h2>

          <div className="flex-1 bg-zinc-800 rounded-xl p-4 overflow-y-auto">

            {messages.length ===
            0 ? (
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
                    key={
                      index
                    }
                    className="mb-3"
                  >
                    <div className="font-semibold text-green-400">
                      {
                        msg.sender
                      }
                    </div>

                    <div>
                      {
                        msg.text
                      }
                    </div>

                    <div className="text-xs text-zinc-500">
                      {
                        msg.timestamp
                      }
                    </div>
                  </div>
                )
              )
            )}

          </div>

          <div className="flex mt-4 gap-2">

            <input
              value={
                message
              }
              onChange={(
                e
              ) =>
                setMessage(
                  e.target.value
                )
              }
              onKeyDown={
                handleChatKeyDown
              }
              type="text"
              placeholder="Ask your doubt..."
              className="flex-1 p-3 rounded-xl bg-zinc-800"
            />

            <button
              onClick={
                sendMessage
              }
              className="bg-blue-600 hover:bg-blue-700 transition-all duration-300 px-6 rounded-xl font-semibold"
            >
              Send
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default StudentDashboard;