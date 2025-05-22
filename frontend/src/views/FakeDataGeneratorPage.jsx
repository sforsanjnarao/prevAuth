
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { generateFakeData, getFakeDataHistory } from '../api/fakeDataApi';
import { toast } from 'react-toastify';
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
import { UserPlus, Clock, Mail, Clipboard, ShieldCheck, FolderX } from 'lucide-react';
import Navbar from '../components/Navbar';
import { Label } from '@radix-ui/react-dropdown-menu';

const HistoryItem = ({ item }) => {
  const formattedDate = new Date(item.createdAt).toLocaleString();
  const copyToClipboard = (text, type) => {
    navigator.clipboard
      .writeText(text)
      .then(() => toast.info(`${type} copied!`, { autoClose: 1500 }))
      .catch(() => toast.error(`Failed to copy ${type}.`));
  };

  const fullName = item.fullName || `${item.fakeFirstName} ${item.fakeLastName}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-[#1a2a44] p-4 rounded-lg border border-gray-900/50 mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:shadow-lg transition-shadow duration-200"
    >
      <div className="flex-grow">
        <div className="flex items-center mb-1">
          {item.fakeAvatarUrl && (
            <img src={item.fakeAvatarUrl} alt="Avatar" className="h-6 w-6 rounded-full mr-2" />
          )}
          <span className="font-semibold text-gray-100">{fullName}</span>
        </div>
        <div className="flex items-center text-sm text-gray-300 group">
          <Mail className="h-4 w-4 mr-1 text-gray-400" aria-hidden="true" />
          <span className="mr-1">{item.generatedEmail}</span>
          <motion.button
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => copyToClipboard(item.generatedEmail, 'Email')}
            title="Copy Email"
            className="p-0.5 rounded opacity-0 group-hover:opacity-100 focus:opacity-100 text-gray-400 hover:text-gray-200"
            aria-label="Copy email address"
          >
            <Clipboard className="h-4 w-4" aria-hidden="true" />
          </motion.button>
        </div>
        <p className="text-xs text-gray-400 mt-1">Generated: {formattedDate}</p>
      </div>
      <div className="flex-shrink-0">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link
            to={`/fakedata/inbox/${item._id}`}
            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-gray-100 text-sm font-medium py-1 px-3 rounded transition duration-150 ease-in-out"
            aria-label={`View inbox for ${item.generatedEmail}`}
          >
            <Mail className="h-4 w-4 mr-1" aria-hidden="true" />
            View Inbox
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
};

function FakeDataGeneratorPage() {
  const [count, setCount] = useState(1);
  const [history, setHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [recentlyGenerated, setRecentlyGenerated] = useState([]);

  const loadHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    setError(null);
    try {
      const response = await getFakeDataHistory();
      if (response.success) {
        setHistory(response.data || []);
      } else {
        throw new Error(response.msg || 'Failed to load history');
      }
    } catch (err) {
      setError(err.message);
      toast.error(`Error loading history: ${err.message}`);
      setHistory([]);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleGenerateClick = async () => {
    if (count <= 0 || count > 5) {
      toast.warn('Please enter a number between 1 and 5.');
      return;
    }
    setIsGenerating(true);
    setRecentlyGenerated([]);
    setError(null);
    try {
      const response = await generateFakeData(count);
      if (response.success) {
        toast.success(response.msg || `Generated ${response.generated?.length || 0} entries.`);
        setRecentlyGenerated(response.generated || []);
        loadHistory();
      } else {
        throw new Error(response.msg || 'Generation failed');
      }
      if (response.warnings && response.warnings.length > 0) {
        toast.warn(`Generation completed with warnings: ${response.warnings.join(', ')}`);
      }
    } catch (err) {
      setError(err.message);
      toast.error(`Generation failed: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCountChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      setCount(value);
    } else if (e.target.value === '') {
      setCount('');
    }
  };

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
                Fake Data Generator
              </CardTitle>
              <CardDescription className="text-gray-300 text-center">
                Generate fake user profiles with temporary email addresses.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <motion.form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleGenerateClick();
                }}
                className="flex flex-col sm:flex-row items-end gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <div className="flex-grow">
                  <Label
                    htmlFor="generation-count"
                    className="block text-sm font-medium text-gray-300 mb-1"
                  >
                    Number of Profiles (1-5)
                  </Label>
                  <Input
                    type="number"
                    id="generation-count"
                    min="1"
                    max="5"
                    value={count}
                    onChange={handleCountChange}
                    disabled={isGenerating}
                    className="w-full sm:w-32 px-3 py-2 bg-[#1a2a44] border-gray-900/50 text-gray-100 placeholder-gray-400 focus:ring-gray-500 focus:border-gray-500"
                    aria-label="Number of profiles to generate"
                  />
                </div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    type="submit"
                    disabled={isGenerating || !count || count <= 0 || count > 5}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Generate fake data profiles"
                  >
                    {isGenerating ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-100"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Generating...
                      </>
                    ) : (
                      <>
                        <motion.div
                          whileHover={{ scale: 1.2 }}
                          transition={{ type: 'spring', stiffness: 300 }}
                        >
                          <UserPlus className="h-5 w-5 mr-2 text-gray-400" aria-hidden="true" />
                        </motion.div>
                        Generate Data
                      </>
                    )}
                  </Button>
                </motion.div>
              </motion.form>
            </CardContent>
          </Card>

          {/* Recently Generated Section */}
          <AnimatePresence>
            {recentlyGenerated.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
                aria-live="polite"
              >
                <h2 className="text-2xl font-semibold mb-4 text-gray-100">
                  Recently Generated
                </h2>
                <motion.div
                  className="space-y-3"
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
                  {recentlyGenerated.map((item) => (
                    <motion.div
                      key={item._id || item.email}
                      variants={cardVariants}
                      className="bg-blue-900/50 p-4 rounded-lg border border-blue-700"
                    >
                      <p className="text-gray-100">
                        <strong>Name:</strong> {item.name}
                      </p>
                      <p className="text-gray-100">
                        <strong>Email:</strong> {item.email}
                      </p>
                      <p className="text-gray-100">
                        <strong>Fake Password:</strong> {item.password}
                      </p>
                      <p className="text-gray-100">
                        <strong>DOB:</strong> {item.dob}
                      </p>
                      <p className="text-gray-100">
                        <strong>Age:</strong> {item.age}
                      </p>
                      <p className="text-gray-100">
                        <strong>Address:</strong> {item.address}
                      </p>
                      <motion.div whileHover={{ scale: 1.05 }}>
                        <Link
                          to={`/fakedata/inbox/${item._id}`}
                          className="text-blue-400 hover:text-blue-300 text-sm mt-1 inline-block"
                          aria-label={`View inbox for ${item.email}`}
                        >
                          View Inbox
                        </Link>
                      </motion.div>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* History Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="text-2xl font-semibold mb-4 text-gray-100 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-gray-400" aria-hidden="true" />
              Generation History
            </h2>
            <AnimatePresence>
              {isLoadingHistory && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-gray-400">Loading history...</p>
                </motion.div>
              )}
              {!isLoadingHistory && error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-red-900/50 border-red-700">
                    <CardContent className="pt-6">
                      <p className="text-red-400" role="alert">
                        Error loading history: {error}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
              {!isLoadingHistory && !error && history.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-[#1a2a44] p-4 rounded-md"
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <FolderX className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
                  </motion.div>
                  <p className="text-gray-400 mt-4 text-center">
                    You haven't generated any fake data yet.
                  </p>
                </motion.div>
              )}
              {!isLoadingHistory && !error && history.length > 0 && (
                <motion.div
                  className="space-y-3"
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
                  {history.map((item) => (
                    <HistoryItem key={item._id} item={item} />
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

export default FakeDataGeneratorPage;
