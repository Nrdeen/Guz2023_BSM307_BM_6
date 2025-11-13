import React, { useState } from 'react'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { searchUsers, validUser } from '../apis/auth'
import { setActiveUser } from '../redux/activeUserSlice'
import { RiNotificationBadgeFill } from "react-icons/ri"
import { BsSearch } from "react-icons/bs"
import { BiNotification } from "react-icons/bi"
import { IoIosArrowDown } from "react-icons/io"
import { setShowNotifications, setShowProfile } from '../redux/profileSlice'
import Chat from './Chat'
import Profile from "../components/Profile"
import { acessCreate } from "../apis/chat.js"
import "./home.css"
import '../asus-theme.css'
import { fetchChats, setNotifications } from '../redux/chatsSlice'
import { getSender } from '../utils/logics'
import { setActiveChat } from '../redux/chatsSlice'
import Group from '../components/Group'
import Contacts from '../components/Contacts'
import { Effect } from "react-notification-badge"
// import NotificationBadge from 'react-notification-badge/lib/components/NotificationBadge';
import NotificationBadge from 'react-notification-badge';
import Search from '../components/group/Search'
function Home() {
  const dispatch = useDispatch()
  const { showProfile, showNotifications } = useSelector((state) => state.profile)
  const { notifications } = useSelector((state) => state.chats)
  const { activeUser } = useSelector((state) => state)
  const [searchResults, setSearchResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [search, setSearch] = useState("")

  const handleSearch = async (e) => {
    setSearch(e.target.value)
  }
  const handleClick = async (e) => {
    await acessCreate({ userId: e._id })
    dispatch(fetchChats())
    setSearch("")
  }
  useEffect(() => {
    const searchChange = async () => {
      setIsLoading(true)
      const { data } = await searchUsers(search)
      setSearchResults(data)
      setIsLoading(false)
    }
    searchChange()
  }, [search])
  useEffect(() => {
    const isValid = async () => {
      const data = await validUser()

      const user = {
        id: data?.user?._id,
        email: data?.user?.email,
        profilePic: data?.user?.profilePic,
        bio: data?.user?.bio,
        name: data?.user?.name
      }
      dispatch(setActiveUser(user))
    }
    isValid()

  }, [dispatch, activeUser])


  return (
    <>
      <div className="asus-container scrollbar-hide z-10 h-[100vh] lg:w-[90%] lg:mx-auto overflow-y-hidden">
        <div className='flex h-full'>
          {
            !showProfile ?
              <div className="asus-sidebar md:flex md:flex-col min-w-[360px] h-[100vh] md:h-[98.6vh] relative">
                {/* Header */}
                <div className='asus-header h-[70px] px-5'>
                  <div className='flex items-center justify-between h-full'>
                    <a className='flex items-center' href='/'>
                      <h3 className='text-[18px] asus-text-primary font-extrabold tracking-wider uppercase'>Messages</h3>
                    </a>
                    
                    <div className='flex items-center gap-x-4'>
                      <button 
                        onClick={() => dispatch(setShowNotifications(!showNotifications))}
                        className='relative transition-all hover:scale-110'
                      >
                        <NotificationBadge
                          count={notifications.length}
                          effect={Effect.SCALE}
                          style={{ 
                            width: "16px", 
                            height: "16px", 
                            fontSize: "9px", 
                            padding: "4px 2px 2px 2px",
                            background: "linear-gradient(135deg, #00d9ff 0%, #0066ff 100%)"
                          }}
                        />
                        {
                          showNotifications ? 
                            <RiNotificationBadgeFill className='w-[24px] h-[24px] text-[#00d9ff]' /> : 
                            <BiNotification className='w-[24px] h-[24px] text-[#00d9ff]' />
                        }
                      </button>

                      {/* Notifications Dropdown */}
                      <div className={`${showNotifications ? "asus-notification overflow-y-scroll asus-scrollbar tracking-wide absolute top-16 right-5 z-20 w-[280px] max-h-[400px]" : "hidden"}`}>
                        <div className='asus-text-white text-[13px] font-semibold mb-2 pb-2 border-b border-[#00d9ff]/20'>
                          {!notifications.length ? "No new messages" : "Notifications"}
                        </div>
                        {
                          notifications.map((e, index) => {
                            return (
                              <div 
                                onClick={() => {
                                  dispatch(setActiveChat(e.chatId))
                                  dispatch(setNotifications(notifications.filter((data) => data !== e)))
                                }} 
                                key={index} 
                                className='asus-contact text-[12px] asus-text-secondary hover:asus-text-primary cursor-pointer mb-2'
                              >
                                {e.chatId.isGroup ? `New Message in ${e.chatId.chatName}` : `New Message from ${getSender(activeUser, e.chatId.users)}`}
                              </div>
                            )
                          })
                        }
                      </div>

                      <button 
                        onClick={() => dispatch(setShowProfile(true))} 
                        className='flex items-center gap-x-2 asus-card px-3 py-2 transition-all hover:border-[#00d9ff]'
                      >
                        <img className='asus-avatar w-[32px] h-[32px]' src={activeUser?.profilePic} alt="" />
                        <IoIosArrowDown className='text-[#00d9ff] h-[14px] w-[14px]' />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Search Section */}
                <div className='px-4 py-4'>
                  <form onSubmit={(e) => e.preventDefault()} className='relative'>
                    <div className='asus-search flex items-center'>
                      <BsSearch className='text-[#00d9ff] mr-3' />
                      <input 
                        onChange={handleSearch} 
                        className='bg-transparent asus-text-white w-full outline-none text-[14px]' 
                        type="text" 
                        name="search" 
                        placeholder="Search contacts..." 
                      />
                    </div>
                  </form>

                  <div className='mt-4'>
                    <Group />
                  </div>

                  {/* Search Results */}
                  <div style={{ display: search ? "" : "none" }} className='h-[calc(100vh-150px)] absolute z-10 w-[calc(100%-32px)] left-[16px] top-[140px] asus-sidebar asus-scrollbar overflow-y-auto p-4 rounded-lg'>
                    <Search searchResults={searchResults} isLoading={isLoading} handleClick={handleClick} search={search} />
                  </div>
                </div>

                {/* Contacts List */}
                <div className='flex-1 overflow-hidden'>
                  <Contacts />
                </div>
              </div> : 
              <Profile className="min-w-[100%] sm:min-w-[360px] h-[100vh] asus-sidebar relative" />
          }
          
          <Chat className="chat-page relative lg:w-[100%] h-[100vh] asus-container" />
        </div>
      </div>
    </>
  )
}

export default Home