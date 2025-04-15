// src/components/VaultItem.jsx
import React, { useState } from 'react';
import { getDecryptedVaultData, deleteVaultEntry } from '../services/vaultApi'; // Import API functions
import { EyeIcon, EyeSlashIcon, PencilSquareIcon, TrashIcon, LinkIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline'; // Example icons
import { toast } from 'react-toastify'; 
import ConfirmModal from './common/ConfirmModal'
import PasswordPromptModal from './common/PasswordPromptModal';

// Simple reusable Button component (optional, can inline styles)
const ActionButton = ({ onClick, children, className = '', disabled = false, title = '' }) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        title={title}
        className={`p-1 rounded text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
    >
        {children}
    </button>
);

function VaultItem({ entry, onEdit, onDeleteSuccess }) {
    // State for password decryption and visibility
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [decryptedPassword, setDecryptedPassword] = useState('');
    const [isDecrypting, setIsDecrypting] = useState(false);
    const [decryptionError, setDecryptionError] = useState(null);
    const [showConfirmDelete, setShowConfirmDelete] = useState(false); // <--- State for confirm modal
    const [isDeleting, setIsDeleting] = useState(false); 
    const [showPasswordPrompt, setShowPasswordPrompt] = useState(false); 

    // State for copy feedback
    const [copiedField, setCopiedField] = useState(null); // 'username' or 'password'

    // --- Password Handling ---
    const handleShowPasswordRequest = () => {
        if (isPasswordVisible) {
            // If already visible, just hide it
            setIsPasswordVisible(false);
            setDecryptedPassword('');
            setDecryptionError(null);
        } else {
            // Open the prompt modal
            setShowPasswordPrompt(true);
        }
    };

    const handlePasswordSubmit = async (masterPassword) => {
        // Called by PasswordPromptModal when user submits password
        setShowPasswordPrompt(false); // Close prompt modal immediately
        setIsDecrypting(true); // Set loading state for UI feedback (e.g., button)
        setDecryptionError(null);

        try {
            const response = await getDecryptedVaultData(entry._id, masterPassword, 'password');
            if (response.success) {
                setDecryptedPassword(response.decryptedData);
                setIsPasswordVisible(true);
            } else {
                 throw new Error(response.msg || 'Decryption failed');
            }
        } catch (error) {
            console.error('Decryption error:', error);
            const errorMsg = error.message || 'Failed to decrypt. Incorrect Master Password?';
            toast.error(errorMsg);
            setDecryptionError(errorMsg); // Keep inline error if desired
            setIsPasswordVisible(false);
            setDecryptedPassword('');
        } finally {
            setIsDecrypting(false);
        }
    };


    // --- Delete Handling ---
    const handleDeleteRequest = () => {
        // Just open the confirmation modal
        setShowConfirmDelete(true);
    };

    const handleConfirmDelete = async () => {
        // Actual delete logic triggered by the modal's confirm button
        setIsDeleting(true); // Show loading state on confirm button
        try {
            await deleteVaultEntry(entry._id);
            toast.success(`Entry "${entry.appName}" deleted successfully!`);
            setShowConfirmDelete(false); // Close modal on success
            onDeleteSuccess(entry._id); // Notify parent AFTER success
        } catch (error) {
            console.error('Delete error:', error);
            toast.error(error.message || `Failed to delete entry "${entry.appName}".`);
            // Optionally close modal on error too, or leave it open
            // setShowConfirmDelete(false);
        } finally {
            setIsDeleting(false); // Reset loading state
        }
    };


    // --- Copy to Clipboard ---
    const copyToClipboard = (text, fieldName) => {
        navigator.clipboard.writeText(text)
            .then(() => {
                setCopiedField(fieldName);
                toast.info(`${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} copied to clipboard!`, { autoClose: 1500 }); 
                setTimeout(() => setCopiedField(null), 1500); // Hide feedback after 1.5s
            })
            .catch(err => {
                console.error('Failed to copy:', err);
                toast.error('Failed to copy text.'); // Fallback message
            });
    };


    return (
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200 flex flex-col justify-between hover:shadow-md transition-shadow duration-200">
            {/* Header Section */}
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg text-gray-800 break-words mr-2">{entry.appName}</h3>
                {/* Action Buttons */}
                <div className="flex space-x-1 flex-shrink-0">
                    {entry.url && (
                        <a href={entry.url.startsWith('http') ? entry.url : `https://${entry.url}`} target="_blank" rel="noopener noreferrer" title="Go to URL">
                           <ActionButton className="text-blue-500 hover:text-blue-700">
                               <LinkIcon className="h-5 w-5" />
                           </ActionButton>
                        </a>
                    )}
                    <ActionButton onClick={onEdit} title="Edit Entry" className="text-yellow-600 hover:text-yellow-800">
                        <PencilSquareIcon className="h-5 w-5" />
                    </ActionButton>
                    <ActionButton onClick={handleDeleteRequest} title="Delete Entry" className="text-red-500 hover:text-red-700">
                        <TrashIcon className="h-5 w-5" />
                    </ActionButton>
                </div>
            </div>

            {/* Details Section */}
            <div className="space-y-2 mb-3 text-sm">
                {/* Username */}
                <div className="flex items-center justify-between group">
                    <span className="text-gray-500 mr-2">Username:</span>
                    <div className="flex items-center space-x-1">
                        <span className="text-gray-700 font-medium break-all">{entry.username}</span>
                        <ActionButton
                            onClick={() => copyToClipboard(entry.username, 'username')}
                            title="Copy Username"
                            className="opacity-0 group-hover:opacity-100 focus:opacity-100"
                        >
                           {copiedField === 'username' ? <span className="text-xs text-green-600">Copied!</span> : <ClipboardDocumentIcon className="h-4 w-4"/>}
                        </ActionButton>
                    </div>
                </div>

                {/* Password */}
                <div className="flex items-center justify-between group">
                     <span className="text-gray-500 mr-2">Password:</span>
                     <div className="flex items-center space-x-1">
                        <span className={`font-mono ${isPasswordVisible ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                            {isPasswordVisible ? decryptedPassword : '••••••••••'}
                        </span>
                        <ActionButton
                            onClick={handleShowPasswordRequest}
                            disabled={isDecrypting}
                            title={isPasswordVisible ? 'Hide Password' : 'Show Password'}
                        >
                            {isDecrypting ? (
                                <svg className="animate-spin h-4 w-4 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : isPasswordVisible ? (
                                <EyeSlashIcon className="h-4 w-4" />
                            ) : (
                                <EyeIcon className="h-4 w-4" />
                            )}
                        </ActionButton>
                        {isPasswordVisible && (
                            <ActionButton
                                onClick={() => copyToClipboard(decryptedPassword, 'password')}
                                title="Copy Password"
                                className="opacity-0 group-hover:opacity-100 focus:opacity-100"
                            >
                               {copiedField === 'password' ? <span className="text-xs text-green-600">Copied!</span> : <ClipboardDocumentIcon className="h-4 w-4"/>}
                            </ActionButton>
                        )}
                     </div>
                </div>
                 {decryptionError && <p className="text-xs text-red-500 mt-1">{decryptionError}</p>}

             {entry.category && <p className="text-xs text-gray-400 mt-2">Category: {entry.category}</p>}
             <p className="text-xs text-gray-400 mt-1 text-right">
                Last Updated: {new Date(entry.updatedAt).toLocaleDateString()}
            </p>
            </div>
            <ConfirmModal
                isOpen={showConfirmDelete}
                onClose={() => setShowConfirmDelete(false)} // Allow closing modal
                onConfirm={handleConfirmDelete}            // Call actual delete logic
                title="Confirm Deletion"
                message={`Are you sure you want to delete the vault entry for "${entry.appName}"? This action cannot be undone.`}
                confirmText="Delete"
                isConfirming={isDeleting} // Pass loading state
            />
            <PasswordPromptModal
                isOpen={showPasswordPrompt}
                onClose={() => setShowPasswordPrompt(false)}
                onSubmit={handlePasswordSubmit} // Pass the handler
                title={`View Password for "${entry.appName}"`}
                message="Enter your Master Password to view the stored password."
                submitText="View Password"
                isSubmitting={isDecrypting} // Use decrypting state for loading
            />

            {/* Footer Section (Optional: Timestamps, Category) */}

        </div>
    );
}

export default VaultItem;