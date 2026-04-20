import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Auth from './pages/Auth'
import { useEffect, useRef, useState } from 'react'
import axiosInstance from './utils/axiosConfig'
import { useDispatch, useSelector } from 'react-redux'
import { setUserData } from './redux/userSlice'
import InterviewPage from './pages/InterviewPage'
import InterviewHistory from './pages/InterviewHistory'
import Pricing from './pages/Pricing'
import InterviewReport from './pages/InterviewReport'

export const ServerUrl = import.meta.env.VITE_API_URL || "http://localhost:5000"

function App() {

  const dispatch = useDispatch()
  const userData = useSelector(state => state.user)
  const [loading, setLoading] = useState(true)
  const hasFetched = useRef(false)

  useEffect(()=>{
    const getUser = async () => {
      // Prevent multiple fetches
      if (hasFetched.current) {
        return
      }
      
      hasFetched.current = true
      
      // First, check if userData is already in Redux (user just logged in)
      if (userData) {
        console.log("User already in Redux:", userData.email)
        setLoading(false)
        return
      }
      
      // Check localStorage as fallback
      const storedUser = localStorage.getItem('currentUser')
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser)
          console.log("Restoring user from localStorage:", user.email)
          dispatch(setUserData(user))
          setLoading(false)
          return
        } catch (e) {
          console.log("Failed to restore from localStorage")
        }
      }
      
      // Finally, fetch from API with credentials
      try {
        console.log("Fetching current user from API...")
        const result = await axiosInstance.get("/api/user/current-user")
        
        if (result.data) {
          console.log("User fetched from API:", result.data.email)
          dispatch(setUserData(result.data))
          // Store in localStorage
          localStorage.setItem('currentUser', JSON.stringify(result.data))
        } else {
          console.log("No user data from API")
          dispatch(setUserData(null))
          localStorage.removeItem('currentUser')
        }
      } catch (error) {
        console.error("User fetch error:", error.response?.status, error.message)
        dispatch(setUserData(null))
        localStorage.removeItem('currentUser')
      } finally {
        setLoading(false)
      }
    }
    getUser()

  },[])
  return (
    <Routes>
      <Route path='/' element={<Home/>}/>
      <Route path='/auth' element={<Auth/>}/>
      <Route path='/interview' element={<InterviewPage/>}/>
      <Route path='/history' element={<InterviewHistory/>}/>
      <Route path='/pricing' element={<Pricing/>}/>
      <Route path='/report/:id' element={<InterviewReport/>}/>



    </Routes>
  )
}

export default App
