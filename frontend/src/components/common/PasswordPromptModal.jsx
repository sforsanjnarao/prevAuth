// src/components/common/PasswordPromptModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import Modal from './Modal'; // Import the base modal

function PasswordPromptModal({
    isOpen,
    onClose,
    onSubmit, // Function to call with the entered password
    title = 'Master Password Required',
    message = 'Please enter your Master Password to proceed.',
    submitText = 'Submit',
    cancelText = 'Cancel',
    isSubmitting = false // Optional: Show loading state on submit button
}) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const passwordInputRef = useRef(null); // To focus input on open

    // Clear state when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setPassword('');
            setError('');
            // Focus the input field shortly after the modal opens
            setTimeout(() => {
                passwordInputRef.current?.focus();
            }, 100); // Small delay for CSS transition
        }
    }, [isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault(); // Prevent default form submission
        if (!password) {
            setError('Master Password cannot be empty.');
            return;
        }
        setError('');
        onSubmit(password); // Pass the password to the onSubmit handler
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        if (error) {
            setError(''); // Clear error when user types
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <form onSubmit={handleSubmit}>
                <p className="text-sm text-gray-600 mb-4">{message}</p>

                <div className="mb-4">
                    <label htmlFor="masterPasswordInput" className="sr-only">Master Password</label>
                    <input
                        ref={passwordInputRef}
                        type="password"
                        id="masterPasswordInput"
                        value={password}
                        onChange={handlePasswordChange}
                        placeholder="Enter Master Password"
                        className={`block w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                        autoComplete="current-password" // Hint for password managers
                        required
                        disabled={isSubmitting}
                    />
                    {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
                </div>

                {/* Modal Actions */}
                <div className="flex justify-end space-x-3 pt-3 border-t">
                    <button
                        type="button" // Important: type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded transition duration-150 ease-in-out disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting || !password} // Also disable if password empty
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                         {isSubmitting ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                Processing...
                            </span>
                        ) : (
                            submitText
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

export default PasswordPromptModal;