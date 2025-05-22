
import React, { useState, useEffect, useCallback } from 'react';
import { getAppEntries, addAppEntry } from '../api/appTrackerApi';
import { CATEGORY_GROUPS } from '../constants/appTrackerConstants';
import AppTrackerItem from '../components/AppTrackerItem';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Plus, RefreshCw, ShieldCheck, FolderX } from 'lucide-react';
import Navbar from '../components/Navbar';

function AppTrackerPage() {
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const initialFormState = {
    appName: '',
    appUrl: '',
    appCategory: '',
    notes: '',
    dataShared: [],
  };

  const [formData, setFormData] = useState(initialFormState);
  const [selectedDataCategories, setSelectedDataCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

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

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormError(null);
  };

  const handleCategoryChange = (category, checked) => {
    setSelectedDataCategories((prev) =>
      checked ? [...prev, category] : prev.filter((cat) => cat !== category),
    );
    setFormError(null);
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setSelectedDataCategories([]);
    setFormError(null);
  };

  const handleAddEntry = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.appName.trim()) {
      setFormError('App Name is required.');
      return;
    }
    if (selectedDataCategories.length === 0) {
      setFormError('Please select at least one data category.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        appName: formData.appName.trim(),
        dataShared: selectedDataCategories,
        ...(formData.appUrl.trim() && { appUrl: formData.appUrl.trim() }),
        ...(formData.appCategory.trim() && { appCategory: formData.appCategory.trim() }),
        ...(formData.notes.trim() && { notes: formData.notes.trim() }),
      };

      const response = await addAppEntry(payload);
      if (response.success) {
        toast.success(response.msg || `Entry for "${payload.appName}" added.`);
        resetForm();
        loadEntries();
      } else {
        throw new Error(response.msg || 'Failed to add entry');
      }
    } catch (err) {
      toast.error(`Failed to add entry: ${err.message}`);
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleItemDeleted = useCallback((deletedEntryId) => {
    setEntries((prevEntries) => prevEntries.filter((entry) => entry._id !== deletedEntryId));
    console.log(`Entry ${deletedEntryId} removed from local state.`);
  }, []);

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
          <Card className="bg-[#112240] border-gray-900/50 shadow-lg mb-8">
            <CardHeader className="space-y-4">
              <CardTitle className="flex items-center justify-center gap-2 text-3xl font-bold text-gray-100">
                <ShieldCheck className="h-6 w-6 text-blue-400" />
                App Data Tracker
              </CardTitle>
              <CardDescription className="text-gray-300 text-center">
                Log which apps have access to your personal data.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Form Section */}
              <motion.form
                onSubmit={handleAddEntry}
                className="space-y-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <div className="space-y-2">
                  <Label htmlFor="appName" className="text-gray-300">
                    App/Website Name <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="appName"
                    name="appName"
                    value={formData.appName}
                    onChange={handleFormChange}
                    placeholder="e.g., Facebook, MyBank App"
                    required
                    disabled={isSubmitting}
                    className="bg-[#1a2a44] border-gray-900/50 text-gray-100 placeholder-gray-400 focus:ring-gray-500 focus:border-gray-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="appUrl" className="text-gray-300">
                    App URL (Optional)
                  </Label>
                  <Input
                    id="appUrl"
                    name="appUrl"
                    type="url"
                    value={formData.appUrl}
                    onChange={handleFormChange}
                    placeholder="e.g., https://facebook.com"
                    disabled={isSubmitting}
                    className="bg-[#1a2a44] border-gray-900/50 text-gray-100 placeholder-gray-400 focus:ring-gray-500 focus:border-gray-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="appCategory" className="text-gray-300">
                    App Category (Optional)
                  </Label>
                  <Input
                    id="appCategory"
                    name="appCategory"
                    value={formData.appCategory}
                    onChange={handleFormChange}
                    placeholder="e.g., Social Media, Finance"
                    disabled={isSubmitting}
                    className="bg-[#1a2a44] border-gray-900/50 text-gray-100 placeholder-gray-400 focus:ring-gray-500 focus:border-gray-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">
                    Data Categories Shared <span className="text-red-400">*</span>
                  </Label>
                  <div className="space-y-4 mt-2">
                    {Object.entries(CATEGORY_GROUPS).map(([groupName, categories]) => (
                      <div
                        key={groupName}
                        className="p-4 border border-gray-900/50 bg-[#1a2a44] rounded-md"
                      >
                        <h4 className="font-medium text-md text-gray-100 mb-3">{groupName}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
                          {categories.map((category) => (
                            <motion.div
                              key={category}
                              className="flex items-center space-x-2"
                              whileHover={{ scale: 1.05 }}
                            >
                              <Checkbox
                                id={`data-${category.replace(/\s+/g, '-')}`}
                                checked={selectedDataCategories.includes(category)}
                                onCheckedChange={(checked) =>
                                  handleCategoryChange(category, Boolean(checked))
                                }
                                disabled={isSubmitting}
                              />
                              <Label
                                htmlFor={`data-${category.replace(/\s+/g, '-')}`}
                                className="text-sm text-gray-300 font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                              >
                                {category}
                              </Label>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-gray-300">
                    Notes (Optional)
                  </Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleFormChange}
                    placeholder="Any specific details..."
                    disabled={isSubmitting}
                    className="bg-[#1a2a44] border-gray-900/50 text-gray-100 placeholder-gray-400 focus:ring-gray-500 focus:border-gray-500"
                  />
                </div>
                {formError && (
                  <p className="text-sm font-medium text-red-400" role="alert">
                    {formError}
                  </p>
                )}
                <div className="flex justify-end pt-2">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      type="submit"
                      disabled={
                        isSubmitting ||
                        !formData.appName ||
                        selectedDataCategories.length === 0
                      }
                      className="bg-blue-600 hover:bg-blue-700 text-gray-100"
                      aria-label="Add app entry"
                    >
                      {isSubmitting ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1 }}
                          >
                            <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
                          </motion.div>
                          Adding...
                        </>
                      ) : (
                        <>
                          <motion.div
                            whileHover={{ scale: 1.2 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                          >
                            <Plus className="h-4 w-4 mr-2 text-gray-400" aria-hidden="true" />
                          </motion.div>
                          Add App Entry
                        </>
                      )}
                    </Button>
                  </motion.div>
                </div>
              </motion.form>
            </CardContent>
          </Card>

          {/* Logged Entries Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="text-2xl font-semibold mb-6 text-gray-100">Logged Apps</h2>
            <AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-center py-8"
                >
                  <p className="text-gray-400">Loading entries...</p>
                </motion.div>
              )}
              {!isLoading && error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-red-700 bg-red-900/50"
                >
                  <CardContent className="pt-6">
                    <p className="text-center font-medium text-red-400" role="alert">
                      {error}
                    </p>
                  </CardContent>
                </motion.div>
              )}
              {!isLoading && !error && entries.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-[#1a2a44] rounded-lg"
                >
                  <CardContent className="pt-6 text-center">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <FolderX className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
                    </motion.div>
                    <p className="text-gray-400 mt-4">
                      You haven't logged any apps yet. Use the form above to start.
                    </p>
                  </CardContent>
                </motion.div>
              )}
              {!isLoading && !error && entries.length > 0 && (
< motion.div
                  className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: {
                      transition: {
                        staggerChildren: 0.1,
                      },
                    },
                  }}
                  aria-live="polite"
                >
                  {entries.map((entry) => (
                    <motion.div key={entry._id} variants={cardVariants}>
                      <AppTrackerItem
                        entry={entry}
                        onDelete={handleItemDeleted}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default AppTrackerPage;