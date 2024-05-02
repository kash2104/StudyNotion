import React from 'react'
import ChangeProfilePicture from './ChangeProfilePicture'

const Settings = () => {
  return (
    <div>
        <h1 className='text-3xl mb-14 font-medium text-richblack-5'>
            Edit Profile
        </h1>

        {/* profile picture change */}
        <ChangeProfilePicture/>
    </div>
  )
}

export default Settings