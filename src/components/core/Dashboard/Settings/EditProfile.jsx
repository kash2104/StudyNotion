import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { updateProfile } from '../../../../services/operations/SettingsAPI';
import IconBtn from '../../../common/IconBtn';

const genders = ['Male', 'Female', 'Other'];

const EditProfile = () => {
    const {user} = useSelector((state) => state.profile);
    const{token} = useSelector((state) => state.auth);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const{register, handleSubmit, formState:{errors},} = useForm();

    const submitProfileForm = async (data) => {
        try {
            dispatch(updateProfile(token, data))
        } 
        catch (error) {
            console.log('ERROR MESSAGE FOR EDITING PROFILE IN FRONTEND....', error.message);
        }
    }

    
  return (
    <>
        <form onSubmit={handleSubmit(submitProfileForm)}>

            <div className='my-10 flex flex-col gap-y-6 rounded-md border-[1px] border-richblack-700 bg-richblack-800 p-8 px-12'>

                <h2 className='text-lg font-semibold text-richblack-5'>
                    Profile Information
                </h2>

                <div className='flex flex-col gap-5 lg:flex-row'>

                    <div className='flex flex-col gap-2 lg:w-[48%]'>

                        <label htmlFor='firstName' className='label-style'>
                            First Name
                        </label>
                        <input type='text' name='firstName' id='firstName' placeholder='Enter first name' style={{boxShadow:'inset 0px -1px 0px rgba(255,255,255,0.18)'}} className='w-full rounded-[0.5rem] bg-richblack-800 p-[12px] text-richblack-5' {...register('firstName', {required:true})} defaultValue={user?.firstName}/>

                        {
                            errors.firstName && (
                                <span className='-mt-1 text-[12px] text-yellow-100'>
                                    Please enter your first name
                                </span>
                            )
                        }
                    </div>

                    <div className='flex flex-col gap-2 lg:w-[48%]'>

                        <label htmlFor='lastName' className='label-style'>
                            Last Name
                        </label>
                        <input type='text' name='lastName' id='lastName' placeholder='Enter last name' style={{boxShadow:'inset 0px -1px 0px rgba(255,255,255,0.18)'}} className='w-full rounded-[0.5rem] bg-richblack-800 p-[12px] text-richblack-5' {...register('lastName', {required:true})} defaultValue={user?.lastName}/>

                        {
                            errors.lastName && (
                                <span className='-mt-1 text-[12px] text-yellow-100'>
                                    Please enter your last name
                                </span>
                            )
                        }
                    </div>
                </div>
                
                <div className='flex flex-col gap-5 lg:flex-row'>
                    {/* date of birth */}
                    <div className='flex flex-col gap-2 lg:w-[48%]'>
                        <label htmlFor='dateOfBirth' className='label-style'>
                            Date of Birth
                        </label>

                        <input name='dateOfBirth' id='dateOfBirth' style={{boxShadow:'inset 0px -1px 0px rgba(255,255,255,0.18)'}} className='w-full rounded-[0.5rem] bg-richblack-800 p-[12px] text-richblack-5' {...register('dateOfBirth', {
                            required:{
                                value:true,
                                message:'Please enter your birth date'
                            },

                            max:{
                                value:new Date().toISOString().split('T')[0],
                                message:'Date of birth cannot be in the future'
                            }
                        })} defaultValue={user?.additionalDetails?.dateOfBirth}/>

                            {
                                errors.dateOfBirth && (
                                    <span className='-mt-1 text-[12px] text-yellow-100'>
                                    {errors.dateOfBirth.message}
                                    </span>
                                )
                            }
                    </div>
                    {/* gender */}
                    <div className='flex flex-col gap-2 lg:w-[48%]'>

                            <label htmlFor='gender' className='label-style'>
                                Gender
                            </label>
                            <select type='text' name='gender' id='gender' placeholder='Enter first name' style={{boxShadow:'inset 0px -1px 0px rgba(255,255,255,0.18)'}} className='w-full rounded-[0.5rem] bg-richblack-800 p-[12px] text-richblack-5' {...register('gender', {required:true})} defaultValue={user?.additionalDetails?.gender}>
                                {
                                    genders.map((element, index) => {
                                        return(
                                            <option key={index} value={element}>
                                                {element}
                                            </option>
                                        )
                                    })
                                }
                            </select>

                            {
                                errors.gender && (
                                    <span className='-mt-1 text-[12px] text-yellow-100'>
                                        Please select your gender
                                    </span>
                                )
                            }
                    </div>
                </div>

                <div className='flex flex-col gap-5 lg:flex-row'>
                        {/* contact number */}
                        <div className='flex flex-col gap-2 lg:w-[48%]'>
                            <label htmlFor='contactNumber' className='label-style'>
                                Contact Number
                            </label>

                            <input name='contactNumber' id='contactNumber' style={{boxShadow:'inset 0px -1px 0px rgba(255,255,255,0.18)'}} className='w-full rounded-[0.5rem] bg-richblack-800 p-[12px] text-richblack-5' {...register('contactNumber', {
                                required:{
                                    value:true,
                                    message:'Please enter your contact number'
                                },

                                maxLength:{value:12, message:'Invalid contact number'},
                                minLength:{value:10, message: 'Invalid contact number'}
                            })} defaultValue={user?.additionalDetails?.contactNumber}/>

                                {
                                    errors.contactNumber && (
                                        <span className='-mt-1 text-[12px] text-yellow-100'>
                                        {errors.contactNumber.message}
                                        </span>
                                    )
                                }
                        </div>

                        {/* about */}
                        <div className='flex flex-col gap-2 lg:w-[48%]'>
                                    <label htmlFor='about' className='label-style'>
                                        About
                                    </label>

                                    <input type='text' name='about' id='about' placeholder='Enter your bio details' style={{boxShadow:'inset 0px -1px 0px rgba(255,255,255,0.18)'}} className='w-full rounded-[0.5rem] bg-richblack-800 p-[12px] text-richblack-5' {...register('about', {required:true})} defaultValue={user?.additionalDetails?.about}/>

                                    {
                                        errors.about && (
                                            <span className="-mt-1 text-[12px] text-yellow-100">
                                                Please enter your About.
                                            </span>
                                        )
                                    }
                        </div>
                </div>
            </div>

            {/* button */}
            <div className='flex justify-end gap-2'>
                
                <button className='cursor-pointer rounded-md bg-richblack-700py-2 px-5 font-semibold text-richblack-50' onClick={() => {
                    navigate('/dashboard/my-profile')
                }}>
                    Cancel
                </button>
                <IconBtn type='submit' text='Save'/>
            </div>


        </form>

    </>
  )
}

export default EditProfile