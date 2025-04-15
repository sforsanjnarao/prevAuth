// src/pages/VaultPage.jsx
import React, { useState, useEffect, useCallback ,useMemo} from 'react';
// Import the NEW vaultApi service
import { fetchVaultEntries } from '../api/vaultApi';
// Import child components later:
import VaultItem from '../components/VaultItem';
import VaultFormModal from '../components/VaultFormModal';
import { toast } from 'react-toastify'; 
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'; 

function VaultPage() {
    const [allEntries, setAllEntries] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false); // For Add/Edit modal
    const [entryToEdit, setEntryToEdit] = useState(null); // null for Add, object for Edit
    const [searchTerm, setSearchTerm] = useState(''); 

    // Function to load entries (uses the new vaultApi service)
    const loadEntries = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Call the function from vaultApi.js
            const response = await fetchVaultEntries();
            if (response.success) {
                setAllEntries(response.data || []);
            } else {
                 throw new Error(response.msg || 'Failed to fetch entries');
            }
        } catch (err) {
            const errorMsg = err.message || 'An unexpected error occurred while fetching entries.';
            setError(errorMsg); // Keep error state for potential inline display
            toast.error(`Failed to load vault: ${errorMsg}`); // <--- Error Toast for fetch failure
            setAllEntries([]);
        }  finally {
            setIsLoading(false);
        }
    }, []);

    // Load entries on component mount
    useEffect(() => {
        loadEntries();
    }, [loadEntries]);

    // --- Filtering Logic ---
    // useMemo ensures filtering only runs when searchTerm or allEntries changes
    const filteredEntries = useMemo(() => {
        if (!searchTerm) {
            return allEntries; // Return all if no search term
        }
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return allEntries.filter(entry =>
            entry.appName?.toLowerCase().includes(lowerCaseSearchTerm) ||
            entry.username?.toLowerCase().includes(lowerCaseSearchTerm) ||
            entry.url?.toLowerCase().includes(lowerCaseSearchTerm) ||
            entry.category?.toLowerCase().includes(lowerCaseSearchTerm)
            // Add other fields to search if needed (e.g., notes - but notes aren't fetched initially)
        );
    }, [allEntries, searchTerm]);

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
        setAllEntries(prevEntries => prevEntries.filter(entry => entry._id !== entryId));
        console.log(`Entry ${entryId} removed from local state.`);
    }, []); // <-- Dependency array

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };
    

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



             {/* --- Search Bar --- */}
             <div className="mb-6">
                 <label htmlFor="search-vault" className="sr-only">Search Vault</label>
                 <div className="relative rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                        type="search"
                        name="search-vault"
                        id="search-vault"
                        className="block w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="Search by App Name, Username, URL, Category..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                 </div>
            </div>


            {/* Loading State */}
            {isLoading && (
                <div className="text-center py-10">
                    <p className="text-gray-500">Loading Vault...</p>
                </div>
            )}

            {/* Error State */}
            {!isLoading && error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
                    <strong className="font-bold">Error:</strong>
                    <span className="block sm:inline"> {error}</span>
                </div>
            )}

            {/* Results Area */}
                {!isLoading && !error && (
                <>
                    {/* Show count or different message when searching */}
                    {searchTerm && (
                        <p className="text-sm text-gray-500 mb-4">
                            Found {filteredEntries.length} matching entries for "{searchTerm}".
                        </p>
                    )}

                {/* Empty State */}
                {filteredEntries.length === 0 && (
                        <div className="text-center py-10 bg-gray-50 rounded-lg">
                            <p className="text-gray-500">
                                {searchTerm
                                    ? `No entries found matching "${searchTerm}".`
                                    : "Your vault is currently empty. Add your first entry!"
                                }
                            </p>
                        </div>
                    )}

                {/* Entries List - Use filteredEntries */}
                {filteredEntries.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredEntries.map(entry => ( // <-- MAP OVER filteredEntries
                                <VaultItem
                                   key={entry._id}
                                   entry={entry}
                                   onEdit={() => handleOpenEditModal(entry)}
                                   onDeleteSuccess={handleDeleteEntry}
                                />
                            ))}
                        </div>
                    )}
                </>
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