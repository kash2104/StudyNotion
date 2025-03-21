import React from 'react'
import { IoMdChatboxes } from "react-icons/io";
import { PiGlobeHemisphereWestFill } from "react-icons/pi";
import { FcCallback } from "react-icons/fc";

const contactDetails = [
    {
        heading:'Chat on us',
        description: 'Our friendly team is here to help',
        details:'info@studyhub.com'
    },
    {
        heading:'Visit Us',
        description: 'Come and say hello to our office HQ',
        details:'Akshay Nagar 1st block, Hanuman Circle, Noida-560078'
    },
    {
        heading:'Call Us',
        description: 'Mon-Fri from 8am to 5pm',
        details:'+91-9674580781'
    }
]
const ContactDetails = () => {
  return (
    <div className='flex flex-col gap-6 rounded-xl bg-richblack-800 p-4 lg:p-6'>
        {
            contactDetails.map((element, index) => {
                return (
                    <div className='flex flex-col gap-[2px] p-3 text-sm text-richblack-200' key={index}>

                        <div className='flex flex-row items-center gap-3'>
                            {
                                index === 0 ? (
                                    <IoMdChatboxes size={25}/>
                                ):(
                                    index === 1 ? (<PiGlobeHemisphereWestFill size={25}/>):(<FcCallback size={25}/>)
                                )
                            }
                            <h1 className='text-lg font-semibold text-richblack-5'>{element?.heading}</h1>
                        </div>

                        <p className='font-medium'>{element?.description}</p>

                        <p className='font-semibold'>{element?.details}</p>

                    </div>
                )
            })
        }
    </div>
  )
}

export default ContactDetails