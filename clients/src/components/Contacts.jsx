import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setActiveChat, fetchChats } from '../redux/chatsSlice'
import { useEffect } from 'react'
import { getChatName, getChatPhoto, timeSince } from '../utils/logics'
import NoContacts from './ui/NoContacts'
import '../asus-theme.css'
// import SkeletonLoading from './ui/SkeletonLoading'
var aDay = 24 * 60 * 60 * 1000;
function Contacts() {
  const { chats, activeChat } = useSelector((state) => state.chats)
  const dispatch = useDispatch()
  const activeUser = useSelector((state) => state.activeUser)
  useEffect(() => {
    dispatch(fetchChats())
  }, [dispatch])
  return (
    <>
      <div className='flex flex-col gap-y-2 overflow-y-scroll asus-scrollbar h-[calc(100vh-200px)] pb-10 px-4'>
        {
          chats?.length > 0 ? chats?.map((e) => {
            return (
              <div 
                onClick={() => {
                  dispatch(setActiveChat(e))
                }} 
                key={e._id} 
                className={`asus-contact flex items-center justify-between ${activeChat._id === e._id ? "active" : ""}`}
              >
                <div className='flex items-center gap-x-3'>
                  <img 
                    className='asus-avatar w-12 h-12 object-cover' 
                    src={getChatPhoto(e, activeUser)} 
                    alt="" 
                  />
                  <div>
                    <h5 className='text-[14px] asus-text-white font-bold mb-1'>
                      {getChatName(e, activeUser)}
                    </h5>
                    <p className='text-[12px] asus-text-secondary'>
                      {e.latestMessage?.message.length > 30
                        ? e.latestMessage?.message.slice(0, 30) + "..."
                        : e.latestMessage?.message || "No messages yet"
                      }
                    </p>
                  </div>
                </div>
                <div className='flex flex-col items-end gap-y-2'>
                  <p className='text-[11px] asus-text-secondary tracking-wide'>
                    {timeSince(new Date(Date.parse(e.updatedAt) - aDay))}
                  </p>
                  {e.unreadCount > 0 && (
                    <span className='asus-badge'>
                      {e.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            )
          }) : <NoContacts />
        }
      </div>
    </>
  )
}

export default Contacts