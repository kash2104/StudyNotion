import React, { useState } from 'react'
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai"
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom'
import {ACCOUNT_TYPE} from '../../../utils/constants'
import toast from 'react-hot-toast';
import { setSignupData } from '../../../slices/authSlice';
import { sendotp } from '../../../services/operations/authAPI';
import { Tab } from '../../common/Tab';

function SignupForm(){
    const navigate = useNavigate();
    const dispatch = useDispatch();

    //student or instructor
    const [accountType, setAccoutType] = useState(ACCOUNT_TYPE.STUDENT);

    const [formData, setFormData] = useState({
        firstName:'',
        lastName:'',
        email:'',
        password:'',
        confirmPassword:'',
    })

    const[showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {firstName, lastName, email, password, confirmPassword} = formData;

    //handling the inputs when their value changes
    const handleOnChange = (e) => {
        setFormData((prevData) => ({
            ...prevData,
            [e.target.name]:e.target.value,
        }))
    }

    //handling the form submission
    const handleOnSubmit = (e) => {
        e.preventDefault();

        if(password !== confirmPassword){
            toast.error('Passwords do not match')
            return
        }
        const signupData = {
            ...formData,
            accountType,
        }

        //setting up the signup data using useState which is to be used after otp verification
        dispatch(setSignupData(signupData))

        //sending the otp to user for verification
        dispatch(sendotp(formData.email, navigate));

        //resetting the whole form
        setFormData({
            firstName:'',
            lastName:'',
            email:'',
            password:'',
            confirmPassword:'',
        })
        setAccoutType(ACCOUNT_TYPE.STUDENT);
    }

    //data to pass to tab component
    const tabData = [
        {
            id:1,
            tabName:'Student',
            type:ACCOUNT_TYPE.STUDENT,
        },
        {
            id:2,
            tabName:'Instructor',
            type:ACCOUNT_TYPE.INSTRUCTOR
        }
    ]
    
  return (
    <div>
        {/* tab */}
        <Tab tabData={tabData} field={accountType} setField={setAccoutType}/>

        {/* form */}
        <form onSubmit={handleOnSubmit} className='flex w-full flex-col gap-y-4'>

            <div className='flex gap-x-4'>
                <label>
                    <p className='mb-1 text-[0.875rem] leading-[1.375rem] text-richblack-5'>
                        First Name <sup className='text-pink-200'>*</sup>
                    </p>

                    <input required type='text' name='firstName' value={firstName} onChange={handleOnChange} placeholder='Enter your first name' style={{boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)",}} className='w-full rounded-[0.5rem] bg-richblack-800 p-[12px] text-richblack-5'/>
                </label>

                <label>
                    <p className='mb-1 text-[0.875rem] leading-[1.375rem] text-richblack-5'>
                        Last Name <sup className='text-pink-200'>*</sup>
                    </p>

                    <input required type='text' name='lastName' value={lastName} onChange={handleOnChange} placeholder='Enter your last name' style={{boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)",}} className='w-full rounded-[0.5rem] bg-richblack-800 p-[12px] text-richblack-5'/>
                </label>
            </div>

            <label className='w-full'>
                <p className='mb-1 text-[0.875rem] leading-[1.375rem] text-richblack-5'>
                    Email Address <sup className='text-pink-200'>*</sup>
                </p>

                <input required type='email' name='email' value={email} onChange={handleOnChange} placeholder='Enter email address' style={{boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)",}} className='w-full rounded-[0.5rem] bg-richblack-800 p-[12px] text-richblack-5'/>
            </label>

            <div className='flex gap-x-4'>
                <label className='relative'>
                    <p className='mb-1 text-[0.875rem] leading-[1.375rem] text-richblack-5'>
                        Password <sup className='text-pink-200'>*</sup>
                    </p>

                    <input required type={showPassword ? 'text':'password'} name='password' value={password} onChange={handleOnChange} placeholder='Enter password' style={{boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)",}} className='w-full rounded-[0.5rem] bg-richblack-800 p-[12px] text-richblack-5'/>

                    <span onClick={() => setShowPassword((prev) => !prev)} className='absolute right-3 top-[38px] z-[10] cursor-pointer'>
                        {
                            showPassword ?
                            (<AiOutlineEyeInvisible fontSize={24} fill="#AFB2BF" />)
                            :
                            (<AiOutlineEye fontSize={24} fill="#AFB2BF" />)
                        }
                    </span>
                </label>

                <label className='relative'>
                    <p className='mb-1 text-[0.875rem] leading-[1.375rem] text-richblack-5'>
                        Confirm Password <sup className='text-pink-200'>*</sup>
                    </p>

                    <input required type={showConfirmPassword ? 'text':'password'} name='confirmPassword' value={confirmPassword} onChange={handleOnChange} placeholder='Confirm password' style={{boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)",}} className='w-full rounded-[0.5rem] bg-richblack-800 p-[12px] text-richblack-5'/>

                    <span onClick={() => setShowConfirmPassword((prev) => !prev)} className='absolute right-3 top-[38px] z-[10] cursor-pointer'>
                        {
                            showConfirmPassword ?
                            (<AiOutlineEyeInvisible fontSize={24} fill="#AFB2BF" />)
                            :
                            (<AiOutlineEye fontSize={24} fill="#AFB2BF" />)
                        }
                    </span>
                </label>
            </div>

            <button type='submit' className='mt-6 rounded-[8px] bg-yellow-50 py-[8px] px-[12px] font-medium text-richblack-900'>
                Create Account
            </button>

        </form>
    </div>
  )
}

export default SignupForm
