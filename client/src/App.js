import "./App.css";
import io from "socket.io-client";
import { useEffect, useState } from "react";

const socket = io.connect("http://localhost:3001");

function App() {
  //Room State
  const [room, setRoom] = useState("");
  const [role, setRole] = useState("stdent")
  const [name, setName] = useState('');
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState({
    option1: '',
    option2: '',
    option3: '',
    option4: ''
  });


  const [isName,setIsname] = useState(false)

  const handleNameChange = (event) => {
    setName(event.target.value);
  };
  const handleQuestionChange = (event) => {
    setQuestion(event.target.value);
  };
  const handleOptionChange = (e, optionName) => {
    const updatedOptions = { ...options, [optionName]: e.target.value };
    setOptions(updatedOptions);
  };

  const handleAddOption = () => {
    const optionCount = Object.keys(options).length;
    if (optionCount < 6) { // Adjust as needed
      const newOptionName = `option${optionCount + 1}`;
      setOptions({ ...options, [newOptionName]: '' });
    }
  };
  // const sendQuestion = () => {
  //   socket.emit("send_question", { question, options });
  // };

  const handleAskQuestion = (question, options) => {   
     socket.emit("send_question", { question, options });
     console.log("type");
}
    
  // Messages States
  const [message, setMessage] = useState("");
  const [messageReceived, setMessageReceived] = useState("");

  const joinRoom = () => {
    if (room !== "") {
      socket.emit("join_room", room);
    }
  };
  const handleContinue =()=>{
    localStorage.setItem('userName', name);
    setIsname(true)
  }
  const [data, setData] = useState(null);

  // useEffect(() => {
  //   // Establish connection to the socket server
  //   const socket = io('http://localhost:3001'); // Replace with your socket server URL

  //   // Listen for 'data' event from the server
  //   socket.on('receive_message', (data) => {
  //     console.log('Received message from client:', data);
  //   });
  // })
  

  useEffect(() => {
    socket.on("receive_message", (data) => {

      setMessageReceived(data);
      console.log("emit receive",data);
    });
  });
  useEffect(()=>{
    console.log("messageReceived",messageReceived);
  },[messageReceived])
  useEffect(()=>{
    localStorage.getItem('userName') && setIsname(true)
  },[])
  
  return (
    <div className="App">
      {/* <input
        placeholder="Room Number..."
        onChange={(event) => {
          setRoom(event.target.value);
        }}
      />
      <button onClick={
        +
      }> Join Room</button>
      <input
        placeholder="Message..."
        onChange={(event) => {
          setMessage(event.target.value);
        }}
      />
      <button onClick={sendQuestion}> Send question</button>
      <h1> questions:</h1>
      {messageReceived} */}
      { !isName && (role==="student" ?<div style={{display:"flex",flexDirection:"column",gap:"50px"}}>
      <input
      style={{width:"200px"}}
        type="text"
        id="nameInput"
        placeholder="Enter you name...."
        value={name}
        onChange={handleNameChange}
      />
      <button onClick={handleContinue} >Continue</button>
        
      </div>:role==="teacher"?<div>

      <textarea
      style={{width:"200px"}}
        type="text"
        id="nameInput"
        placeholder="Enter question"
        value={question}
        onChange={handleQuestionChange}
      />
      <div style={{display:"flex",flexDirection:"column"}}>
      {Object.keys(options).map((optionName, index) => (
        <input
          key={index}
          type="text"
          placeholder={`Option ${index + 1}`}
          value={options[optionName]}
          onChange={(e) => handleOptionChange(e, optionName)}
        />
      ))}
      <div style={{display:"flex",flexDirection:"row"}}>
      <button onClick={handleAddOption}>Add Another Option</button>
      <button onClick={() => handleAskQuestion(question, options)}>Ask Question</button>
      </div>
    </div>

      </div>:<div>
      <h1>
        Select what type of user you are?
      </h1>
      <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:"50px"}}>
        <div className="box-button" onClick={()=>{setRole("teacher")}}>I am a teacher</div>
        <div className="box-button"  onClick={()=>{setRole("student")}}>I am a student</div>
      </div>
    </div>)}
    {isName && (
      <div>
        HEY {    localStorage.getItem('userName')
} WE ARE WAITING FOR YOUR QUESTION.

      </div>

    )}
    </div>
  );
}

export default App;
