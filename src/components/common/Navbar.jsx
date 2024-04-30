import React, { useEffect, useState } from 'react'
import { Link, matchPath } from 'react-router-dom'
import logo from '../../assets/Logo/Logo-Full-Light.png'
import { NavbarLinks } from '../../data/navbar-links'
import { useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {AiOutlineShoppingCart} from 'react-icons/ai'
import { apiConnector } from '../../services/apiconnector'
import { categories } from '../../services/apis'
import { IoIosArrowDropdownCircle  } from "react-icons/io"
import ProfileDropDown from '../core/Auth/ProfileDropDown'


const subLinks = [
    {
        title:'Python',
        link:'/catalog/python',
    },
    {
        title:'Web Development',
        link:'/catalog/web-development'
    }
]

export const Navbar = () => {
    console.log('printing base url: ',process.env.REACT_APP_BASE_URL);
    //jo bhi user logged in hai and voh koi bhi data chahiye frontend me assuming ki hume backend se data mil rha hai, toh have to do state management and use redux slices

    const location = useLocation();
    const matchRoute = (route) => {
        return matchPath({path:route}, location.pathname);
    }
    
    //here in state.auth, auth is the slice name
    const {token} = useSelector((state) => state.auth);
    const {user} = useSelector((state) => state.profile);
    const {totalItems} = useSelector((state) => state.cart);

    //api calling with help of useEffect
    // const {subLinks, setSubLinks} = useState([]);

    // const fetchSubLinks = async() => {
    //         try {
    //             const result = await apiConnector('GET', categories.CATEGORIES_API);
    //             console.log('printing sublinks:', result);
    //             setSubLinks(result.data.data);
    //         }
    //         catch (error) {
    //             console.log('Could not fetch the category list');
    //         }
    // }

    // useEffect(() => {
    //     fetchSubLinks();
    // },[]);


  return (
    <div className='flex h-14 items-center justify-center border-b-[1px] border-b-richblack-700'>
        <div className='flex w-11/12 max-w-maxContent items-center justify-between'>
            <Link to={'/'}>
                <img src={logo} alt='logo' width={160} height={42} loading='lazy'/>
            </Link>

            <nav>
                <ul className='flex flex-row gap-x-6 text-richblack-25'>
                    {
                        NavbarLinks.map((link, index) => {
                            return(
                                <li key={index}>
                                    {
                                        link.title === 'Catalog' ? 
                                        (
                                            <div className={`flex items-center gap-2 group relative cursor-pointer ${matchRoute('/catalog/:catalogName') ? 'text-yellow-25':'text-richblack-25'}`}>
                                                <p>
                                                    {link.title}
                                                </p>
                                                <IoIosArrowDropdownCircle  />

                                                <div className='invisible absolute left-[50%] translate-x-[-50%] translate-y-[80%] top-[50%] flex flex-col rounded-md bg-richblack-5 p-4 text-richblack-900 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100 lg:w-[300px] z-[100]'>

                                                    <div className='absolute left-[50%] top-0 h-6 w-6 rotate-45 rounded bg-richblack-5 translate-y-[-40%] translate-x-[80%]'>

                                                    </div>

                                                    {
                                                        subLinks.length ? 
                                                        (
                                                            subLinks.map((subLink, index) => {
                                                                return(
                                                                    <Link to={`${subLink.link}`} key={index}>
                                                                        <p>
                                                                            {subLink.title}
                                                                        </p>
                                                                    </Link>
                                                                )
                                                            })
                                                        ) : 
                                                        (<div></div>)
                                                    }
                                                </div>

                                            </div>
                                        ) : 
                                        (
                                            <Link to={link?.path}>
                                                <p className={`${matchRoute(link?.path) ? 'text-yellow-25' : 'text-richblack-25'}`}>
                                                    {link.title}
                                                </p>
                                            </Link>
                                        )
                                    }
                                </li>

                            )
                        })
                    }
                </ul>
            </nav>

            {/* login/signup/dashboard */}
            <div className='flex flex-row gap-x-4 items-center'>
                
                {//need to add styling
                    user && user?.accountType !== 'Instructor' && (
                        <Link to={'/dashboard/cart'} className='relative'>
                            <AiOutlineShoppingCart/>
                            {
                                totalItems > 0 && (
                                    <span>
                                        {totalItems}
                                    </span>
                                )
                            }
                        </Link>
                    )
                }

                {
                    token === null && (
                        <Link to={'/login'}>
                            <button className='border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] text-richblack-100 rounded-md'>
                                Log in
                            </button>
                        </Link>
                    )
                }

                {
                    token === null && (
                        <Link to={'/signup'}>
                            <button className='border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] text-richblack-100 rounded-md'>
                                Sign Up
                            </button>
                        </Link>
                    )
                }

                {
                    token !== null && <ProfileDropDown/>
                }

            </div>
        </div>
    </div>
  )
}
