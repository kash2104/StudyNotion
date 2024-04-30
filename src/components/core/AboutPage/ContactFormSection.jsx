import React from 'react'
import ContactUsForm from '../../ContactPage/ContactUsForm'

const ContactFormSection = () => {
  return (
    <div className='mx-auto'>
        <h1 className='text-center text-4xl font-semibold'>Get in touch</h1>
        <p className='text-center text-richblack-300 mt-3'>We would love to here from you. Pleae fill out this form.</p>

        <div className='mt-12 mx-auto'>
            <ContactUsForm/>
        </div>
    </div>
  )
}

export default ContactFormSection