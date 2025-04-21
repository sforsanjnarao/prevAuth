// src/components/AppTrackerItem.jsx
import React, { useState } from 'react';
import { deleteAppEntry } from '../services/appTrackerApi'; // API function
import { toast } from 'react-toastify';
import { TrashIcon, TagIcon, LinkIcon, InformationCircleIcon } from '@heroicons/react/24/outline'; // Icons
import ConfirmModal from './common/ConfirmModal'; // Reusable confirmation modal
import { getRiskLevel, MAX_RISK_SCORE } from '../constants/appTrackerConstants'; // Risk level mapping

// Reusable Pill component for displaying data categories
const DataPill = ({ category }) => {
    // Basic coloring - could be enhanced based on sensitivity
    let colorClasses = 'bg-gray-100 text-gray-700 border-gray-200';
    // Example: Add specific colors (optional)
    // if (['Password', 'Financial Information', 'Health & Medical Info', 'Government ID'].includes(category)) {
    //     colorClasses = 'bg-red-100 text-red-700 border-red-200';
    // } else if (['Phone Number', 'Physical Address', 'Precise Location', 'Date of Birth'].includes(category)) {
    //     colorClasses = 'bg-orange-100 text-orange-700 border-orange-200';
    // }

    return (
        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${colorClasses}`}>
            {category}
        </span>
    );
};

// Reusable Risk Slider Visual
const RiskSlider = ({ score }) => {
    const { level, colorClass, percentage, labelColor } = getRiskLevel(score);

    return (
        <div className='w-full mt-1' title={`Risk Level: ${level} (${score}/${MAX_RISK_SCORE})`}>
             <div className="flex justify-between items-center mb-0.5">
                <span className={`text-xs font-semibold ${labelColor}`}>{level} Risk</span>
                <span className="text-xs text-gray-500">{score}/{MAX_RISK_SCORE}</span>
             </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full ${colorClass} transition-all duration-300 ease-in-out`}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
};


function AppTrackerItem({ entry, onDelete }) {
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false); 

    const handleDeleteRequest = () => {
        setShowConfirmDelete(true);
    };

    const handleConfirmDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteAppEntry(entry._id);
            toast.success(`Entry "${entry.appName}" deleted successfully!`);
            setShowConfirmDelete(false); // Close modal
            onDelete(entry._id); // Notify parent to update list state
        } catch (error) {
            toast.error(error.message || `Failed to delete entry "${entry.appName}".`);
             // Optionally keep modal open on error:
             // setIsDeleting(false);
             // Or close it:
             setShowConfirmDelete(false);
             setIsDeleting(false);
        }
        // No finally needed if modal closes regardless
    };
    const toggleExpand = () => setIsExpanded(!isExpanded);

    // Helper to safely create external links
    const formatUrl = (url) => {
         if (!url) return '#';
         return url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
    }

    return (
        <>
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200 flex flex-col justify-between hover:shadow-md transition-shadow duration-200">
                {/* Top Row: Name, Risk, Expand/Collapse, Actions */}
                <div className="flex justify-between items-start gap-2 mb-2">
                    {/* Left side: Name & Risk */}
                    <div className='flex-grow overflow-hidden mr-2'>
                        <h3 className="font-semibold text-lg text-gray-800 truncate " title={entry.appName}>{entry.appName}</h3>
                        <RiskSlider score={entry.calculatedRiskScore} />
                    </div>
                    {/* Right side: Expand/Actions */}
                    <div className="flex items-center flex-shrink-0 space-x-1">
                         {/* Expand/Collapse Button */}
                         {(entry.notes || entry.appUrl || entry.appCategory) && ( // Only show expand if there are details
                              <button onClick={toggleExpand} className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100" title={isExpanded ? "Collapse" : "Expand Details"}>
                                 {isExpanded ? <ChevronUpIcon className="h-5 w-5"/> : <ChevronDownIcon className="h-5 w-5"/>}
                              </button>
                         )}
                         {/* Add Edit Button Later */}
                         {/* <button title="Edit Entry" className="p-1 rounded text-gray-400 hover:text-yellow-600 hover:bg-yellow-50"><PencilSquareIcon className="h-5 w-5"/></button> */}
                         <button onClick={handleDeleteRequest} title="Delete Entry" className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50" disabled={isDeleting}>
                             <TrashIcon className="h-5 w-5" />
                         </button>
                    </div>
                </div>

                {/* Always Visible: Data Shared */}
                 <div className="mb-3">
                    <p className="text-xs font-medium text-gray-500 mb-1.5">Data Shared:</p>
                    <div className="flex flex-wrap gap-1.5">
                        {entry.dataShared?.map(category => <DataPill key={category} category={category} />) ?? <span className='text-xs text-gray-400 italic'>None logged.</span>}
                    </div>
                </div>

                {/* Collapsible Details Section */}
                {isExpanded && (
                    <div className='border-t border-gray-200 mt-3 pt-3 space-y-2 text-sm text-gray-700 animate-fade-in'> {/* Simple fade-in */}
                        {entry.appUrl && (
                             <div className='flex items-center gap-1.5'>
                                <LinkIcon className='h-4 w-4 text-gray-400 flex-shrink-0'/>
                                <a href={formatUrl(entry.appUrl)} target="_blank" rel="noopener noreferrer" className='text-blue-600 hover:underline break-all'>
                                     {entry.appUrl}
                                </a>
                             </div>
                         )}
                        {entry.appCategory && (
                             <div className='flex items-center gap-1.5'>
                                 <TagIcon className='h-4 w-4 text-gray-400 flex-shrink-0'/>
                                 <span>Category: <span className='font-medium'>{entry.appCategory}</span></span>
                             </div>
                         )}
                         {entry.notes && (
                             <div className='flex items-start gap-1.5'>
                                <InformationCircleIcon className='h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5'/>
                                <div>
                                    <span className='font-medium'>Notes:</span>
                                    <p className='whitespace-pre-wrap text-gray-600'>{entry.notes}</p>
                                </div>
                             </div>
                         )}
                    </div>
                )}

                {/* Footer Timestamp */}
                <div className="text-xs text-gray-400 mt-2 text-right pt-2 border-t border-gray-100">
                    Added: {new Date(entry.createdAt).toLocaleDateString()}
                </div>
            </div>

             {/* Render Confirmation Modal */}
            <ConfirmModal
                isOpen={showConfirmDelete}
                onClose={() => setShowConfirmDelete(false)}
                onConfirm={handleConfirmDelete}
                title="Confirm Deletion"
                message={`Are you sure you want to remove the entry for "${entry.appName}" from your tracker?`}
                confirmText="Delete"
                isConfirming={isDeleting}
            />
             {/* Add basic fade-in animation CSS if not global */}
             <style>{`
                 @keyframes fadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }
                 .animate-fade-in { animation: fadeIn 0.3s ease-in-out; }
             `}</style>
        </>
    );
}

export default AppTrackerItem;