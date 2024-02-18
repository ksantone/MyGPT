import './App.css';
import { useState, useEffect } from 'react';
import Chatbox from './components/Chatbox'
import Sidebar from './components/Sidebar'

function App() {

  const [input, setInput] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [currentTitle, setCurrentTitle] = useState("");
  const [shouldFetchData, setShouldFetchData] = useState(false);

  const currentChatLog = chatLog.filter(message => message.title===currentTitle);
  const uniqueTitles = Array.from(new Set(chatLog.map(message => message.title)));

  useEffect(() => {
    const scrollToBottom = () => {
      const chatLogElement = document.getElementById('chatLog');
      chatLogElement.scrollTo({
        top: chatLogElement.scrollHeight,
        behavior: 'smooth'
      });
    };
    scrollToBottom();
  }, [chatLog]);

  useEffect(() => {
    const createDatabase = async() => {
      const response = await fetch("http://localhost:3080/create_db", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      });
      const data = await response.json();
      let row_data = data.row_data;
      setChatLog(row_data);
    }
    createDatabase();
  }, []);

  useEffect(() => {
    const fetchData = async() => {
      try {
        const response = await fetch("http://localhost:3080/add_message", {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({"title": currentTitle, "messages": currentChatLog})
            });
        const data = await response.json();
        setChatLog([...chatLog, {"title": currentTitle, "role": data.message.role, "content": data.message.content}]);
      } catch (error) {
        console.log("Error: ", error.message);
      } finally {
        // Reset the flag after fetch operation
        setShouldFetchData(false);
      }
    }

    if (shouldFetchData) {
      fetchData();
    }
  }, [currentTitle, shouldFetchData]);

  return (
    <div className="App">
      <Sidebar setInput={setInput} setCurrentTitle={setCurrentTitle} uniqueTitles={uniqueTitles}/>
      <Chatbox currentTitle={currentTitle} input={input} chatLog={chatLog} setCurrentTitle={setCurrentTitle} setChatLog={setChatLog} setInput={setInput} setShouldFetchData={setShouldFetchData} currentChatLog={currentChatLog} />
    </div>
  );
}

export default App;
