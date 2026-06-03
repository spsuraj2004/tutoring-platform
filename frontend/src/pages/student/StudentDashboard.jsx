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

  const remoteVideoRef =
    useRef(null);

  const peerConnection =
    useRef(null);

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

    // Tutor sends offer
    socket.on(
      "offer",
      async ({ offer }) => {
        console.log(
          "OFFER RECEIVED"
        );
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
              peerConnection.current.oniceconnectionstatechange =
              () => {
                console.log(
                  "ICE State:",
                  peerConnection.current.iceConnectionState
                
                );
              }
            );
          };

        await peerConnection.current.setRemoteDescription(
          offer
        );
        

        peerConnection.current.ontrack =
          (event) => {
            console.log(
              "TRACK RECEIVED",
              event.streams
            );
            if (
              remoteVideoRef.current
            ) {
              remoteVideoRef.current.srcObject =
                event.streams[0];
                console.log(
                  "VIDEO ATTACHED"
                );
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
          peerConnection.current.addTransceiver(
            "video",
            {
                 direction: "recvonly",
            }
          );
          peerConnection.current.addTransceiver(
            "audio",
            {
              direction: "recvonly",
            }
          );
          
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

        alert(
          "Tutor has ended the session."
        );
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
        const stream =
          await navigator.mediaDevices.getUserMedia(
            {
              video: true,
              audio: true,
            }
          );

        console.log(
          "Student media stream started",
          stream
        );
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
          Student Dashboard
        </h1>

        <div className="flex gap-4">

          <div className="bg-zinc-900 px-4 py-2 rounded-xl">
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

      <div className="bg-zinc-900 p-6 rounded-2xl mb-8">

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

        <div className="bg-zinc-900 p-6 rounded-2xl">

          <h2 className="text-2xl mb-4">
            Live Session
          </h2>

          <video
            ref={
              remoteVideoRef
            }
            autoPlay
            playsInline
            className="w-full h-96 bg-zinc-800 rounded-xl"
          />

          <button
            onClick={
              startSession
            }
            className="w-full mt-6 bg-blue-600 p-3 rounded-xl"
          >
            Join Session
          </button>

        </div>

        <div className="bg-zinc-900 p-6 rounded-2xl flex flex-col">

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
              type="text"
              placeholder="Ask your doubt..."
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

export default StudentDashboard;