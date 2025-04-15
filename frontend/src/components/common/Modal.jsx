import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';

function Modal({isOpen, onClose, title, children ,widthClass='max-w-md' }) {
    if (!isOpen) return null;

    React.useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        }
    }, []);

    return (
        <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center z-50 transition-opacity duration-300 ease-in-out"
            onClick={onClose} // Close on backdrop click
            aria-modal="true"
            role="dialog"
        >
            {/* Modal Content - stopPropagation prevents closing when clicking inside */}
            <div
                className={`bg-white p-5 md:p-6 rounded-lg shadow-xl w-full ${widthClass} transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-fade-in-scale mx-4`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h3 className="text-lg font-semibold text-gray-800" id="modal-title">
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 focus:outline-none"
                        title="Close"
                        aria-label="Close modal"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="modal-body">
                    {children}
                </div>
            </div>
             {/* Animation style (if not already global) */}
             <style>{`
                @keyframes fade-in-scale {
                    0% { opacity: 0; transform: scale(0.95); }
                    100% { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in-scale { animation: fade-in-scale 0.2s ease-out forwards; }
            `}</style>
        </div>
    );

}

export default Modal;