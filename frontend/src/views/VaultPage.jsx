
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchVaultEntries } from '../api/vaultApi';
import VaultItem from '../components/VaultItem';
import VaultFormModal from '../components/VaultFormModal';
import { toast } from 'react-toastify';
import { Search, Plus, FolderX, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Navbar from '../components/Navbar';

function VaultPage() {
  const [allEntries, setAllEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [entryToEdit, setEntryToEdit] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadEntries = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchVaultEntries();
      if (response.success) {
        setAllEntries(response.data || []);
      } else {
        throw new Error(response.msg || 'Failed to fetch entries');
      }
    } catch (err) {
      const errorMsg = err.message || 'An unexpected error occurred while fetching entries.';
      setError(errorMsg);
      toast.error(`Failed to load vault: ${errorMsg}`);
      setAllEntries([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const filteredEntries = useMemo(() => {
    if (!searchTerm) {
      return allEntries;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return allEntries.filter(
      (entry) =>
        entry.appName?.toLowerCase().includes(lowerCaseSearchTerm) ||
        entry.username?.toLowerCase().includes(lowerCaseSearchTerm) ||
        entry.url?.toLowerCase().includes(lowerCaseSearchTerm) ||
        entry.category?.toLowerCase().includes(lowerCaseSearchTerm),
    );
  }, [allEntries, searchTerm]);

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
    loadEntries();
  };

  const handleDeleteEntry = useCallback((entryId) => {
    setAllEntries((prevEntries) => prevEntries.filter((entry) => entry._id !== entryId));
    console.log(`Entry ${entryId} removed from local state.`);
  }, []);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Animation variants for entries
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0a192f]">
      <Navbar />
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-[#112240] border-gray-900/50 shadow-lg">
            <CardHeader className="space-y-4">
              <CardTitle className="flex items-center justify-center gap-2 text-3xl font-bold text-gray-100">
                <ShieldCheck className="h-6 w-6 text-blue-400" />
                Your Data Vault
              </CardTitle>
              <CardDescription className="text-gray-300 text-center">
                Securely manage your credentials and sensitive data.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add New Entry Button */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={handleOpenAddModal}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-gray-100"
                  aria-label="Add new vault entry"
                >
                  <Plus className="h-5 w-5 mr-2 text-gray-400" aria-hidden="true" />
                  Add New Entry
                </Button>
              </motion.div>

              {/* Search Bar */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <label htmlFor="search-vault" className="block text-sm font-medium text-gray-300">
                  Search Vault
                </label>
                <div className="mt-1 relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <motion.div
                      whileHover={{ scale: 1.2 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </motion.div>
                  </div>
                  <Input
                    type="search"
                    name="search-vault"
                    id="search-vault"
                    className="w-full pl-10 pr-3 py-2 border-gray-900/50 bg-[#1a2a44] text-gray-100 placeholder-gray-400 focus:ring-gray-500 focus:border-gray-500"
                    placeholder="Search by App Name, Username, URL, Category..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    aria-label="Search vault entries"
                  />
                </div>
              </motion.div>

              {/* Loading State */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-center py-10"
                >
                  <p className="text-gray-400">Loading Vault...</p>
                </motion.div>
              )}

              {/* Error State */}
              {!isLoading && error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-red-900/50 border border-red-700 text-red-400 px-4 py-3 rounded relative"
                  role="alert"
                >
                  <strong className="font-bold">Error:</strong>
                  <span className="block sm:inline"> {error}</span>
                </motion.div>
              )}

              {/* Results Area */}
              {!isLoading && !error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  aria-live="polite"
                >
                  {searchTerm && (
                    <p className="text-sm text-gray-400 mb-4">
                      Found {filteredEntries.length} matching entries for "{searchTerm}".
                    </p>
                  )}

                  {/* Empty State */}
                  {filteredEntries.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="text-center py-10 bg-[#1a2a44] rounded-lg"
                    >
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                      >
                        <FolderX className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
                      </motion.div>
                      <p className="text-gray-400 mt-4">
                        {searchTerm
                          ? `No entries found matching "${searchTerm}".`
                          : 'Your vault is currently empty. Add your first entry!'}
                      </p>
                    </motion.div>
                  )}

                  {/* Entries List */}
                  {filteredEntries.length > 0 && (
                    <motion.div
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                      initial="hidden"
                      animate="visible"
                      variants={{
                        visible: {
                          transition: {
                            staggerChildren: 0.1,
                          },
                        },
                      }}
                    >
                      {filteredEntries.map((entry) => (
                        <motion.div key={entry._id} variants={cardVariants}>
                          <VaultItem
                            entry={entry}
                            onEdit={() => handleOpenEditModal(entry)}
                            onDeleteSuccess={handleDeleteEntry}
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <VaultFormModal
                entryToEdit={entryToEdit}
                onClose={handleCloseModal}
                onSaveSuccess={handleSaveSuccess}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default VaultPage;
