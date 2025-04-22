// src/pages/AppTrackerPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getAppEntries, addAppEntry } from '../api/appTrackerApi'; // API functions
import { CATEGORY_GROUPS } from '../constants/appTrackerConstants'; // Import categories
import AppTrackerItem from '../components/AppTrackerItem'; // We will create this next
import { toast } from 'react-toastify';
import { PlusCircleIcon } from '@heroicons/react/24/solid';

// Reusable InputField component (optional, can define inline)
const InputField = ({ label, id, value, onChange, placeholder = '', type = 'text', required = false, disabled = false }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}{required && '*'}</label>
        <input
            type={type}
            id={id}
            name={id}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:opacity-50"
        />
    </div>
);

// Reusable TextareaField component (optional)
const TextareaField = ({ label, id, value, onChange, placeholder = '', rows = 3, disabled = false }) => (
    <div>
       <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
       <textarea
           id={id}
           name={id}
           rows={rows}
           value={value}
           onChange={onChange}
           placeholder={placeholder}
           disabled={disabled}
           className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:opacity-50"
       />
   </div>
);


function AppTrackerPage() {
    const [entries, setEntries] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const initialFormState = {
        appName: '',
        appUrl: '',
        appCategory: '',
        notes: '',
        dataShared: [], // Keep dataShared separate for checkbox logic ease
    };


    // State for the Add form
    const [formData, setFormData] = useState(initialFormState);
    const [selectedDataCategories, setSelectedDataCategories] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState(null); // For form-specific errors

    // Fetch entries
    const loadEntries = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await getAppEntries();
            if (response.success) {
                setEntries(response.data || []);
            } else {
                throw new Error(response.msg || 'Failed to fetch entries');
            }
        } catch (err) {
            setError(err.message);
            toast.error(`Error loading tracked apps: ${err.message}`);
            setEntries([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadEntries();
    }, [loadEntries]);

    // Handle general form input changes
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setFormError(null);
    };

    // Handle checkbox changes for data categories
    const handleCategoryChange = (event) => {
        const { value, checked } = event.target;
        setSelectedDataCategories(prev =>
            checked ? [...prev, value] : prev.filter(cat => cat !== value)
        );
        setFormError(null); // Clear error on change
    };

      // Reset form fields
      const resetForm = () => {
        setFormData(initialFormState);
        setSelectedDataCategories([]);
        // Uncheck all checkboxes
        document.querySelectorAll('input[name="dataSharedCheckbox"]').forEach(el => el.checked = false);
        setFormError(null);
   }

    // Handle Add form submission
    const handleAddEntry = async (e) => {
        e.preventDefault();
        setFormError(null); // Clear previous form errors

        if  (!formData.appName.trim()) {
            setFormError("App Name is required.");
            return;
        }
        if (selectedDataCategories.length === 0) {
            setFormError("Please select at least one data category.");
            return;
        }

        setIsSubmitting(true);
        try {
            // Prepare payload including optional fields
            const payload = {
                appName: formData.appName.trim(),
                dataShared: selectedDataCategories,
                // Only include optional fields if they have a value
                ...(formData.appUrl.trim() && { appUrl: formData.appUrl.trim() }),
                ...(formData.appCategory.trim() && { appCategory: formData.appCategory.trim() }),
                ...(formData.notes.trim() && { notes: formData.notes.trim() }),
            };
            
            const response = await addAppEntry(payload);
            if (response.success) {
                toast.success(response.msg || `Entry for "${payload.appName}" added.`);
                resetForm(); // Reset form fields
                loadEntries(); 
                loadEntries(); // Refresh the list
            } else {
                 throw new Error(response.msg || 'Failed to add entry');
            }
        } catch (err) {
            toast.error(`Failed to add entry: ${err.message}`);
            setFormError(err.message); // Show error near form
        } finally {
            setIsSubmitting(false);
        }
    };

     // Handler for when an item is deleted (called by AppTrackerItem)
     const handleItemDeleted = useCallback((deletedEntryId) => {
        setEntries(prevEntries => prevEntries.filter(entry => entry._id !== deletedEntryId));
        console.log(`Entry ${deletedEntryId} removed from local state.`);
    }, []); 

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">App Data Tracker</h1>
            <p className="text-gray-600 mb-6">Log which apps have access to your personal data to understand your digital footprint.</p>

            {/* Add New Entry Form */}
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200 mb-8">
                <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
                    <PlusCircleIcon className='h-6 w-6 mr-2 text-indigo-600'/>
                    Log New App/Service
                </h2>
                <form onSubmit={handleAddEntry} className="space-y-4">
                    {/* App Name Input */}
                    <InputField
                        label="App/Website Name"
                        id="appName"
                        value={formData.appName}
                        onChange={handleFormChange} // Use general handler
                        placeholder="e.g., Facebook, MyBank App"
                        required
                        disabled={isSubmitting}
                    />
                     <InputField
                        label="App URL (Optional)"
                        id="appUrl"
                        value={formData.appUrl}
                        onChange={handleFormChange}
                        placeholder="e.g., https://facebook.com"
                        type="url"
                        disabled={isSubmitting}
                    />
                    <InputField
                        label="App Category (Optional)"
                        id="appCategory"
                        value={formData.appCategory}
                        onChange={handleFormChange}
                        placeholder="e.g., Social Media, Finance, Shopping"
                        disabled={isSubmitting}
                    />


                    {/* Data Shared Checkboxes (Grouped) */}
                    <div className="mb-4">
                         <label className="block text-sm font-medium text-gray-700 mb-2">Data Categories Shared (Select all that apply)</label>
                         <div className="space-y-3">
                            {Object.entries(CATEGORY_GROUPS).map(([groupName, categories]) => (
                                <div key={groupName} className='p-3 border rounded-md border-gray-200 bg-gray-50/50'>
                                    <h4 className='font-medium text-sm text-gray-600 mb-2'>{groupName}</h4>
                                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5'>
                                        {categories.map(category => (
                                            <label key={category} className="flex items-center space-x-2 text-sm">
                                                <input
                                                    type="checkbox"
                                                    name="dataSharedCheckbox" // Use a common name for potential reset
                                                    value={category}
                                                    onChange={handleCategoryChange}
                                                    checked={selectedDataCategories.includes(category)}
                                                    disabled={isSubmitting}
                                                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                                />
                                                <span>{category}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                         </div>
                    </div>

                    <TextareaField
                        label="Notes (Optional)"
                        id="notes"
                        value={formData.notes}
                        onChange={handleFormChange}
                        placeholder="Any specific details, e.g., 'Used for work account only'"
                        disabled={isSubmitting}
                    />

                     {/* Form Error Display */}
                    {formError && (
                        <p className="text-sm text-red-600 mb-3">{formError}</p>
                    )}

                    {/* Submit Button */}
                    <div className="text-right">
                    <button
                            type="submit"
                            disabled={isSubmitting || !formData.appName || selectedDataCategories.length === 0}
                            className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md shadow-sm transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                             {isSubmitting ? 'Adding...' : 'Add App Entry'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Logged Entries List Section */}
            <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Logged Apps</h2>
                 {isLoading && <p className='text-gray-500'>Loading entries...</p>}
                 {!isLoading && error && <p className='text-red-600 bg-red-50 p-3 rounded border border-red-200'>Error loading entries: {error}</p>}
                 {!isLoading && !error && entries.length === 0 && (
                    <p className='text-gray-500 bg-gray-50 p-4 rounded-md border border-gray-200'>You haven't logged any apps yet. Use the form above to start.</p>
                 )}
                 {!isLoading && !error && entries.length > 0 && (
                     <div className="space-y-3">
                         {entries.map(entry => (
                             <AppTrackerItem
                                key={entry._id}
                                entry={entry}
                                onDelete={handleItemDeleted} // Pass callback
                             />
                         ))}
                     </div>
                 )}
            </div>
        </div>
    );
}

export default AppTrackerPage;