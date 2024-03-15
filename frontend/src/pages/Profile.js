import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Basic structure for the profile component
const Profile = () => {
  const [profileData, setProfileData] = useState({
    username: '',
    profilePic: null,
  });
  const [editMode, setEditMode] = useState(false);
  const userID = "userID"; // Fetch from context, local storage, etc.

  useEffect(() => {
    // Fetch profile data from the backend
    axios.get(`http://localhost:8085/userProfile/${userID}`)
      .then(response => {
        setProfileData(response.data);
      })
      .catch(error => console.error('There was an error!', error));
  }, [userID]);

  // Handle profile update
  const handleUpdateProfile = (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('username', profileData.username);
    formData.append('userID', userID);

    if (profileData.profilePic) {
      formData.append('profilePic', profileData.profilePic);
    }

    axios.post('http://localhost:8085/updateUserProfile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    .then(() => {
      console.log('Profile updated successfully!');
      setEditMode(false);
    })
    .catch(error => console.error('There was an error!', error));
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setProfileData(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setProfileData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div>
      {editMode ? (
        <form onSubmit={handleUpdateProfile}>
          <input
            type="text"
            name="username"
            value={profileData.username}
            onChange={handleChange}
          />
          <input
            type="file"
            name="profilePic"
            onChange={handleChange}
          />
          <button type="submit">Save Changes</button>
        </form>
      ) : (
        <>
          <p>{profileData.username}</p>
          {profileData.profilePic && <img src={profileData.profilePic} alt="Profile" />}
          <button onClick={() => setEditMode(true)}>Edit Profile</button>
        </>
      )}
    </div>
  );
};

export default Profile;
