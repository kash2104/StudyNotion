import React from 'react'
import { sidebarLinks } from '../../../data/dashboard-links'
import { logout } from '../../../services/operations/authAPI'
import { useSelector } from 'react-redux'
import SidebarLink from './SidebarLink'
import { VscSettingsGear } from 'react-icons/vsc'


const Sidebar = () => {
    const{user, loading:profileLoading} = useSelector((state) => state.profile);

    const{loading:authLoading} = useSelector((state) => state.auth);

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
            </div>

        </div>

    </div>
  )
}

export default Sidebar