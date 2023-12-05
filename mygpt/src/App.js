import './App.css';
import { useState, useEffect } from 'react';

function App() {

  const [input, setInput] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [currentTitle, setCurrentTitle] = useState("");
  const [shouldFetchData, setShouldFetchData] = useState(false);

  const currentChatLog = chatLog.filter(message => message.title===currentTitle);
  const uniqueTitles = Array.from(new Set(chatLog.map(message => message.title)));

  const createNewChat = () => {
    console.log("Setting current title in createNewChat.");
    setInput("");
    setCurrentTitle("");
  };

  const handleClick = (uniqueTitle) => {
    console.log("Setting current title in handleClick.");
    setInput("");
    setCurrentTitle(uniqueTitle);
  };

  useEffect(() => {
    const createDatabase = async() => {
      const response = await fetch("http://localhost:3080/create_db", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({"title": currentTitle, "messages": currentChatLog})
      });
      const data = await response.json();
      let row_data = data.row_data;
      row_data.forEach(row => {
        if (row.hasOwnProperty("id")) {
            delete row["id"];
        }
      });
      console.log("Row data is: " + JSON.stringify(row_data));
      setChatLog(row_data);
    }
    createDatabase();
  }, []);

  useEffect(() => {
    const fetchData = async() => {
      try {
        console.log('Chat log is: ', chatLog);

        const response = await fetch("http://localhost:3080/add_message", {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({"title": currentTitle, "messages": currentChatLog})
            });
        const data = await response.json();
        console.log("New chat log: ", [...chatLog, {"title": currentTitle, "role": data.message.role, "content": data.message.content}]);
        setChatLog([...chatLog, {"title": currentTitle, "role": data.message.role, "content": data.message.content}]);
      } catch (error) {
        console.log("Error: ", error.message);
      } finally {
        // Reset the flag after fetch operation
        setShouldFetchData(false);
        console.log('Chat log is: ', chatLog);
        console.log(chatLog.map(message => message["content"]));
      }
    }
    if (shouldFetchData) {
      fetchData();
    }
  }, [chatLog, currentTitle, shouldFetchData]);

  async function handleSubmit(e) {
    e.preventDefault();
    let title = currentTitle;
    if (!currentTitle) {
      await setCurrentTitle(input);
      title = input;
    }
    setChatLog([...chatLog, {"title": title, "role": "user", "content": input}]);
    setInput("");
    setShouldFetchData(true);
  }

  return (
    <div className="App">
      <aside className="sidemenu">
        <button onClick={createNewChat} className="sidemenu-button">
          <span>+</span>
          New chat
        </button>
        <ul className="chat-history">
          {uniqueTitles?.map((uniqueTitle, index) => <li key={index} onClick={() => handleClick(uniqueTitle)}>
            {uniqueTitle}
          </li>)}
        </ul>
      </aside>
      <section className="chatbox">
        <h1>MyGPT</h1>
        <div className="chat-log">
          { currentChatLog.map((message, index) => {
            return <ChatMessage key={index} message={message}/>;
          }) }
        </div>
        <div className="chat-input-holder">
          <form onSubmit={handleSubmit}>
            <input rows="1" value={input} onChange={(e) => setInput(e.target.value)} className="chat-input-textarea" placeholder="Message ChatGPT..."/>
          </form>
        </div>
      </section>
    </div>
  );
}

const ChatMessage = ({ message }) => {
  return(
    <div className={`chat-message ${(message["role"]==="assistant" && "chatgpt") || ""}`}>
      <div className="chat-message-center">
        <div className="message">
          <p className="role">{ message["role"] }</p>
          <p>{ message["content"] }</p>
        </div>
      </div>
    </div>
  );
}

export default App;
