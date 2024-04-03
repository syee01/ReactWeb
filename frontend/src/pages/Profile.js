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
    const [profileData, setProfileData] = useState({ username: '', email: '', role: '', gender: '', age: '', phone: '' });
    const [editingField, setEditingField] = useState(null); // Track which field is being edited
    const userID = localStorage.getItem('userID');
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    useEffect(() => {
        if (userID) {
            fetchUserProfile(userID);
        } else {
            console.error('User ID not found in localStorage');
        }
    }, [userID]);

    const fetchUserProfile = (userID) => {
        axios.get(`http://localhost:8085/userProfile/${userID}`)
            .then(response => {
                setProfileData(response.data);
            })
            .catch(error => console.error("Error fetching user profile:", error));
    };

    const handleEditClick = (fieldName) => {
        setEditingField(fieldName);
    };

    const handleCancelClick = () => {
        setEditingField(null);
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

    const handleSaveClick = async (fieldName) => {
        try {
          const response = await axios.put(`http://localhost:8085/updateUserProfile/${userID}`, {
            [fieldName]: profileData[fieldName]
          });
          console.log(response.data);
          // If update was successful, reset the editing field to null
          setEditingField(null);
        } catch (error) {
          console.error("Error updating user profile:", error);
        }
      };
      

    const handleChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const renderField = (fieldKey, isEditable) => {
        return (
            <div key={fieldKey} className="profile-field">
                <div className="field-title">
                    <strong>{fieldKey.charAt(0).toUpperCase() + fieldKey.slice(1)}</strong>
                </div>
                <div className="field-content">
                    {editingField === fieldKey ? (
                        <>
                            <input
                                type="text"
                                name={fieldKey}
                                value={profileData[fieldKey]}
                                onChange={handleChange}
                            />
                            <FaCheck className="icon save-icon" onClick={() => handleSaveClick(fieldKey)} />
                            <FaTimes className="icon cancel-icon" onClick={handleCancelClick} />
                        </>
                    ) : (
                        <>
                            <span>{profileData[fieldKey]}</span>
                            {isEditable && <FaPencilAlt className="icon edit-icon" onClick={() => handleEditClick(fieldKey)} />}
                        </>
                    )}
                </div>
            </div>
        );
    };
    
    return (
        <div className="page-wrapper">
            <div className="profile-container">
                <div className="avatar-container">
                    <img
                        src={`http://localhost:8085/images/userProfile/${profileData.imageURL}`}
                        alt="Profile"
                        className="avatar"
                        style={{ width: '100px', height: 'auto' }}
                    />
                    <div className="user-info">
                        {renderField('username', true)}
                        {renderField('email', true)}
                        {renderField('role', false)}
                        {renderField('gender', true)}
                        {renderField('age', true)}
                        {renderField('phone', true)}
                    </div>
                    <button onClick={() => setIsPasswordModalOpen(true)} className="change-password-btn">CHANGE PASSWORD</button>
                    <PasswordChangeModal
                        isOpen={isPasswordModalOpen}
                        onClose={() => setIsPasswordModalOpen(false)}
                        onSave={handlePasswordChange}
                    />
                </div>
            </div>
        </div>
    );
};

export default Profile;
