import { useState, useRef, useEffect } from "react";
import { X, Send, RotateCw } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import Dropdown from "./shared/DropDown";
import typingIndicator from "../assets/typingIndicator.gif";
import LinkifyText from "../utils/linkifyText";
import welxMascotImg from "../assets/image.png";

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("faq");
  const [showLoader, setShowLoader] = useState(false);
  const [messages, setMessages] = useState([]);
  const [flag, setFlag] = useState(true);
  const [quickQuestions, setQuickQuestions] = useState([]);
  const [showDefaultQuestions, setShowDefaultQuestions] = useState(true)
  const [input, setInput] = useState("");
  const [llmSuggestedQuestions, setLlmSuggestedQuestions] = useState([]);
  const [showLlmSuggestions, setShowLlmSuggestions] = useState(false);
  const isOnSpecialPage = location.pathname === "/";

  const chatBodyRef = useRef(null);

  useEffect(() => {
    if (isOnSpecialPage) {
      setSelectedOption("faq");
    } 
  }, [isOnSpecialPage]);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    // Scroll when messages array changes
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTo({
        top: chatBodyRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const simulateTyping = (
    fullText,
    setMessages,
    messages,
    typingSpeed = 30 // adjust for speed (ms per character)
  ) => {
    setShowLlmSuggestions(false);
    let index = 0;

    const botMessage = { id: messages.length + 2, text: "", isBot: true };
    setMessages((prev) => [...prev, botMessage]);

    const interval = setInterval(() => {
      if (index < fullText.length) {
        const currentText = fullText.slice(0, index + 1);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMessage.id ? { ...msg, text: currentText } : msg
          )
        );

        // 👇 Scroll after each character
        if (chatBodyRef.current) {
          chatBodyRef.current.scrollTo({
            top: chatBodyRef.current.scrollHeight,
            behavior: "smooth",
          });
        }

        index++;
      } else {
        setShowLlmSuggestions(true);
        if (flag)
          setQuickQuestions([
            "What is Wel.x?",
            "Featured Programs?",
            "Certificate Criteria?",
            "How can I reach?",
          ]);
        setFlag(false);
        // Final scroll
        // if (chatBodyRef.current) {
        setTimeout(() => {
          chatBodyRef.current.scrollTo({
            top: chatBodyRef.current.scrollHeight,
            behavior: "smooth",
          });
        }, 200);
        // }
        console.log("completed typing");
        clearInterval(interval);
      }
    }, typingSpeed);
  };

  const formatTimestamp = (date) => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleSend = async (question) => {
    setShowDefaultQuestions(false)
    if (question || input.trim()) {
      setLlmSuggestedQuestions([]);
      const newMessage = {
        id: messages.length + 1,
        text: question ? question : input,
        isBot: false,
      };
      setMessages([...messages, newMessage]);
      setInput("");
      setShowLoader(true);
      // 👇 Show temporary "Typing..." message immediately
      // const typingMessageId = messages.length + 2;
      // setMessages(prev => [
      //   ...prev,
      //   { id: typingMessageId, text: "Typing...", isBot: true, isTyping: true }
      // ]);

      // setTimeout(() => {
      //   const botResponse = {
      //     id: messages.length + 2,
      //     text: "Thanks for your question! I'm processing your request and will get back to you shortly.",
      //     isBot: true
      //   }
      //   setMessages(prev => [...prev, botResponse])
      // }, 1000)

      try {
        // const token = localStorage.getItem("token");
        // if (!token) throw new Error("User not authenticated");
        let apiEndpoint;
        if (selectedOption === "faq") {
          apiEndpoint = "chat/";
        } else if (selectedOption === "techSupport") {
          apiEndpoint = "technical-query/";
        }
        const res = await axios.post(
          `${import.meta.env.VITE_CHAT_API_BASE_URL}/${apiEndpoint}`,
          { query: question ? question : input }, // send userId for backend without auth
          {
            headers: {
              "X-Session-Id": sessionStorage.getItem("chatSessionId"), // pass session ID here
            },
          }
        );
        console.log(res);

        const agentMessage = res.data;
        console.log(
          "Received agent response from backend:",
          agentMessage.response
        );
        // response.split("Suggested questions:");
        // Split the response on the "Suggested questions:" part
        const [agentResponse, suggestedQuestionsPart] =
          agentMessage.response.split("Suggested questions:");

        // Clean up the contact info
        const agentResponseClean = agentResponse.trim();

        // Extract the suggested questions as an array
        if (suggestedQuestionsPart) {
          const suggestedQuestions = suggestedQuestionsPart
            .split("\n")
            .map((q) => q.trim())
            .filter(
              (q) => q.length > 0 && !q.startsWith("What courses are offered?")
            ); // Remove the first example question if needed

          console.log(agentResponseClean);
          console.log(suggestedQuestions);
          setLlmSuggestedQuestions(suggestedQuestions);
        }

        // const botResponse = {
        //   id: messages.length + 2,
        //   text: res.data.response,
        //   isBot: true
        // }
        // setMessages(prev => [...prev, botResponse])

        //hide typing message
        // setMessages(prev => prev.filter(msg => msg.id !== typingMessageId));

        setShowLoader(false);
        simulateTyping(agentResponseClean, setMessages, messages);
      } catch (err) {
        setShowLoader(false);
        console.error("Error sending data:", err);
        console.error("Failed to get the response from agent");
      }
    }
  };

  const resetConversation = () => {
    setMessages([])
    createSession(sessionStorage.getItem("chatSessionId"));
  }

  const handleDropdownChange = (value) => {
    console.log("Parent received:", value);
    setSelectedOption(value);
  };

  const createSession = async (sessionId) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_CHAT_API_BASE_URL}/session/`, // replace with your API URL
        {}, // no body needed
        {
          headers: sessionId ? { "X-Session-Id": sessionId } : undefined,
        }
      );

      // The API returns { session_id: string }
      console.log("New session ID:", response.data.session_id);
      sessionStorage.setItem("chatSessionId", response.data.session_id);
      return response.data.session_id;
    } catch (error) {
      console.error(
        "Failed to get session:",
        error.response?.data || error.message
      );
      throw error;
    }
  };

  useEffect(() => {
    // Reset chat when option changes
    if (isOpen && flag) {
      createSession(sessionStorage.getItem("chatSessionId"));
      simulateTyping(
        "👋 Hi! I’m Welo, your Wel.x assistant 🤖. How can I help you today?",
        setMessages,
        messages
      );
    }
  }, [isOpen]);

  // const handleQuickQuestion = (question) => {
  //   const newMessage = { id: messages.length + 1, text: question, isBot: false }
  //   setMessages([...messages, newMessage])

  //   setTimeout(() => {
  //     let response = ""
  //     if (question.includes("get started")) {
  //       response = "To get started, sign up for an account and complete your profile. Then browse our course catalog to find courses that match your interests!"
  //     } else if (question.includes("courses")) {
  //       response = "We offer 500+ courses in programming, data science, business, and more. Visit our course marketplace to explore all available options."
  //     } else if (question.includes("progress")) {
  //       response = "You can track your progress on your dashboard. It shows completed courses, current progress, and upcoming deadlines."
  //     } else {
  //       response = "For technical support, please visit our contact page or email support@wel-x.com. Our team will help you resolve any issues."
  //     }

  //     const botResponse = { id: messages.length + 2, text: response, isBot: true }
  //     setMessages(prev => [...prev, botResponse])
  //   }, 1000)
  // }

  return (
    <div
      className={`fixed right-4 z-50 bottom-4 w-[90%] h-[52%] sm:w-[70%] sm:h-[52%] md:w-[52%] md:h-[55%] lg:w-[30%] lg:h-[70%]${
        !isOpen ? " pointer-events-none" : ""
      }`}
    >
      {isOpen && (
        <div className="bg-white rounded-lg shadow-2xl border h-full">
          <div className="h-[15%] text-white px-4 py-2 rounded-t-lg flex justify-between items-center bg-gradient-to-r from-[#273AA9] to-[#541F8A]">
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center space-x-2">
                <img src={welxMascotImg} className="w-10 h-14" />
                <span style={{ lineHeight: "normal" }} className="grid text-xs">
                  <b className="font-medium">Welo</b>Wel.x Assistant
                </span>
              </div>
              <div className="flex space-x-2">
                <span>
                  <Dropdown onSelect={handleDropdownChange} />
                </span>
                <button onClick={resetConversation}>
                  <RotateCw size={20} />
                </button>
                <button onClick={() => setIsOpen(false)}>
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>

          <div
            ref={chatBodyRef}
            className="overflow-y-auto p-4 space-y-3 h-[75%]"
          >
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex ${
                  message.isBot
                    ? "justify-start flex-col"
                    : "justify-end flex-col items-end"
                }`}
              >
                <div
                  className={`flex items-start ${
                    message.isBot ? "" : "w-full justify-end"
                  }`}
                >
                  {message.isBot && (
                    <img
                      src={welxMascotImg}
                      alt="agent"
                      className={`w-7 h-10 mr-2 ${
                        messages.length == index + 1
                          ? "transform -translate-x-1/2 animate-bounce"
                          : ""
                      }`}
                    />
                  )}
                  <div className="max-w-[80%] p-2 rounded-lg rounded-tl-none text-sm text-white whitespace-pre-wrap relative bg-gradient-to-r from-[#273AA9] to-[#541F8A] welxHyperLink">
                    {/* {message.text} */}
                    <LinkifyText text={message.text} />
                  </div>
                </div>
                { showDefaultQuestions && (
                  <div className="flex flex-wrap gap-2 mt-4 ml-16">
                    {quickQuestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          handleSend(question);
                        }}
                        className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full hover:bg-blue-100"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                )}
                {showLlmSuggestions &&
                  llmSuggestedQuestions.length > 0 &&
                  messages.length == index + 1 && (
                    <div className="flex flex-wrap gap-2 mt-4 ml-16">
                      {llmSuggestedQuestions.map((question, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            handleSend(question);
                          }}
                          className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full hover:bg-blue-100"
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  )}
                <div
                  className={`text-xs ${
                    message.isBot ? "p-2 ml-16" : "py-2 mr-1"
                  }`}
                >
                  {formatTimestamp(new Date())}
                </div>
              </div>
            ))}
            {/* {showLlmSuggestions && llmSuggestedQuestions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {llmSuggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => { 
                    handleSend(question);
                  }}
                  className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full hover:bg-blue-100"
                >
                  {question}
                </button>
              ))}
            </div>
            )} */}
            {showLoader && (
              <div className="flex items-center">
                <img
                  src={welxMascotImg}
                  alt="agent"
                  className="w-8 h-12 mt-2"
                />
                <div className="flex h-fit py-2 px-4 items-center bg-gradient-to-r from-[#273AA9] to-[#541F8A] rounded-lg rounded-tl-none">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="w-2 h-2 bg-white rounded-full block"
                      animate={{
                        opacity: [0.2, 1, 0.2],
                        y: [0, -3, 0],
                      }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        repeatType: "loop",
                        delay: i * 0.15,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="border-t h-[10%] flex items-center justify-between w-full px-4 py-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type your message..."
              className="flex-1 rounded-lg text-sm focus-visible:outline-none"
            />
            <button
              onClick={() => handleSend()}
              className=" text-white rounded-lg"
            >
              <Send size={20} style={{ color: "#2844cd" }} />
            </button>
          </div>
        </div>
      )}
      {!isOpen && (
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="pointer-events-auto absolute bottom-5 right-5 px-3 py-1 bg-white rounded-full shadow-lg"
          whileHover={{
            scale: [1, 1.2, 1],
            transition: {
              duration: 0.6,
              ease: "easeInOut",
              times: [0, 0.5, 1],
            },
          }}
        >
          <img src={welxMascotImg} alt="welx_mascot" className="w-10 h-14" />
        </motion.button>
      )}
    </div>
  );
}
