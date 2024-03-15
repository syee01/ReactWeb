import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "../cssFolder/profile.css";

const Profile = () => {
    const [profileData, setProfileData] = useState({
        username: '',
        profilePic: null, // Assuming this is the path or URL to the image
        newPassword: '',
        confirmNewPassword: ''
    });
    const [editMode, setEditMode] = useState(false);
    const [changePasswordMode, setChangePasswordMode] = useState(false);
    const userID = localStorage.getItem('userID');

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = () => {
        axios.get(`http://localhost:8085/userProfile/${userID}`)
            .then(response => {
                setProfileData(prevData => ({
                    ...prevData,
                    username: response.data.username,
                    profilePic: response.data.profilePic // Adjust according to how your API sends the image path or URL
                }));
            })
            .catch(error => console.error("Error fetching user profile:", error));
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setProfileData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleFileChange = (event) => {
        setProfileData(prevData => ({
            ...prevData,
            profilePic: event.target.files[0] // Assuming file input for image
        }));
    };

    const handleEdit = () => {
        setEditMode(!editMode);
    };

    const handleSave = async () => {
        // Implement the update logic here
        const formData = new FormData();
        formData.append('username', profileData.username);
        formData.append('profilePic', profileData.profilePic); // Assuming file input for image
        // Add more fields as necessary
        try {
            await axios.post(`http://localhost:8085/updateUserProfile/${userID}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setEditMode(false);
            fetchUserProfile(); // Refetch to get updated data
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    };

    const handlePasswordChange = async () => {
        if (profileData.newPassword !== profileData.confirmNewPassword) {
            alert('Passwords do not match!');
            return;
        }
        try {
            await axios.put(`http://localhost:8085/changeUserPassword/${userID}`, {
                userID,
                newPassword: profileData.newPassword
            });
            alert('Password updated successfully');
            setChangePasswordMode(false);
            setProfileData(prevData => ({
                ...prevData,
                newPassword: '',
                confirmNewPassword: ''
            }));
        } catch (error) {
            console.error("Error changing password:", error);
        }
    };

    return (
        <div className="profile-container">
            <div className="avatar-container">
                {profileData.profilePic && <img src={profileData.profilePic} alt="Profile" />}
                {editMode && <input type="file" name="profilePic" onChange={handleFileChange} />}
            </div>
            <div className="username-edit-container">
            {editMode ? (
                <>
                    <input
                        className="input-text"
                        type="text"
                        name="username"
                        value={profileData.username}
                        onChange={handleInputChange}
                    />
                    <button className="btn btn-save" onClick={handleSave}>Save</button>
                    <button className="btn btn-cancel" onClick={handleEdit}>Cancel</button>
                </>
            ) : (
                <>
                    <p>{profileData.username}</p>
                    <button className="btn btn-edit" onClick={handleEdit}>Edit Profile</button>
                </>
            )}
            </div>
            {changePasswordMode ? (
        <div>
            <div className="password-container">
                <input
                    className="input-password"
                    type="password"
                    placeholder="New Password"
                    name="newPassword"
                    value={profileData.newPassword}
                    onChange={handleInputChange}
                />
            </div>
            <div className="password-container">
                <input
                    className="input-password"
                    type="password"
                    placeholder="Confirm New Password"
                    name="confirmNewPassword"
                    value={profileData.confirmNewPassword}
                    onChange={handleInputChange}
                />
            </div>
            <div className="button-container">
                <button className="btn" type="submit" onClick={handlePasswordChange}>Update Password</button>
                <button className="btn" onClick={() => setChangePasswordMode(false)}>Cancel</button>
            </div>
                </div>
            ) : (
                <button className="btn" onClick={() => setChangePasswordMode(true)}>Change Password</button>
            )}
        </div>
    );
};

export default Profile;
