
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getEmailInboxList } from '../api/fakeDataApi';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Inbox, RefreshCw, Mail, Send, Clock, Eye, EyeOff, ShieldCheck, FolderX } from 'lucide-react';
import EmailDetailViewModal from '../components/common/EmailDetailViewModal';
import Navbar from '../components/Navbar';

const EmailListItem = ({ message, onSelect }) => {
  const formattedDate = new Date(message.createdAt).toLocaleString();
  const isSeen = message.seen;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`border border-gray-900/50 rounded-md p-3 mb-2 flex flex-col sm:flex-row justify-between items-start gap-2 cursor-pointer hover:bg-[#2a3a54] transition-colors ${
        isSeen ? 'bg-[#1a2a44]' : 'bg-blue-900/50'
      }`}
      onClick={() => onSelect(message.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(message.id)}
      aria-label={`View email from ${message.from?.name || message.from?.address || 'Unknown Sender'}`}
      aria-selected={!isSeen}
    >
      <div className="flex-grow overflow-hidden mr-2">
        <div className={`flex items-center text-sm ${isSeen ? 'text-gray-300' : 'text-gray-100'}`}>
          <Send className={`h-4 w-4 mr-1.5 flex-shrink-0 ${isSeen ? 'text-gray-400' : 'text-gray-200'}`} aria-hidden="true" />
          <span className="font-semibold truncate" title={message.from?.address}>
            {message.from?.name || message.from?.address || 'Unknown Sender'}
          </span>
        </div>
        <p
          className={`text-sm truncate mt-1 ${isSeen ? 'text-gray-400' : 'text-gray-200'}`}
          title={message.subject}
        >
          {message.subject || '(no subject)'}
        </p>
        <p
          className="text-xs text-gray-400 mt-1 truncate"
          title={message.intro}
        >
          {message.intro || '(no preview)'}
        </p>
      </div>
      <div className="text-xs text-gray-400 text-right flex-shrink-0 mt-1 sm:mt-0 whitespace-nowrap">
        <div className="flex items-center justify-end">
          <Clock className="h-3 w-3 mr-1" aria-hidden="true" />
          {formattedDate}
        </div>
        {!isSeen && (
          <span className="inline-block mt-1 px-1.5 py-0.5 bg-blue-900/50 text-blue-400 rounded-full font-medium">
            New
          </span>
        )}
      </div>
    </motion.div>
  );
};

function InboxViewPage() {
  const { id: fakeDataId } = useParams();
  const [inboxEmail, setInboxEmail] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const loadInbox = useCallback(
    async (showLoading = true) => {
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
          if (!showLoading) {
            toast.info('Inbox refreshed!');
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
    },
    [fakeDataId],
  );

  useEffect(() => {
    loadInbox(true);
  }, [loadInbox]);

  const handleSelectMessage = (messageId) => {
    setSelectedMessageId(messageId);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedMessageId(null);
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
          <Card className="bg-[#112240] border-gray-900/50 shadow-lg">
            <CardHeader className="space-y-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="inline-block"
              >
                <Link
                  to="/fakedata"
                  className="text-sm text-blue-400 hover:text-blue-300"
                  aria-label="Back to Fake Data Generator"
                >
                  ← Back to Generator
                </Link>
              </motion.div>
              <CardTitle className="flex items-center justify-center gap-2 text-2xl md:text-3xl font-bold text-gray-100">
                <ShieldCheck className="h-6 w-6 text-blue-400" aria-hidden="true" />
                <Inbox className="h-7 w-7 text-blue-400" aria-hidden="true" />
                Inbox for: <span className="text-blue-400 break-all">{inboxEmail || 'Loading...'}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <motion.div
                className="flex justify-end mb-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={() => loadInbox(false)}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Refresh inbox"
                  >
                    <motion.div
                      animate={isLoading ? { rotate: 360 } : { rotate: 0 }}
                      transition={
                        isLoading
                          ? { repeat: Infinity, duration: 1 }
                          : { duration: 0.3 }
                      }
                    >
                      <RefreshCw className="h-4 w-4 mr-1.5" aria-hidden="true" />
                    </motion.div>
                    Refresh
                  </Button>
                </motion.div>
              </motion.div>

              <AnimatePresence>
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-center py-10"
                  >
                    <p className="text-gray-400">Loading Inbox...</p>
                  </motion.div>
                )}

                {!isLoading && error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="bg-red-900/50 border-red-700 mb-6">
                      <CardContent className="pt-6">
                        <p className="font-bold text-red-400" role="alert">
                          Error Loading Inbox
                        </p>
                        <p className="text-red-400">{error}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {!isLoading && !error && messages.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-center py-10 bg-[#1a2a44] rounded-lg"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <FolderX className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
                    </motion.div>
                    <p className="text-gray-400 mt-3">This inbox is empty.</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Send an email to {inboxEmail} and click Refresh.
                    </p>
                  </motion.div>
                )}

                {!isLoading && !error && messages.length > 0 && (
                  <motion.div
                    className="bg-[#112240] p-1 md:p-4 rounded-lg border border-gray-900/50"
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
                    {messages.map((msg) => (
                      <EmailListItem
                        key={msg.id}
                        message={msg}
                        onSelect={handleSelectMessage}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {showDetailModal && selectedMessageId && (
                <EmailDetailViewModal
                  isOpen={showDetailModal}
                  onClose={handleCloseDetailModal}
                  fakeDataId={fakeDataId}
                  messageId={selectedMessageId}
                />
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default InboxViewPage;
