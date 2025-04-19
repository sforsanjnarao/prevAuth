// src/pages/InboxViewPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom'; // useParams to get ID from URL, Link for navigation
import { getEmailInboxList } from '../services/fakeDataApi'; // API function
import { toast } from 'react-toastify';
import { InboxIcon, ArrowPathIcon, EnvelopeIcon, PaperAirplaneIcon, ClockIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import EmailDetailViewModal from '../components/common/EmailDetailViewModal'; 
// We'll create EmailDetailViewModal later
// import EmailDetailViewModal from '../components/common/EmailDetailViewModal';

// Sub-component to display a single email header in the list
const EmailListItem = ({ message, onSelect }) => {
    const formattedDate = new Date(message.createdAt).toLocaleString();
    const isSeen = message.seen; // Check if message is marked as read

    return (
        <div
            className={`border border-gray-200 rounded-md p-3 mb-2 flex flex-col sm:flex-row justify-between items-start gap-2 cursor-pointer hover:bg-gray-50 transition-colors ${isSeen ? 'bg-gray-50' : 'bg-white font-medium'}`}
            onClick={() => onSelect(message.id)} // Pass the Mail.tm message ID up
            role="button"
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && onSelect(message.id)} // Basic keyboard accessibility
        >
            <div className="flex-grow overflow-hidden mr-2">
                 <div className={`flex items-center text-sm ${isSeen ? 'text-gray-600' : 'text-gray-900'}`}>
                     <PaperAirplaneIcon className={`h-4 w-4 mr-1.5 flex-shrink-0 ${isSeen ? 'text-gray-400' : 'text-gray-600'}`}/>
                     <span className="font-semibold truncate" title={message.from?.address}>{message.from?.name || message.from?.address || 'Unknown Sender'}</span>
                 </div>
                <p className={`text-sm truncate mt-1 ${isSeen ? 'text-gray-500' : 'text-gray-700'}`} title={message.subject}>
                    {message.subject || '(no subject)'}
                </p>
                 <p className="text-xs text-gray-400 mt-1 truncate" title={message.intro}>
                     {message.intro || '(no preview)'}
                 </p>
            </div>
            <div className="text-xs text-gray-500 text-right flex-shrink-0 mt-1 sm:mt-0 whitespace-nowrap">
                 <div className='flex items-center justify-end'>
                     <ClockIcon className="h-3 w-3 mr-1"/>
                     {formattedDate}
                 </div>
                {!isSeen && (
                     <span className="inline-block mt-1 px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                         New
                     </span>
                 )}
            </div>
        </div>
    );
};


function InboxViewPage() {
    const { id: fakeDataId } = useParams(); // Get the FakeUserData ID from the URL
    const [inboxEmail, setInboxEmail] = useState(''); // Store the email address being viewed
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMessageId, setSelectedMessageId] = useState(null); // ID of email to view detail
    const [showDetailModal, setShowDetailModal] = useState(false);

    // Fetch inbox data
    const loadInbox = useCallback(async (showLoading = true) => {
        if (!fakeDataId) return;
        if (showLoading) {
             setIsLoading(true);
        }
        setError(null);
        try {
            const response = await getEmailInboxList(fakeDataId);
            if (response.success) {
                setInboxEmail(response.email || '');
                setMessages(response.messages || []);
                 if (!showLoading) { // Give feedback on manual refresh
                    toast.info("Inbox refreshed!");
                 }
            } else {
                 throw new Error(response.msg || 'Failed to load inbox');
            }
        } catch (err) {
            setError(err.message);
            toast.error(`Error loading inbox: ${err.message}`);
            setMessages([]);
            setInboxEmail('');
        } finally {
            if (showLoading) {
                setIsLoading(false);
            }
        }
    }, [fakeDataId]); // Dependency: fakeDataId

    // Load inbox on mount and when ID changes
    useEffect(() => {
        loadInbox(true); // Show loading indicator on initial load
    }, [loadInbox]); // Depend on the memoized loadInbox function

    // Handler to open email detail modal
    const handleSelectMessage = (messageId) => {
        setSelectedMessageId(messageId);
        setShowDetailModal(true);
        // Optionally mark as read here via API patch request if needed,
        // or just update local state if not critical
    };

    // Handler to close email detail modal
    const handleCloseDetailModal = () => {
        setShowDetailModal(false);
        setSelectedMessageId(null);
        // Optionally trigger a refresh here if marking as read modifies the list display
        // loadInbox(false);
    };

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
             <Link to="/fake-data" className="text-sm text-blue-600 hover:underline mb-4 inline-block">← Back to Generator</Link>
            <div className='flex flex-col sm:flex-row justify-between items-center mb-4 gap-3'>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
                     <InboxIcon className='h-7 w-7 text-indigo-600'/>
                     Inbox for: <span className='text-indigo-700 break-all'>{inboxEmail || 'Loading...'}</span>
                </h1>
                <button
                    onClick={() => loadInbox(false)} // Refresh without full loading indicator
                    disabled={isLoading}
                    className="inline-flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 px-3 rounded-md border border-gray-300 transition duration-150 ease-in-out disabled:opacity-50"
                >
                    <ArrowPathIcon className={`h-4 w-4 mr-1.5 ${isLoading ? 'animate-spin' : ''}`}/>
                    Refresh
                </button>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="text-center py-10">
                     <p className="text-gray-500">Loading Inbox...</p>
                </div>
            )}

            {/* Error State */}
             {!isLoading && error && (
                 <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
                    <p className="font-bold">Error Loading Inbox</p>
                    <p>{error}</p>
                </div>
            )}

            {/* Empty Inbox State */}
             {!isLoading && !error && messages.length === 0 && (
                <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-200">
                    <EnvelopeIcon className='h-12 w-12 mx-auto text-gray-400 mb-3'/>
                    <p className="text-gray-500">This inbox is empty.</p>
                    <p className="text-xs text-gray-400 mt-1">Send an email to {inboxEmail} and click Refresh.</p>
                </div>
            )}

            {/* Message List */}
             {!isLoading && !error && messages.length > 0 && (
                 <div className="bg-white p-1 md:p-4 rounded-lg shadow border border-gray-200">
                    {messages.map(msg => (
                         <EmailListItem
                            key={msg.id} // Use Mail.tm message ID as key
                            message={msg}
                            onSelect={handleSelectMessage}
                         />
                    ))}
                 </div>
             )}

            {/* Placeholder for Email Detail Modal */}
            {showDetailModal && selectedMessageId && (
                 <EmailDetailViewModal
                     isOpen={showDetailModal} // Control visibility
                     onClose={handleCloseDetailModal} // Pass close handler
                     fakeDataId={fakeDataId} // Pass necessary ID
                     messageId={selectedMessageId} // Pass selected message ID
                 />
             )}

        </div>
    );
}

export default InboxViewPage;