import React from 'react'
import { useSelector } from 'react-redux'
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/core/Dashboard/Sidebar';

const Dashboard = () => {
    const{loading: authLoading} = useSelector((state) => state.auth)
    const{loading: profileLoading} = useSelector((state) => state.profile);

    if(profileLoading || authLoading){
        return(
            <div className='grid min-h-[calc(100vh-3.5rem)] place-items-center'>
                <div className='spinner'></div>
            </div>
        )
    }
  return (
    <div className='relative flex min-h-[calc(100vh-3.5rem)]'>
        <Sidebar/>

        <div className='h-[calc(100vh-3.5rem)] flex-1 overflow-auto'>

            <div className='mx-auto w-11/12 max-w-[1000px] py-10'>
                {/* pata nhi hai ki kya render karna hai toh used Outlet. Is used for nested routes to render children routes within the parent routes i.e.dashboard/my-profile, dashboard/my-cart, etc. Acts as a placeholder for rendering the child component */}
                <Outlet/>

            </div>

        </div>
    </div>
  )
}

export default Dashboard