import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom';
import { getPasswordResetToken } from '../services/operations/authAPI';
import {BiArrowBack} from 'react-icons/bi'

const ForgotPassword = () => {
    const {loading} = useSelector((state) => state.auth);

    //check email(this page is seens after sending the email) vala page dikhana hai ya reset your password(this page is seen before sending the mail) vala page dikhana hai
    const[emailSent, setEmailSent] = useState(false);

    //email send hone ke baad, I can see the email of the user on the check your email page
    const [email, setEmail] = useState('');

    const dispatch = useDispatch();

    const handleOnSubmit = (e) => {
        e.preventDefault();
        //khud se jo bhi action perform karna chahta hoon
        //why passed setEmailSent -> bcz jaise hi mail sent ho jaye setEmailSent ko true mark kar denge taki we can change the UI and show check your email page
        dispatch(getPasswordResetToken(email,setEmailSent));
    }

  return (
    <div className='grid min-h-[calc(100vh-3.5rem)] place-items-center'>
        {
            loading ? 
            (<div className='spinner'></div>)
            :
            (
                <div className='max-w-[500px] p-4 lg:p-8'>
                    <h1 className='text-[1.875rem] font-semibold leading-[2.375rem] text-richblack-5'>
                        {
                            !emailSent ? 'Reset Your Password' : 'Check Your Email'
                        }
                    </h1>

                    <p className='my-4 text-[1.125rem] leading-[1.625rem] text-richblack-100'>
                        {
                            !emailSent ? 
                            `Have no fear. We'll email you instructions to reset your password. If you don't have access to your email we can try account recovery.`
                            : 
                            `We have sent the reset email to ${email}`
                        }
                    </p>

                    <form onSubmit={handleOnSubmit}>
                        {
                            !emailSent && (
                                <label className='w-full'>
                                    <p className='mb-1 text-[0.875rem] leading-[1.375rem] text-richblack-5'>Email Address<sup className='text-pink-200'>*</sup></p>
                                    <input required type='email' name='email' value={email} onChange={(e) => setEmail(e.target.value)} placeholder='Enter your email address' style={{boxShadow:'inset 0px -1px 0px rgba(255,255,255,0.18)'}} className='w-full rounded-[0.5rem] bg-richblack-800 p-[12px] text-richblack-5'/>
                                </label>
                            )
                        }

                        <button type='submit' className='mt-6 w-full rounded-[8px] bg-yellow-50 py-[12px] px-[12px] font-medium text-richblack-900'>
                            {
                                !emailSent ? 'Reset Password'
                                :
                                'Resend Email'
                            }
                        </button>
                    </form>

                    <div className='mt-6 flex items-center justify-between'>
                        <Link to='/login'>
                            <p className='flex items-center gap-x-2 text-richblack-5'>
                            <BiArrowBack/>Back to Login</p>
                        </Link>
                    </div>
                </div>
            )
        }
    </div>
  )
}

export default ForgotPassword