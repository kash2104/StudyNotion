import React from 'react'
import Footer from '../components/common/Footer'
import ContactDetails from '../components/ContactPage/ContactDetails'
import ContactForm from '../components/ContactPage/ContactForm'

const Contact = () => {
  return (
    <div>
        <div className='flex mx-auto mt-20 w-11/12 max-w-maxContent flex-col justify-between gap-10 text-white lg:flex-row'>
            {/* left part */}
            <div className='lg:w-[40%]'>
                <ContactDetails/>
            </div>

            {/* right part */}
            <div className='lg:w-[60%]'>
                <ContactForm/>
            </div>
        </div>

        {/* review slider  */}
        <div>
            <h1 className='text-center text-4xl font-semibold mt-8 text-white'>Reviews from other learners</h1>

            {/* ReviewSlider */}
        </div>

        <Footer/>

    </div>
  )
}

export default Contact