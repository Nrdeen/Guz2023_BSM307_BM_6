import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Model from '../components/Model';
import { BsEmojiSmile, BsFillEmojiSmileFill } from "react-icons/bs"
import { fetchMessages, sendMessage } from '../apis/messages';
import { useEffect } from 'react';
import MessageHistory from '../components/MessageHistory';
import io from "socket.io-client"
import "./home.css"
import '../asus-theme.css'
import { fetchChats, setNotifications } from '../redux/chatsSlice';
import Loading from '../components/ui/Loading';
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { getChatName } from '../utils/logics';
import Typing from '../components/ui/Typing';
import { validUser } from '../apis/auth';
const ENDPOINT = process.env.REACT_APP_SERVER_URL
let socket, selectedChatCompare;

function Chat(props) {
  const { activeChat, notifications } = useSelector((state) => state.chats)
  const dispatch = useDispatch()
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([])
  const [socketConnected, setSocketConnected] = useState(false)
  const [typing, setTyping] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPicker, setShowPicker] = useState(false);
  const activeUser = useSelector((state) => state.activeUser)

  const keyDownFunction = async (e) => {
    if ((e.key === "Enter" || e.type === "click") && (message)) {
      setMessage("")
      socket.emit("stop typing", activeChat._id)
      const data = await sendMessage({ chatId: activeChat._id, message })
      socket.emit("new message", data)
      setMessages([...messages, data])
      dispatch(fetchChats())
    }
  }


  useEffect(() => {
    socket = io(ENDPOINT)
    socket.on("typing", () => setIsTyping(true))
    socket.on("stop typing", () => setIsTyping(false))
  }, [])

  useEffect(() => {
    socket.emit("setup", activeUser)
    socket.on("connected", () => {
      setSocketConnected(true)
    })
  }, [messages, activeUser])
  useEffect(() => {
    const fetchMessagesFunc = async () => {
      if (activeChat) {
        setLoading(true)
        const data = await fetchMessages(activeChat._id)
        setMessages(data)
        socket.emit("join room", activeChat._id)
        setLoading(false)

      }
      return
    }
    fetchMessagesFunc()
    selectedChatCompare = activeChat

  }, [activeChat])
  useEffect(() => {
    socket.on("message recieved", (newMessageRecieved) => {
      if ((!selectedChatCompare || selectedChatCompare._id) !== newMessageRecieved.chatId._id) {
        if (!notifications.includes(newMessageRecieved)) {
          dispatch(setNotifications([newMessageRecieved, ...notifications]))
        }
      }
      else {
        setMessages([...messages, newMessageRecieved])
      }
      dispatch(fetchChats())
    })
  })
  useEffect(() => {
    const isValid = async () => {
      const data = await validUser()
      if (!data?.user) {
        window.location.href = "/login"
      }

    }
    isValid()
  }, [])
  if (loading) {
    return <div className={props.className}>
      <Loading />
    </div>
  }
  return (
    <>
      {
        activeChat ?
          <div className={props.className}>
            {/* Chat Header */}
            <div className='asus-header flex justify-between items-center px-6 h-[70px]'>
              <div className='flex items-center gap-x-4'>
                <div className='flex flex-col items-start justify-center'>
                  <h5 className='text-[18px] asus-text-white font-bold tracking-wide'>{getChatName(activeChat, activeUser)}</h5>
                  <p className='text-[11px] asus-text-secondary'>Active now</p>
                </div>
              </div>
              <div>
                <Model />
              </div>
            </div>

            {/* Messages Area */}
            <div className='asus-scrollbar w-[100%] h-[calc(100vh-220px)] flex flex-col overflow-y-scroll p-6 bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a]'>
              <MessageHistory typing={isTyping} messages={messages} />
              <div className='ml-7 -mb-10'>
                {
                  isTyping ?
                    <Typing width="100" height="100" /> : ""
                }
              </div>
            </div>

            {/* Message Input Area */}
            <div className='absolute bottom-6 left-1/2 transform -translate-x-1/2 w-[90%] max-w-[600px]'>
              {
                showPicker && 
                <div className='mb-2'>
                  <Picker 
                    data={data} 
                    onEmojiSelect={(e) => setMessage(message + e.native)}
                    theme="dark"
                  />
                </div>
              }
              
              <div className='asus-card p-4'>
                <form onKeyDown={(e) => keyDownFunction(e)} onSubmit={(e) => e.preventDefault()}>
                  <div className='flex items-center gap-x-3'>
                    {/* Emoji Picker Button */}
                    <button 
                      type='button'
                      className='cursor-pointer transition-all hover:scale-110' 
                      onClick={() => setShowPicker(!showPicker)}
                    >
                      {showPicker ? 
                        <BsFillEmojiSmileFill className='w-[24px] h-[24px] text-[#00d9ff]' /> : 
                        <BsEmojiSmile className='w-[24px] h-[24px] text-[#00d9ff]' />
                      }
                    </button>

                    {/* Message Input */}
                    <input 
                      onChange={(e) => {
                        setMessage(e.target.value)
                        if (!socketConnected) return
                        if (!typing) {
                          setTyping(true)
                          socket.emit('typing', activeChat._id)
                        }
                        let lastTime = new Date().getTime()
                        var time = 3000
                        setTimeout(() => {
                          var timeNow = new Date().getTime()
                          var timeDiff = timeNow - lastTime
                          if (timeDiff >= time && typing) {
                            socket.emit("stop typing", activeChat._id)
                            setTyping(false)
                          }
                        }, time)
                      }} 
                      className='flex-1 bg-transparent asus-text-white outline-none text-[14px] px-3 py-2 border border-[#00d9ff]/30 rounded-lg focus:border-[#00d9ff] transition-all' 
                      type="text" 
                      name="message" 
                      placeholder="Type your message..." 
                      value={message} 
                    />

                    {/* Send Button */}
                    <button 
                      onClick={(e) => keyDownFunction(e)} 
                      className='asus-btn px-6 py-2 text-[13px]'
                      type='button'
                    >
                      Send
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div> :
          <div className={props.className}>
            <div className='relative h-full flex items-center justify-center'>
              <div className='flex flex-col items-center justify-center gap-y-4'>
                <img className='asus-avatar w-[80px] h-[80px] asus-glow' alt="User profile" src={activeUser.profilePic} />
                <div className='text-center'>
                  <h3 className='asus-text-white text-[24px] font-medium tracking-wider mb-2'>
                    Welcome back
                  </h3>
                  <p className='asus-text-primary text-[20px] font-bold'>
                    {activeUser.name}
                  </p>
                  <p className='asus-text-secondary text-[14px] mt-3'>
                    Select a chat to start messaging
                  </p>
                </div>
                <div className='asus-divider w-[200px]'></div>
              </div>
            </div>
          </div>
      }
    </>
  )
}

export default Chat