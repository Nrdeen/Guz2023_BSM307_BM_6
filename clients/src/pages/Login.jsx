import React from 'react'
import { useEffect } from 'react'
import { GoogleLogin } from "react-google-login"
import { gapi } from "gapi-script"
import { googleAuth } from '../apis/auth'
import { useState } from 'react'
import { loginUser } from '../apis/auth'
import { Link, useNavigate } from 'react-router-dom'
import { BsEmojiLaughing, BsEmojiExpressionless } from "react-icons/bs"
import { toast } from 'react-toastify';
import { validUser } from '../apis/auth'
import '../asus-theme.css'
const defaultData = {
  email: "",
  password: ""
}
function Login() {
  const [formData, setFormData] = useState(defaultData)
  const [isLoading, setIsLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const pageRoute = useNavigate()
  const googleSuccess = async (res) => {
    if (res?.profileObj) {
      console.log(res.profileObj)
      setIsLoading(true)
      const response = await googleAuth({ tokenId: res.tokenId })
      setIsLoading(false)

      console.log("response :" + res)
      if (response.data.token) {
        localStorage.setItem("userToken", response.data.token)
        pageRoute("/chats")

      }
    }
  }
  const googleFailure = (error) => {
    // toast.error("Something went Wrong.Try Again!")
  }
  const handleOnChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const formSubmit = async (e) => {
    e.preventDefault()
    if (formData.email.includes("@") && formData.password.length > 6) {
      setIsLoading(true)
      const { data } = await loginUser(formData)
      if (data?.token) {
        localStorage.setItem("userToken", data.token)
        toast.success("Succesfully Login!")
        setIsLoading(false)
        pageRoute("/chats")
      }
      else {
        setIsLoading(false)
        toast.error("Invalid Credentials!")
        setFormData({ ...formData, password: "" })
      }
    }
    else {
      setIsLoading(false)
      toast.warning("Provide valid Credentials!")
      setFormData(defaultData)

    }
  }
  useEffect(() => {
    const initClient = () => {
      gapi.client.init({
        clientId: process.env.REACT_APP_CLIENT_ID,
        scope: ''
      });
    };
    gapi.load('client:auth2', initClient);
    const isValid = async () => {
      const data = await validUser()
      if (data?.user) {
        window.location.href = "/chats"
      }

    }
    isValid()
  }, [])
  return (
    <>
      <div className='asus-container w-[100vw] h-[100vh] flex justify-center items-center relative'>
        {/* ASUS Background Pattern */}
        <div className='absolute inset-0 opacity-10'>
          <div className='absolute top-10 left-10 w-64 h-64 bg-gradient-to-br from-[#00d9ff] to-transparent rounded-full blur-3xl'></div>
          <div className='absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-tl from-[#0066ff] to-transparent rounded-full blur-3xl'></div>
        </div>

        <div className='w-[90%] sm:w-[450px] relative z-10'>
          {/* ASUS Logo & Header */}
          <div className='text-center mb-8'>
            <h1 className='asus-logo mb-2'>ASUS CHAT</h1>
            <div className='asus-divider'></div>
          </div>

          {/* Login Card */}
          <div className='asus-card p-8'>
            <div className='mb-6'>
              <h3 className='text-[28px] font-bold tracking-wider asus-text-white mb-2'>Welcome Back</h3>
              <p className='asus-text-secondary text-[14px] tracking-wide'>
                No Account? <Link className='asus-text-primary hover:underline transition-all' to="/register">Sign up</Link>
              </p>
            </div>

            <form className='flex flex-col gap-y-4' onSubmit={formSubmit}>
              <div>
                <label className='asus-text-secondary text-[12px] mb-2 block uppercase tracking-wider'>Email Address</label>
                <input 
                  className="asus-input w-[100%]" 
                  onChange={handleOnChange} 
                  name="email" 
                  type="text" 
                  placeholder='Enter your email' 
                  value={formData.email} 
                  required 
                />
              </div>

              <div className='relative'>
                <label className='asus-text-secondary text-[12px] mb-2 block uppercase tracking-wider'>Password</label>
                <input 
                  className='asus-input w-[100%] pr-12' 
                  onChange={handleOnChange} 
                  type={showPass ? "text" : "password"} 
                  name="password" 
                  placeholder='Enter your password' 
                  value={formData.password} 
                  required 
                />
                {
                  !showPass ? 
                    <button type='button' className='absolute right-4 top-[42px] transition-all hover:scale-110'>
                      <BsEmojiLaughing onClick={() => setShowPass(!showPass)} className='text-[#00d9ff] w-[24px] h-[24px]' />
                    </button> : 
                    <button type='button' className='absolute right-4 top-[42px] transition-all hover:scale-110'>
                      <BsEmojiExpressionless onClick={() => setShowPass(!showPass)} className='text-[#00d9ff] w-[24px] h-[24px]' />
                    </button>
                }
              </div>

              <button className='asus-btn w-[100%] h-[52px] mt-4 relative' type='submit'>
                <div style={{ display: isLoading ? "" : "none" }} className='absolute -top-[53px] left-[50%] transform -translate-x-1/2'>
                  <lottie-player src="https://assets2.lottiefiles.com/packages/lf20_h9kds1my.json" background="transparent" speed="1" style={{ width: "200px", height: "160px" }} loop autoplay></lottie-player>
                </div>
                <span style={{ display: isLoading ? "none" : "block" }} className='relative z-10'>Login</span>
              </button>

              <div className='asus-divider my-2'></div>

              <GoogleLogin
                clientId={process.env.REACT_APP_CLIENT_ID}
                render={(renderProps) => (
                  <button 
                    onClick={renderProps.onClick} 
                    disabled={renderProps.disabled} 
                    aria-label="Continue with google" 
                    className="asus-card py-3.5 px-4 flex items-center justify-center w-[100%] hover:border-[#00d9ff] transition-all group"
                    type="button"
                  >
                    <img src="https://tuk-cdn.s3.amazonaws.com/can-uploader/sign_in-svg2.svg" alt="google" className='w-5 h-5' />
                    <p className="text-[14px] font-medium ml-3 asus-text-white group-hover:asus-text-primary transition-all">Continue with Google</p>
                  </button>
                )}
                onSuccess={googleSuccess}
                onFailure={googleFailure}
                cookiePolicy={'single_host_origin'}
                scope="profile email https://www.googleapis.com/auth/user.birthday.read"
              />
            </form>
          </div>

          {/* Footer */}
          <div className='text-center mt-6'>
            <p className='asus-text-secondary text-[11px] tracking-wider'>
              Powered by ASUS Technology © 2024
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default Login