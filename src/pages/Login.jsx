import React from 'react'
import { Template } from '../components/core/Auth/Template'
import loginimg from '../assets/Images/login.webp'

function Login(){
  return (
    <Template title='Welcome back' description1='Build skills for today, tomorrow, and beyond.' description2='Education to future-proof your career.' image={loginimg} formType='login'/>
  )
}

export default Login
