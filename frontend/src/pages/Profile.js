import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "../cssFolder/profile.css";
import { FaPencilAlt, FaCheck, FaTimes } from 'react-icons/fa';

const PasswordChangeModal = ({ isOpen, onClose, onSave }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setNewPassword('');
            setConfirmPassword('');
        }
    }, [isOpen]);
  
    const handleSave = () => {
        if (newPassword === confirmPassword) {
            onSave(newPassword);
            setNewPassword('');
            setConfirmPassword('');
        } else {
            alert("Passwords don't match!");
        }
    };

    if (!isOpen) return null;
  
    return (
      <div className="modal1">
        <div className="modal1-content">
          <span className="close1" onClick={onClose}>&times;</span>
          <h2 className="changePasswordTitle">Change New Password</h2>
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button className='passwordBtn' onClick={handleSave}>Confirm</button>
        </div>
      </div>
    );
  };

  const Profile = () => {
    const [profileData, setProfileData] = useState({
        username: '', email: '', role: '', gender: '', age: '', phone: ''
    });
    const [editedData, setEditedData] = useState({});
    const userID = localStorage.getItem('userID');
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    useEffect(() => {
        if (userID) {
            fetchUserProfile(userID);
        }
    }, [userID]);

    const fetchUserProfile = (userID) => {
        axios.get(`http://localhost:8085/userProfile/${userID}`)
            .then(response => {
                setProfileData(response.data);
                setEditedData(response.data); // Initialize edited data with fetched data
            })
            .catch(error => console.error("Error fetching user profile:", error));
    };

    const handleChange = (e) => {
        setEditedData({ ...editedData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (newPassword) => {
        // Call the API to update the password in the database
        axios.put(`http://localhost:8085/changePassword/${userID}`, {
            newPassword
        })
        .then(response => {
            alert('Password updated successfully!'); // Show success alert
            setIsPasswordModalOpen(false); // Close the modal on success
        })
        .catch(error => {
            console.error("Error updating password:", error);
        });
    };

    const handleSaveChanges = async () => {
        try {
            const response = await axios.put(`http://localhost:8085/updateUserProfile/${userID}`, editedData);
            setProfileData(editedData); // Update the displayed data
            alert('Profile updated successfully!');
        } catch (error) {
            console.error("Error updating user profile:", error);
        }
    };


    const renderField = (fieldKey, label, isEditable) => (
        <div className="field-row">
            <label>{label}</label>
            <input
                type="text"
                name={fieldKey}
                value={editedData[fieldKey] || ''}
                onChange={handleChange}
                readOnly={!isEditable}
                style={!isEditable ? { backgroundColor: '#f3f3f3', color: '#ccc' } : {}}
            />
        </div>
    );

    return (
        <div className="profile-container">
        <h1 className="profile-header">Profile</h1>
            <div className="profileHeader">
            <img
                src={`http://localhost:8085/images/userProfile/${profileData.imageURL}`}
                alt="Profile"
                className="avatar"
                style={{ width: '100px', height: 'auto' }}
            />
            </div>
            <div className="profile-fields">
                {renderField('username', 'Username', true)}
                {renderField('email', 'Email', true)}
                {renderField('role', 'Role', false)}
                {renderField('gender', 'Gender', false)}
                {renderField('age', 'Age', true)}
                {renderField('phone', 'Phone Number', true)}
            </div>
            <div className="save-changes">
                <button className="save-changes-btn" onClick={handleSaveChanges}>Save Changes</button>
                <button onClick={() => setIsPasswordModalOpen(true)} className="change-password-btn">Change Password</button>
            </div>
            <PasswordChangeModal
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
                onSave={handlePasswordChange}
            />
        </div>
    );
};



export default Profile;
