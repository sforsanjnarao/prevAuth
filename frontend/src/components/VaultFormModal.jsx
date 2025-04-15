// src/components/VaultFormModal.jsx
import React, { useState, useEffect } from 'react';
import { addVaultEntry, updateVaultEntry } from '../api/vaultApi'; // Import API functions
import { XMarkIcon } from '@heroicons/react/24/solid'; // Icon for close button
import { toast } from 'react-toastify';
import PasswordPromptModal from './common/PasswordPromptModal';  

// Simple Input Component (Optional - Can inline styles)
const InputField = ({ label, id, type = 'text', value, onChange, placeholder = '', required = false, autoComplete = "off", ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            type={type}
            id={id}
            name={id} // Ensure name matches id for easy state updates
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            autoComplete={autoComplete}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            {...props}
        />
    </div>
);

// Simple Textarea Component (Optional)
const TextareaField = ({ label, id, value, onChange, placeholder = '', rows = 3, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
        </label>
        <textarea
            id={id}
            name={id}
            rows={rows}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            {...props}
        />
    </div>
);


function VaultFormModal({ entryToEdit, onClose, onSaveSuccess }) {
    const isEditing = Boolean(entryToEdit);
    const initialFormData = {
        appName: '',
        username: '',
        vaultPassword: '', // Plaintext input
        url: '',
        vaultNotes: '',    // Plaintext input
        category: '',
    };

    const [formData, setFormData] = useState(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
    const [payloadToSubmit, setPayloadToSubmit] = useState(null); 

    // Effect to populate form when editing
    useEffect(() => {
        if (isEditing && entryToEdit) {
            setFormData({
                appName: entryToEdit.appName || '',
                username: entryToEdit.username || '',
                url: entryToEdit.url || '',
                category: entryToEdit.category || '',
                vaultPassword: '', // Always clear password on edit form load for security
                vaultNotes: '',    // Clear notes too, user must re-enter if changing
            });
        } else {
            // Reset form when adding or modal is reopened for add
            setFormData(initialFormData);
        }
        // Clear errors when mode changes
        setError(null);

        // IMPORTANT: Disable linting rule exhaustive-deps if needed,
        // as including initialFormData might cause infinite loop if not stable.
        // Or, define initialFormData outside the component.
    }, [entryToEdit, isEditing]); // Rerun when the entry to edit changes

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError(null); // Clear error on new input
    };

    const handleFormSubmitRequest = async (e) => {
        e.preventDefault();
        setError(null);
        // ... (Basic Client-Side Validation - use toast or setError) ...
         if (!formData.appName || !formData.username) {
             toast.warn("Application name and username are required."); return;
         }
         if (!isEditing && !formData.vaultPassword) {
              toast.warn("Password is required for new entries."); return;
         }

        const requiresMasterPassword = !isEditing || formData.vaultPassword || formData.vaultNotes;

        // Prepare payload *before* asking for password
        const preparedPayload = {
            appName: formData.appName,
            username: formData.username,
            url: formData.url || '',
            category: formData.category || '',
             // Include vaultPassword/vaultNotes ONLY if they have values
             // The masterPassword will be added later if needed
            ...(formData.vaultPassword && { vaultPassword: formData.vaultPassword }),
            ...(formData.vaultNotes !== undefined && isEditing ? { vaultNotes: formData.vaultNotes } : {}),
            ...(!isEditing && formData.vaultNotes ? { vaultNotes: formData.vaultNotes } : {})
        };

        setPayloadToSubmit(preparedPayload); // Store the payload

        if (requiresMasterPassword) {
            // Open the password prompt instead of calling API directly
            setShowPasswordPrompt(true);
        } else {
            // If no master password needed (e.g., editing only metadata), submit directly
            await submitData(preparedPayload);
        }
    };

    const handlePasswordSubmit = async (masterPassword) => {
        // Called by PasswordPromptModal onSubmit
        setShowPasswordPrompt(false); // Close prompt
        if (!payloadToSubmit) return; // Should not happen

        // Add masterPassword to the stored payload
        const finalPayload = {
            ...payloadToSubmit,
            masterPassword: masterPassword,
        };
        await submitData(finalPayload); // Call the actual API submission logic
    };

    const submitData = async (payload) => {
        setIsSubmitting(true);
        setError(null);
         try {
            let successMsg = '';
            if (isEditing) {
                await updateVaultEntry(entryToEdit._id, payload);
                successMsg = `Entry "${payload.appName}" updated successfully!`;
            } else {
                await addVaultEntry(payload);
                successMsg = `Entry "${payload.appName}" added successfully!`;
            }
            toast.success(successMsg);
            onSaveSuccess();

        } catch (apiError) {
            console.error("Save/Update Error:", apiError);
            toast.error(apiError.message || `Failed to ${isEditing ? 'update' : 'save'} entry.`);
            // Optionally set inline error: setError(apiError.message);
        } finally {
            setIsSubmitting(false);
            setPayloadToSubmit(null); // Clear temporary payload
        }
    };


    return (
        <>
        // Modal backdrop and positioning
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center z-50 transition-opacity duration-300 ease-in-out">
            {/* Modal Content */}
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-fade-in-scale"> {/* Simple animation */}

                {/* Modal Header */}
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h2 className="text-xl font-semibold text-gray-800">{isEditing ? 'Edit Vault Entry' : 'Add New Vault Entry'}</h2>
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="text-gray-400 hover:text-gray-600 focus:outline-none disabled:opacity-50"
                        title="Close"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleFormSubmitRequest} className="space-y-4">
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm" role="alert">
                            {error}
                        </div>
                    )}

                    <InputField
                        label="Application Name"
                        id="appName"
                        value={formData.appName}
                        onChange={handleChange}
                        placeholder="e.g., Google, My Bank"
                        required
                        disabled={isSubmitting}
                    />
                    <InputField
                        label="Username / Email"
                        id="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="user@example.com"
                        required
                        disabled={isSubmitting}
                    />
                    <InputField
                        label="Password"
                        id="vaultPassword"
                        type="password" // Use password type
                        value={formData.vaultPassword}
                        onChange={handleChange}
                        placeholder={isEditing ? "Enter new password (leave blank to keep current)" : "Enter password"}
                        required={!isEditing} // Only required when adding
                        autoComplete="new-password" // Helps password managers
                        disabled={isSubmitting}
                    />
                     <InputField
                        label="Website URL"
                        id="url"
                        type="url" // Use url type
                        value={formData.url}
                        onChange={handleChange}
                        placeholder="https://example.com (Optional)"
                        disabled={isSubmitting}
                    />
                    <TextareaField
                        label="Secure Notes"
                        id="vaultNotes"
                        value={formData.vaultNotes}
                        onChange={handleChange}
                        placeholder="(Optional) e.g., Security questions, recovery codes"
                        disabled={isSubmitting}
                    />
                    <InputField
                        label="Category"
                        id="category"
                        value={formData.category}
                        onChange={handleChange}
                        placeholder="e.g., Work, Social, Finance (Optional)"
                        disabled={isSubmitting}
                    />

                    {/* Form Actions */}
                    <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
                        <button
                            type="button" // Important: type="button" to prevent form submission
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded transition duration-150 ease-in-out disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Saving...
                                </span>
                            ) : (isEditing ? 'Update Entry' : 'Add Entry')}
                        </button>
                    </div>
                </form>
            </div>
            {/* Basic CSS for animation - add to your main CSS file or a style block */}
            <style>{`
                @keyframes fade-in-scale {
                    0% { opacity: 0; transform: scale(0.95); }
                    100% { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in-scale { animation: fade-in-scale 0.2s ease-out forwards; }
            `}</style>
        </div>
        {/* --- Render Password Prompt Modal --- */}
        <PasswordPromptModal
                 isOpen={showPasswordPrompt}
                 onClose={() => {
                     setShowPasswordPrompt(false);
                     setPayloadToSubmit(null); // Clear payload if user cancels password prompt
                 }}
                 onSubmit={handlePasswordSubmit}
                 title={`Confirm ${isEditing ? 'Update' : 'Save'}`}
                 message={`Enter your Master Password to ${isEditing ? 'update' : 'save'} the entry for "${payloadToSubmit?.appName || ''}".`}
                 submitText={isEditing ? 'Update Entry' : 'Add Entry'}
                 isSubmitting={isSubmitting} // Show loading state if main form is submitting
             />

        </>
    );
}

export default VaultFormModal;