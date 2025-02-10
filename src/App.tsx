import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";


function App() {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const [messages, setMessages] = useState<{ username: string; message: string }[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const socket = new WebSocket("https://chat-sphere-aqhk.onrender.com");
    setWs(socket);
    
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "roomCreated") {
        setRoomId(data.payload.roomCode);
      } else if (data.type === "joined") {
        setIsConnected(true);
      } else if (data.type === "chat") {
        setMessages((prev) => [...prev, { username: data.payload.username, message: data.payload.message }]);
      }
    };
    
    return () => socket.close();
  }, []);

  const createRoom = () => {
    if (ws) {
      ws.send(JSON.stringify({ type: "create" }));
    }
  };

  const joinRoom = () => {
    if (ws && roomId && username) {
      ws.send(JSON.stringify({ type: "join", payload: { roomId, username } }));
    }
  };

  const sendMessage = () => {
    if (ws && inputMessage) {
      ws.send(JSON.stringify({ type: "chat", payload: { message: inputMessage } }));
      setInputMessage("");
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-blue-900 to-purple-900 text-white p-6">
      <motion.h1 initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-bold mb-4">
        Chatter Sphere
      </motion.h1>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 flex gap-2">
        <button onClick={createRoom} className="bg-blue-500 hover:bg-blue-700 transition px-4 py-2 rounded-lg shadow-lg">Create Room</button>
        <input
          type="text"
          placeholder="Enter Room ID"
          className="text-black px-4 py-2 rounded-lg shadow-lg"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />
        <input
          type="text"
          placeholder="Enter Username"
          className="text-black px-4 py-2 rounded-lg shadow-lg"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button onClick={joinRoom} className="bg-green-500 hover:bg-green-700 transition px-4 py-2 rounded-lg shadow-lg">Join Room</button>
      </motion.div>
      {isConnected && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 w-full max-w-md bg-gray-800 p-4 rounded-lg shadow-xl">
          <div className="h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 p-2">
            {messages.map((msg, index) => (
              <motion.div key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="p-2 bg-gray-700 rounded-lg mb-2 shadow-md">
                <strong className="text-yellow-400">{msg.username}:</strong> {msg.message}
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="mt-2 flex">
            <input
              type="text"
              className="flex-1 text-black px-4 py-2 rounded-lg shadow-lg"
              placeholder="Type a message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
            />
            <button onClick={sendMessage} className="bg-purple-500 hover:bg-purple-700 transition px-4 py-2 rounded-lg shadow-lg ml-2">Send</button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
export default App

