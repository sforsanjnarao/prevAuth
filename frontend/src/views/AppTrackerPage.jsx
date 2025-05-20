// src/pages/AppTrackerPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getAppEntries, addAppEntry } from '../api/appTrackerApi'; // API functions
import { CATEGORY_GROUPS } from '../constants/appTrackerConstants'; // Import categories
import AppTrackerItem from '../components/AppTrackerItem'; // We will create this next
// import AppTrackerFormModal from '../components/AppTrackerFormModal';
import { toast } from 'react-toastify';

// Import shadcn/ui components
import { Button } from "@/components/ui/button";      // Assuming default shadcn path
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { PlusCircleIcon, ArrowPathIcon as RefreshIcon } from '@heroicons/react/24/solid'; // Using solid for now



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
    const handleCategoryChange = (category, checked) => { // shadcn checkbox passes checked boolean
        setSelectedDataCategories(prev =>
            checked ? [...prev, category] : prev.filter(cat => cat !== category)
        );
        setFormError(null);
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
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">App Data Tracker</h1>
                    <p className="text-muted-foreground mt-1">Log which apps have access to your personal data.</p>
                </div>
                {/* We will replace this button with a DialogTrigger later if the form is in a modal */}
                {/* For now, form is inline */}
            </div>

            {/* Add New Entry Form using Card */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                        <PlusCircleIcon className='h-6 w-6 mr-2 text-primary'/>
                        Log New App/Service
                    </CardTitle>
                    <CardDescription>Fill in the details of the app and the data you've shared.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAddEntry} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="appName">App/Website Name <span className="text-destructive">*</span></Label>
                            <Input id="appName" name="appName" value={formData.appName} onChange={handleFormChange} placeholder="e.g., Facebook, MyBank App" required disabled={isSubmitting} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="appUrl">App URL (Optional)</Label>
                            <Input id="appUrl" name="appUrl" type="url" value={formData.appUrl} onChange={handleFormChange} placeholder="e.g., https://facebook.com" disabled={isSubmitting} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="appCategory">App Category (Optional)</Label>
                            <Input id="appCategory" name="appCategory" value={formData.appCategory} onChange={handleFormChange} placeholder="e.g., Social Media, Finance" disabled={isSubmitting} />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Data Categories Shared <span className="text-destructive">*</span></Label>
                            <div className="space-y-4 mt-2">
                                {Object.entries(CATEGORY_GROUPS).map(([groupName, categories]) => (
                                    <div key={groupName} className='p-4 border rounded-md bg-card'>
                                        <h4 className='font-medium text-md text-card-foreground mb-3'>{groupName}</h4>
                                        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3'>
                                            {categories.map(category => (
                                                <div key={category} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`data-${category.replace(/\s+/g, '-')}`}
                                                        checked={selectedDataCategories.includes(category)}
                                                        onCheckedChange={(checked) => handleCategoryChange(category, Boolean(checked))} // Ensure boolean
                                                        disabled={isSubmitting}
                                                    />
                                                    <Label htmlFor={`data-${category.replace(/\s+/g, '-')}`} className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                                                        {category}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes (Optional)</Label>
                            <Textarea id="notes" name="notes" value={formData.notes} onChange={handleFormChange} placeholder="Any specific details..." disabled={isSubmitting} />
                        </div>

                        {formError && ( <p className="text-sm font-medium text-destructive">{formError}</p> )}

                        <div className="flex justify-end pt-2">
                            <Button type="submit" disabled={isSubmitting || !formData.appName || selectedDataCategories.length === 0} size="lg">
                                {isSubmitting ? (
                                    <> <RefreshIcon className="animate-spin h-4 w-4 mr-2"/> Adding... </>
                                ) : ( 'Add App Entry' )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Logged Entries List Section */}
            <div>
                <h2 className="text-2xl font-semibold mb-6 text-foreground">Logged Apps</h2>
                {isLoading && <p className='text-center text-muted-foreground py-8'>Loading entries...</p>}
                {!isLoading && error &&
                    <Card className="border-destructive bg-destructive/10">
                        <CardContent className="pt-6">
                            <p className='text-center font-medium text-destructive'>{error}</p>
                        </CardContent>
                    </Card>
                }
                {!isLoading && !error && entries.length === 0 && (
                    <Card>
                        <CardContent className="pt-6">
                            <p className='text-center text-muted-foreground'>You haven't logged any apps yet. Use the form above to start.</p>
                        </CardContent>
                    </Card>
                )}
                {!isLoading && !error && entries.length > 0 && (
                     <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"> {/* Use grid for card layout */}
                         {entries.map(entry => (
                             <AppTrackerItem
                                key={entry._id}
                                entry={entry}
                                onDelete={handleItemDeleted}
                                // onEdit will be added when we implement the modal edit flow
                             />
                         ))}
                     </div>
                 )}
            </div>
        </div>
    );
}

export default AppTrackerPage;