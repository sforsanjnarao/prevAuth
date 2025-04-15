// src/components/common/ConfirmModal.jsx
import React from 'react';
import Modal from './Modal'; // Import the base modal

function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isConfirming = false // Optional: Show loading state on confirm button
}) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <p className="text-sm text-gray-600 mb-6">{message}</p>

            {/* Modal Actions */}
            <div className="flex justify-end space-x-3">
                <button
                    type="button"
                    onClick={onClose}
                    disabled={isConfirming}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded transition duration-150 ease-in-out disabled:opacity-50"
                >
                    {cancelText}
                </button>
                <button
                    type="button"
                    onClick={onConfirm}
                    disabled={isConfirming}
                    className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isConfirming ? (
                        <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Processing...
                        </span>
                    ) : (
                        confirmText
                    )}
                </button>
            </div>
        </Modal>
    );
}

export default ConfirmModal;