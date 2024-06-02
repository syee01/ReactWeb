import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaEdit } from 'react-icons/fa';
import "../cssFolder/profile.css";

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

  const ImageUploadModal = ({ isOpen, onClose, onSave }) => {
    const [file, setFile] = useState(null);

    const onDragOver = useCallback((event) => {
        event.preventDefault(); // Prevent default behavior (Prevent file from being opened)
    }, []);

    const onDrop = useCallback((event) => {
        event.preventDefault();
        if (event.dataTransfer.files && event.dataTransfer.files[0]) {
            const file = event.dataTransfer.files[0];
            setFile(file);
        }
    }, []);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setFile(file);
        }
    };

    const handleFileUpload = () => {
        if (file) {
            const formData = new FormData();
            formData.append('image', file);
            onSave(formData);
        }
    };

    const handleRemoveFile = () => {
        setFile(null);
    };

    if (!isOpen) return null;

    return (
        <div className="modal2">
            <div className="modal-content2">
                <span className="close2" onClick={onClose}>&times;</span>
                <h2 className="changePasswordTitle">Upload Profile Picture</h2>
                <div className="drop-area" onClick={() => document.querySelector('input[type="file"]').click()}>
                    <p>Drag & drop images, or click to browse</p>
                    <input type="file" accept=".jpg, .png" onChange={handleFileChange} style={{ display: 'none' }} />
                </div>
                {file && <div className="file-details">
                    <p>{file.name}</p>
                    <span className="remove-file" onClick={handleRemoveFile}>&times;</span>
                </div>}
                <button className='passwordBtn' onClick={handleFileUpload}>Upload</button>
            </div>
        </div>
    );
};

const Profile = () => {
    const [profileData, setProfileData] = useState({
        username: '', email: '', role: '', gender: '', age: '', phone: '', imageURL: ''
    });
    const [editedData, setEditedData] = useState({});
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const userID = localStorage.getItem('userID');

    useEffect(() => {
        if (userID) {
            fetchUserProfile();
        }
    }, [userID]);

    const fetchUserProfile = () => {
        axios.get(`http://localhost:8085/userProfile/${userID}`)
            .then(response => {
                setProfileData(response.data);
                setEditedData(response.data);
            })
            .catch(error => console.error("Error fetching user profile:", error));
    };

    const handleSaveChanges = async () => {
        try {
            const response = await axios.put(`http://localhost:8085/updateUserProfile/${userID}`, editedData);
            setProfileData(editedData);
            alert('Profile updated successfully!');
        } catch (error) {
            console.error("Error updating user profile:", error);
        }
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

    const handleImageSave = async (formData) => {
        try {
            const response = await axios.post(`http://localhost:8085/uploadProfileImage/${userID}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setProfileData({...profileData, imageURL: response.data.imageURL});
            alert('Profile image updated successfully!');
            setIsImageModalOpen(false);
        } catch (error) {
            console.error("Error updating profile image:", error);
        }
    };

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
                <FaEdit onClick={() => setIsImageModalOpen(true)} style={{ cursor: 'pointer' }} className='editIcon1'/>
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
              <ImageUploadModal
                isOpen={isImageModalOpen}
                onClose={() => setIsImageModalOpen(false)}
                onSave={handleImageSave}
            />
        </div>
    );
};

export default Profile;
