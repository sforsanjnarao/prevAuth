// src/pages/VaultPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
// Import the NEW vaultApi service
import { fetchVaultEntries } from '../api/vaultApi';
// Import child components later:
import VaultItem from '../components/VaultItem';
import VaultFormModal from '../components/VaultFormModal';
import { toast } from 'react-toastify'; 

function VaultPage() {
    const [entries, setEntries] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false); // For Add/Edit modal
    const [entryToEdit, setEntryToEdit] = useState(null); // null for Add, object for Edit

    // Function to load entries (uses the new vaultApi service)
    const loadEntries = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Call the function from vaultApi.js
            const response = await fetchVaultEntries();
            if (response.success) {
                setEntries(response.data || []);
            } else {
                 throw new Error(response.msg || 'Failed to fetch entries');
            }
        } catch (err) {
            const errorMsg = err.message || 'An unexpected error occurred while fetching entries.';
            setError(errorMsg); // Keep error state for potential inline display
            toast.error(`Failed to load vault: ${errorMsg}`); // <--- Error Toast for fetch failure
            setEntries([]);
        }  finally {
            setIsLoading(false);
        }
    }, []);

    // Load entries on component mount
    useEffect(() => {
        loadEntries();
    }, [loadEntries]);

    // --- Modal Handlers (Same as before) ---
    const handleOpenAddModal = () => {
        setEntryToEdit(null);
        setShowModal(true);
    };

    const handleOpenEditModal = (entry) => {
        setEntryToEdit(entry);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEntryToEdit(null);
    };

    const handleSaveSuccess = () => {
        handleCloseModal();
        loadEntries(); // Re-fetch entries
    };

     // --- Delete Handler (logic passed down) ---
     const handleDeleteEntry = useCallback((entryId) => {
        // Function logic goes here...
        setEntries(prevEntries => prevEntries.filter(entry => entry._id !== entryId));
        console.log(`Entry ${entryId} removed from local state.`);
    }, []); // <-- Dependency array
    

    // --- Rendering Logic (Tailwind CSS - Same as before) ---
    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Your Data Vault</h1>

            {/* Add New Entry Button */}
            <div className="mb-6">
                <button
                    onClick={handleOpenAddModal}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out"
                >
                    Add New Entry
                </button>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="text-center py-10">
                    <p className="text-gray-500">Loading Vault...</p>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
                    <strong className="font-bold">Error:</strong>
                    <span className="block sm:inline"> {error}</span>
                </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && entries.length === 0 && (
                <div className="text-center py-10 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">Your vault is currently empty. Add your first entry!</p>
                </div>
            )}

            {/* Entries List */}
            {!isLoading && !error && entries.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Map over entries and render VaultItem */}
                    {entries.map(entry => (
                         
                        <VaultItem
                           key={entry._id}
                           entry={entry}
                           onEdit={() => handleOpenEditModal(entry)}
                           onDeleteSuccess={handleDeleteEntry} // Pass state update callback
                        />
                    ))}
                </div>
            )}

            {/* Modal Placeholder (Same as before) */}
            {showModal && (
                <VaultFormModal
                    entryToEdit={entryToEdit}
                    onClose={handleCloseModal}
                    onSaveSuccess={handleSaveSuccess}
                />
            )}
        </div>
    );
}

export default VaultPage;