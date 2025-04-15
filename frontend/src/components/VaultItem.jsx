// src/components/VaultItem.jsx
import React, { useState } from 'react';
import { getDecryptedVaultData, deleteVaultEntry } from '../services/vaultApi'; // Import API functions
import { EyeIcon, EyeSlashIcon, PencilSquareIcon, TrashIcon, LinkIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline'; // Example icons

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

    // State for copy feedback
    const [copiedField, setCopiedField] = useState(null); // 'username' or 'password'

    // --- Password Handling ---
    const handleTogglePassword = async () => {
        if (isPasswordVisible) {
            setIsPasswordVisible(false);
            setDecryptedPassword('');
            setDecryptionError(null);
            return;
        }

        // Replace window.prompt with a secure modal later
        const masterPassword = window.prompt(
            `Enter Master Password to view password for "${entry.appName}":`
        );
        if (!masterPassword) return; // User cancelled

        setIsDecrypting(true);
        setDecryptionError(null);
        try {
            const response = await getDecryptedVaultData(entry._id, masterPassword, 'password');
            if (response.success) {
                setDecryptedPassword(response.decryptedData);
                setIsPasswordVisible(true);
            } else {
                // Should be caught by the catch block, but handle just in case
                throw new Error(response.msg || 'Decryption failed');
            }
        } catch (error) {
            console.error('Decryption error:', error);
            setDecryptionError(error.message || 'Failed to decrypt. Incorrect Master Password?');
            setIsPasswordVisible(false);
            setDecryptedPassword('');
        } finally {
            setIsDecrypting(false);
        }
    };

    // --- Delete Handling ---
    const handleDeleteClick = async () => {
        if (window.confirm(`Are you sure you want to delete the entry for "${entry.appName}"?`)) {
            try {
                await deleteVaultEntry(entry._id);
                onDeleteSuccess(entry._id); // Notify parent to remove from list
                // Optionally show a success toast message here
            } catch (error) {
                console.error('Delete error:', error);
                // Show an error toast message here
                window.alert(`Failed to delete entry: ${error.message}`); // Simple alert for now
            }
        }
    };

    // --- Copy to Clipboard ---
    const copyToClipboard = (text, fieldName) => {
        navigator.clipboard.writeText(text)
            .then(() => {
                setCopiedField(fieldName);
                setTimeout(() => setCopiedField(null), 1500); // Hide feedback after 1.5s
            })
            .catch(err => {
                console.error('Failed to copy:', err);
                window.alert('Failed to copy text.'); // Fallback message
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
                    <ActionButton onClick={handleDeleteClick} title="Delete Entry" className="text-red-500 hover:text-red-700">
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
                            onClick={handleTogglePassword}
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
            </div>

            {/* Footer Section (Optional: Timestamps, Category) */}
             {entry.category && <p className="text-xs text-gray-400 mt-2">Category: {entry.category}</p>}
             <p className="text-xs text-gray-400 mt-1 text-right">
                Last Updated: {new Date(entry.updatedAt).toLocaleDateString()}
            </p>

        </div>
    );
}

export default VaultItem;