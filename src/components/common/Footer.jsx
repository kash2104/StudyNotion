import React from 'react'
import Logo from '../../assets/Logo/Logo-Small-Light.png';
import { Link } from 'react-router-dom';
import { FaFacebook, FaGoogle, FaTwitter, FaYoutube } from 'react-icons/fa';
import { FooterLink2 } from '../../data/footer-links';

const Resources = [
  'Articles',
  'Blog',
  'Chart Sheet',
  'Code Challenges',
  'Docs',
  'Projects',
  'Videos',
  'Workspaces',
]

const BottomFooter = ['Privacy Policy', 'Cookie Policy', 'Terms'];

const Footer = () => {
  return (
    <div className='bg-richblack-800'>
      <div className='w-11/12 max-w-maxContent flex lg:flex-row gap-8 items-center justify-between text-richblack-400 mx-auto relative py-14 leading-6'>

        <div className='flex flex-col lg:flex-row pb-5 border-richblack-700 border-b w-[100%]'>
          {/* left section */}
          <div className='flex flex-row flex-wrap lg:w-[50%] justify-between lg:border-r lg:border-richblack-700 pl-3 lg:pr-5 gap-3'>
            {/* first coloumn */}
            <div className='flex flex-col gap-3 w-[30%] lg:w-[30%] mb-7 lg:pl-0'>
              <div className="flex space-x-2 justify-start items-center mb-2">
                <img src={Logo} alt="logo" width={30} height={2} loading="lazy" className='object-contain'/>
                <p className="text-white font-bold text-xl">StudyHub</p>
              </div>

              {/* <img src={Logo} alt='Logo' className='object-contain'/> */}

              <p className='text-[16px] font-semibold text-richblack-50'>Company</p>

              <div className='flex flex-col gap-2'>
                {
                  ['About', 'Careers', 'Affiliates'].map((element, index) => {
                    return (
                      <div className='text-[14px] cursor-pointer hover:text-richblack-50 transition-all duration-200' key={index}>
                        <Link to={element.toLowerCase()}>{element}</Link>
                      </div>
                    )
                  })
                }
              </div>

              <div className='flex flex-row gap-3 text-lg'>
                <FaFacebook/>
                <FaGoogle/>
                <FaTwitter/>
                <FaYoutube/>
              </div>

              <div></div>

            </div>

            {/* second coloumn */}
            <div className='w-[48%] lg:w-[30%] mb-7 lg:pl-0'>

                <p className='text-[16px] font-semibold text-richblack-50'>Resources</p>
                
                <div className='flex flex-col gap-2 mt-2'>
                  {
                    Resources.map((element,index) =>{
                      return(
                        <div className='text-[14px] cursor-pointer hover:text-richblack-50 transition-all duration-200' key={index}>
                          <Link to={element.split(' ').join('-').toLowerCase()}>{element}</Link>
                        </div>
                      )
                    })
                  }
                </div>

                <p className='text-richblack-50 font-semibold text-[16px] mt-7'>Support</p>

                <div className='text-[14px] cursor-pointer hover:text-richblack-50 transition-all duration-200 mt-2'>
                 <Link to={'/help-center'}>Help Center</Link>
                </div>
            </div>

            {/* third coloumn */}
            <div className='w-[48%] lg:w-[30%] mb-7 lg:pl-0'>
                  <p className='text-[16px] font-semibold text-richblack-50'>
                    Plans
                  </p>

                  <div className='flex flex-col gap-2 mt-2'>
                    {
                      ['Paid memberships', 'For students', 'Business solutions'].map((element,index) => {
                        return(
                          <div className='text-[14px] cursor-pointer hover:text-richblack-50 transition-all duration-200' key={index}>
                            <Link to={element.split(' ').join('-').toLowerCase()}>{element}</Link>
                          </div>
                        )
                      })
                    }
                  </div>

                  <p className='text-[16px] font-semibold mt-7 text-richblack-50'>Community</p>

                  <div className='flex flex-col gap-2 mt-2'>
                    {
                      ['Forums', 'Chapters', 'Events'].map((element,index) => {
                        return(
                          <div className='text-[14px] cursor-pointer hover:text-richblack-50 transition-all duration-200'>
                            <Link to={element.split(' ').join('-').toLowerCase()}>{element}</Link>
                          </div>
                        )
                      })
                    }
                  </div>

            </div>

          </div>

          {/* right section */}
          <div className='flex flex-row flex-wrap justify-between pl-3 gap-3 lg:w-[50%] lg:pl-5'>
            {
              FooterLink2.map((element, index) => {
                return(
                  <div key={index} className='w-[48%] lg:w-[30%] mb-7 lg:pl-0'>
                    <p className='title-[16px] font-semibold text-richblack-50'>
                      {element.title}
                    </p>

                    <div className='flex flex-col gap-2 mt-2'>
                      {
                        element.links.map((link, ind) => {
                          return(
                            <div key={ind} className='text-[14px] cursor-pointer hover:text-richblack-50 transition-all duration-200'>
                              <Link to={link.link}>{link.title}</Link>
                            </div>
                          )
                        })
                      }
                    </div>
                  </div>
                )
              })
            }
          </div>
        </div>

      </div>

      {/* bottom most section */}
      <div className='flex flex-row items-center justify-between w-11/12 max-w-maxContent text-richblack-400 mx-auto pb-14 text-sm'>
        <div className='flex justify-between lg:items-start items-center flex-col lg:flex-row gap-3 w-full'>
          <div className='flex flex-row'>
            {
              BottomFooter.map((element, index) => {
                return(
                  <div key={index} className={`${BottomFooter.length - 1 === index ? 'hover:text-richblack-50 cursor-pointer transition-all duration-200' : 'border-r border-richblack-700 cursor-pointer hover:text-richblack-50 transition-all duration-200'} px-3`}>
                    <Link to={element.split(' ').join('-').toLocaleLowerCase()}>{element}</Link>
                  </div>
                )
              })
            }
          </div>

          <div className='text-center select-none'>
            StudyHub
          </div>
        </div>
      </div>

    </div>
  )
}

export default Footer;
