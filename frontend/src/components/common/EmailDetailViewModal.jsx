// src/components/common/EmailDetailViewModal.jsx
import React, { useState, useEffect } from 'react';
import Modal from './Modal'; // Import the base Modal component
import { getEmailDetail } from '../../api/fakeDataApi'; // Adjust path if needed
import { toast } from 'react-toastify';
import DOMPurify from 'dompurify'; // For sanitizing HTML before rendering

function EmailDetailViewModal({ isOpen, onClose, fakeDataId, messageId }) {
    const [emailDetails, setEmailDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showHtml, setShowHtml] = useState(true); // Toggle between HTML/Text view

    useEffect(() => {
        // Fetch details only when the modal is open and messageId is valid
        if (isOpen && messageId && fakeDataId) {
            const fetchDetails = async () => {
                setIsLoading(true);
                setError(null);
                setEmailDetails(null); // Clear previous details
                try {
                    const response = await getEmailDetail(fakeDataId, messageId);
                    if (response.success && response.message) {
                        setEmailDetails(response.message);
                        // Default to showing HTML if available, otherwise show text
                        setShowHtml(!!response.message.htmlBody);
                    } else {
                        throw new Error(response.msg || 'Failed to load email details.');
                    }
                } catch (err) {
                    setError(err.message || 'Could not fetch email details.');
                    toast.error(err.message || 'Could not fetch email details.');
                } finally {
                    setIsLoading(false);
                }
            };
            fetchDetails();
        } else {
            // Reset when modal is closed or IDs are invalid
            setEmailDetails(null);
            setError(null);
            setIsLoading(false);
        }
    }, [isOpen, fakeDataId, messageId]); // Re-fetch if any of these change while open

    // Sanitize HTML content before rendering
    const createMarkup = (htmlContent) => {
        // Configure DOMPurify if needed (e.g., allow certain tags/attributes)
        return { __html: DOMPurify.sanitize(htmlContent) };
    };

    const formattedDate = emailDetails?.createdAt ? new Date(emailDetails.createdAt).toLocaleString() : 'N/A';

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isLoading ? 'Loading Email...' : (emailDetails?.subject || '(no subject)')}
            widthClass="max-w-3xl" // Make modal wider for email content
        >
            {/* Loading State */}
            {isLoading && (
                <div className="text-center py-10">
                    <p className="text-gray-500">Loading email content...</p>
                    {/* Optional: Add spinner */}
                </div>
            )}

            {/* Error State */}
            {!isLoading && error && (
                 <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
                    <strong className="font-bold">Error:</strong>
                    <span className="block sm:inline"> {error}</span>
                </div>
            )}

            {/* Email Details */}
            {!isLoading && !error && emailDetails && (
                <div className="text-sm">
                    {/* Header Info */}
                    <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-700 space-y-1">
                        <p><strong>From:</strong> {emailDetails.from?.name ? `${emailDetails.from.name} <${emailDetails.from.address}>` : emailDetails.from?.address}</p>
                        <p><strong>To:</strong> {emailDetails.to?.map(t => t.address).join(', ')}</p>
                        {emailDetails.cc?.length > 0 && <p><strong>Cc:</strong> {emailDetails.cc.join(', ')}</p>}
                        {emailDetails.bcc?.length > 0 && <p><strong>Bcc:</strong> {emailDetails.bcc.join(', ')}</p>}
                        <p><strong>Date:</strong> {formattedDate}</p>
                        <p><strong>Subject:</strong> {emailDetails.subject || '(no subject)'}</p>
                    </div>

                    {/* View Toggle (if both HTML and Text exist) */}
                    {emailDetails.htmlBody && emailDetails.textBody && (
                        <div className="mb-2 text-right">
                            <button
                                onClick={() => setShowHtml(true)}
                                disabled={showHtml}
                                className={`px-2 py-1 text-xs rounded mr-1 ${showHtml ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                            >
                                HTML View
                            </button>
                            <button
                                onClick={() => setShowHtml(false)}
                                disabled={!showHtml}
                                className={`px-2 py-1 text-xs rounded ${!showHtml ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                            >
                                Text View
                            </button>
                        </div>
                    )}

                    {/* Email Body */}
                    <div className="border border-gray-300 rounded-md p-4 bg-white max-h-[60vh] overflow-y-auto">
                        {showHtml && emailDetails.htmlBody ? (
                            // Render sanitized HTML
                            <div dangerouslySetInnerHTML={createMarkup(emailDetails.htmlBody)} />
                        ) : emailDetails.textBody ? (
                            // Render plain text (preserve whitespace and newlines)
                            <pre className="whitespace-pre-wrap break-words font-sans">
                                {emailDetails.textBody}
                            </pre>
                        ) : (
                            <p className="text-gray-500 italic">(No viewable body content)</p>
                        )}
                    </div>

                     {/* Attachments Info (Optional) */}
                    {emailDetails.attachments && emailDetails.attachments.length > 0 && (
                        <div className="mt-4 border-t pt-3">
                            <h4 className="font-semibold mb-1 text-gray-600">Attachments ({emailDetails.attachments.length}):</h4>
                             <ul className="list-disc list-inside text-gray-700">
                                {emailDetails.attachments.map(att => (
                                    <li key={att.id}>
                                        {att.filename} ({Math.round(att.size / 1024)} KB)
                                        {/* Note: Downloading attachments directly via link might not work due to auth/temp nature. Mail.tm API might offer specific download URLs per attachment if needed. */}
                                    </li>
                                ))}
                             </ul>
                        </div>
                    )}

                </div>
            )}

            {/* Close Button in Footer (Optional, base modal already has one) */}
            {/* <div className="flex justify-end mt-4 border-t pt-3">
                <button
                    onClick={onClose}
                    className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded transition duration-150 ease-in-out"
                >
                    Close
                </button>
            </div> */}
        </Modal>
    );
}

export default EmailDetailViewModal;