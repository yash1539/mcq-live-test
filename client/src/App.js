import "./App.css";
import io from "socket.io-client";
import { useEffect, useState } from "react";

const socket = io.connect("http://localhost:3001");

function App() {
  //Room State
  const [room, setRoom] = useState("");
  const [role, setRole] = useState("stdent")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [selectedOption, setSelectedOption] = useState('');
  const [pollReceived, setPollReceived] = useState('');

  const [name, setName] = useState('');
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState({
    option1: '',
    option2: '',
    option3: '',
    option4: ''
  });


  const [isName, setIsname] = useState(false)

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
  const handleRadioChange = (optionKey) => {
    setSelectedOption(optionKey);
  };


  const handleAddOption = () => {
    const optionCount = Object.keys(options).length;
    if (optionCount < 6) { // Adjust as needed
      const newOptionName = `option${optionCount + 1}`;
      setOptions({ ...options, [newOptionName]: '' });
    }
  };
  const handleSelectOption = (slectedOption, messageReceived) => {
    setIsSubmitted(true)
    setSelectedOption(slectedOption);
    socket.emit("select_option", { slectedOption, messageReceived });
  };
  const handleAskQuestion = (question, options) => {
    socket.emit("send_question", { question, options });
    console.log("type");
  }

  const [message, setMessage] = useState("");
  const [messageReceived, setMessageReceived] = useState("");

  const joinRoom = () => {
    if (room !== "") {
      socket.emit("join_room", room);
    }
  };
  const handleContinue = () => {
    localStorage.setItem('userName', name);
    setIsname(true)
  }
  const [data, setData] = useState(null);

  useEffect(() => {
    socket.on("receive_message", (data) => {

      setMessageReceived(data);
      console.log("emit receive", data);
    });
  });

  useEffect(() => {
    socket.on("selected_options_percentage_updated", (data) => {

      setPollReceived(data);
    });
  }, []);

  useEffect(() => {
    console.log("messageReceived", messageReceived);
  }, [messageReceived])
  // useEffect(() => {
  //   localStorage.getItem('userName') && setIsname(true)
  // }, [])

  return (
    <div className="App">
      {!isName && (role === "student" ? <div style={{ display: "flex", flexDirection: "column", gap: "50px" }}>
        <input
          style={{ width: "200px" }}
          type="text"
          id="nameInput"
          placeholder="Enter you name...."
          value={name}
          onChange={handleNameChange}
        />
        <button onClick={handleContinue} >Continue</button>

      </div> : role === "teacher" ? <div>

        <textarea
          style={{ width: "200px" }}
          type="text"
          id="nameInput"
          placeholder="Enter question"
          value={question}
          onChange={handleQuestionChange}
        />
        <div style={{ display: "flex", flexDirection: "column" }}>
          {Object.keys(options).map((optionName, index) => (
            <input
              key={index}
              type="text"
              placeholder={`Option ${index + 1}`}
              value={options[optionName]}
              onChange={(e) => handleOptionChange(e, optionName)}
            />
          ))}
          <div style={{ display: "flex", flexDirection: "row" }}>
            <button onClick={handleAddOption}>Add Another Option</button>
            <button onClick={() => handleAskQuestion(question, options)}>Ask Question</button>
          </div>
          {messageReceived && (
            <div>
              <div>{messageReceived.question}</div>
              {messageReceived.options &&
                Object.keys(messageReceived.options).map((optionKey) => (
                  <div key={optionKey}>
                    {messageReceived.options[optionKey]}: {pollReceived[optionKey] ?? "0%"}
                  </div>
                ))}
            </div>
          )}
        </div>

      </div> : <div>
        <h1>
          Select what type of user you are?
        </h1>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "50px" }}>
          <div className="box-button" onClick={() => { setRole("teacher") }}>I am a teacher</div>
          <div className="box-button" onClick={() => { setRole("student") }}>I am a student</div>
        </div>
      </div>)}
      {isName &&
        (
          (!isSubmitted ? <div>
            {!messageReceived && <div>
              HEY {localStorage.getItem('userName')
              } WE ARE WAITING FOR YOUR QUESTION.

            </div>}
            <div>
              {messageReceived?.question}
              {console.log(messageReceived?.options)}
            </div>
            <div>
              {messageReceived?.options && Object.keys(messageReceived?.options).map((optionKey) => (
                <div key={optionKey}>
                  <input
                    type="radio"
                    id={optionKey}
                    name="options"
                    value={optionKey}
                    checked={selectedOption === optionKey}
                    onChange={() => handleRadioChange(optionKey)}
                  />
                  <label htmlFor={optionKey}>{messageReceived?.options[optionKey]}</label>
                </div>
              ))}
              <button onClick={() => { handleSelectOption(selectedOption, messageReceived) }}>Submit Answer</button>
            </div>
          </div> : <div>
            <div>
              <div>Poll Received</div>
            </div>
            {messageReceived && (
              <div>
                <div>{messageReceived.question}</div>
                {messageReceived.options &&
                  Object.keys(messageReceived.options).map((optionKey) => (
                    <div key={optionKey}>
                      {messageReceived.options[optionKey]}: {pollReceived[optionKey] ?? "0%"}
                    </div>
                  ))}
              </div>
            )}

            {console.log("poill", pollReceived)}
          </div>)

        )}
    </div>
  );
}

export default App;
