import React, { useState } from 'react'
import { sidebarLinks } from '../../../data/dashboard-links'
import { logout } from '../../../services/operations/authAPI'
import { useDispatch, useSelector } from 'react-redux'
import SidebarLink from './SidebarLink'
import { VscSettingsGear, VscSignOut } from 'react-icons/vsc'
import { useNavigate } from 'react-router-dom'
import ConfirmationModal from '../../common/ConfirmationModal'


const Sidebar = () => {
    const{user, loading:profileLoading} = useSelector((state) => state.profile);

    const{loading:authLoading} = useSelector((state) => state.auth);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    //in starting I don't know what should be shown to the user. Once I click that button, then only I will get to know.
    const[confirmationModal, setConfirmationModal] = useState(null);

    if(profileLoading || authLoading){
        return(
            <div className='grid min-h-[calc(100vh-3.5rem)] place-items-center'>
                <div className='spinner'></div>
            </div>
        )
    }
  return (
    <div>
        <div className='flex h-[calc(100vh-3.5rem)] min-w-[220px] flex-col border-r-[1px] border-r-richblack-700 bg-richblack-800 py-10'>

            <div className='flex flex-col'>
                {
                    sidebarLinks.map((link, index) => {
                        if(link.type && user?.accountType !== link.type) return null;

                        return(
                            <SidebarLink key={link.id} link={link} iconName={link.icon}/>
                        )
                    })
                }

            </div>

            <div className='mx-auto mt-6 mb-6 h-[1px] w-10/12 bg-richblack-600'></div>

            {/* settings and logout */}

            <div className='flex flex-col'>
                <SidebarLink link={{name:'Settings', path:'dashboard/settings'}} iconName='VscSettingsGear'/>

                {/* logout -> onClick it shows a modal so have to make that modal */}

                <button onClick={() => setConfirmationModal(
                    {
                    text1: 'Are You Sure?',
                    text2:'You will be logged out of your account',
                    btn1Text:'Logout',
                    btn2Text:'Cancel',
                    btn1Handler:() => dispatch(logout(navigate)),
                    
                    //onClicking the cancel button, the modal should hide so set the value to null.
                    btn2Handler:() => setConfirmationModal(null),

                }
                )} className='px-8 py-2 text-sm font-medium text-richblack-300'>
                    <div className='flex items-center gap-x-2'>
                        <VscSignOut className='text-lg'/>
                        <span>Logout</span>
                    </div>
                </button>
            </div>

        </div>
        
        {/* when the value is null, the modal will not be visible but onClicking the data of modal will be set and it can be seen. */}
        {confirmationModal && <ConfirmationModal modalData={confirmationModal}/>}
    </div>
  )
}

export default Sidebar