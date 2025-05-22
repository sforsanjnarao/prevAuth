
import React, { useState } from 'react';
import { checkEmailBreachesDirect } from '../api/BreachApi';
import { ShieldAlert, ShieldCheck, Search } from 'lucide-react';
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

function BreachCheckPage() {
  const [emailToCheck, setEmailToCheck] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [inputError, setInputError] = useState(null);
  const [breachResult, setBreachResult] = useState(null);
  const [lastCheckTime, setLastCheckTime] = useState(null);

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleCheckBreaches = async (e) => {
    e.preventDefault();
    setInputError(null);
    setError(null);
    setBreachResult(null);

    if (!emailToCheck) {
      setInputError('Please enter an email address to check.');
      return;
    }
    if (!isValidEmail(emailToCheck)) {
      setInputError('Please enter a valid email address format.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await checkEmailBreachesDirect(emailToCheck);
      setBreachResult(response);
      setLastCheckTime(new Date());

      if (response.breaches >=0) {
        toast.success(` No public breaches found for ${response.email}.`);
      } else {
        toast.warn(` ${response.breaches.length} breach found for ${response.email}.`);
      }
    } catch (err) {
      const errorMsg = err.message || 'An error occurred during the breach check.';
      setError(errorMsg);
      toast.error(errorMsg);
      setBreachResult(null);
      setLastCheckTime(null);
    } finally {
      setIsLoading(false);
    }
  };

  const renderBreach = (breach, index) => (
    <motion.div
      key={breach.breach || index}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="border border-red-700 bg-red-900/50 p-4 rounded-lg mb-3 shadow-sm"
    >
      <h4 className="font-semibold text-red-400">{breach.breach || 'Unknown Breach'}</h4>
      {breach.domain && <p className="text-sm text-gray-400">{breach.domain}</p>}
      <p className="text-sm text-red-400 mt-1">
        Breach Date: {breach.xposed_date ? breach.xposed_date : 'N/A'}
      </p>
      {breach.xposed_data && (
        <p className="text-sm text-red-400 mt-1">
          Compromised Data: <span className="font-medium">{breach.xposed_data.replace(/;/g, ', ')}</span>
        </p>
      )}
      <p className="text-xs text-red-500 mt-2">
        ({breach.xposed_records ? `${breach.xposed_records.toLocaleString()} accounts affected` : 'Account count unknown'})
      </p>
      {breach.xposed_data?.toLowerCase().includes('passwords') && (
        <p className="text-sm font-semibold text-red-400 mt-2">
          ⚠️ Action Recommended: This breach exposed passwords. Change passwords used on{' '}
          <span className="italic">{breach.domain || 'this service'}</span> and any other site where
          the password for this email may have been reused.
        </p>
      )}
      {breach.details && <p className="text-xs text-gray-400 mt-1 italic">{breach.details}</p>}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-[#0a192f] flex flex-col">
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
                Data Breach Check
              </CardTitle>
              <CardDescription className="text-gray-300 text-center">
                Enter an email address to check for known public data breaches.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Form Section */}
              <motion.form
                onSubmit={handleCheckBreaches}
                className="flex flex-col sm:flex-row sm:items-end gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <div className="flex-grow">
                  <label
                    htmlFor="email-to-check"
                    className="block text-sm font-medium text-gray-300 mb-1"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Input
                      type="email"
                      id="email-to-check"
                      value={emailToCheck}
                      onChange={(e) => {
                        setEmailToCheck(e.target.value);
                        if (inputError) setInputError(null);
                      }}
                      placeholder="e.g., user@example.com"
                      className={`w-full px-3 py-2 border ${
                        inputError ? 'border-red-500' : 'border-gray-900/50'
                      } bg-[#1a2a44] text-gray-100 placeholder-gray-400 focus:ring-gray-500 focus:border-gray-500`}
                      aria-describedby={inputError ? 'email-error' : undefined}
                      disabled={isLoading}
                    />
                  </div>
                  {inputError && (
                    <p id="email-error" className="mt-1 text-xs text-red-400">
                      {inputError}
                    </p>
                  )}
                </div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    type="submit"
                    disabled={isLoading || !emailToCheck}
                    className="h-[42px] bg-blue-600 hover:bg-blue-700 text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Scan email for breaches"
                  >
                    {isLoading ? (
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
                        Scanning...
                      </>
                    ) : (
                      <>
                        <motion.div
                          whileHover={{ scale: 1.2 }}
                          transition={{ type: 'spring', stiffness: 300 }}
                        >
                          <Search className="h-5 w-5 mr-2 text-gray-400" aria-hidden="true" />
                        </motion.div>
                        Scan Email
                      </>
                    )}
                  </Button>
                </motion.div>
              </motion.form>

              {/* Error Display */}
              <AnimatePresence>
                {error && !isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-red-900/50 border border-red-700 text-red-400 p-4 rounded-lg"
                    role="alert"
                  >
                    <p className="font-bold">Scan Error</p>
                    <p>{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Results Display */}
              <AnimatePresence>
                {breachResult && !isLoading && !error && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    aria-live="polite"
                  >
                    <h2 className="text-2xl font-semibold mb-4 text-gray-100">
                      Scan Results for{' '}
                      <span className="font-medium text-blue-400">{breachResult.email}</span>
                    </h2>
                    <p className="text-sm text-gray-400 mb-4">
                      Scan completed on: {lastCheckTime?.toLocaleString() || 'N/A'}
                    </p>

                    {breachResult.breaches && breachResult.breaches.length > 0 ? (
                      <div>
                        <div className="flex items-start text-red-400 mb-4 p-4 bg-red-900/50 rounded-lg border border-red-700 shadow-sm">
                          <ShieldAlert className="h-8 w-8 mr-3 flex-shrink-0 text-red-500" />
                          <div>
                            <h3 className="font-semibold text-lg">Warning: Breaches Found!</h3>
                            <p className="text-sm">
                              This email address was found in{' '}
                              <span className="font-bold">{breachResult.breaches.length}</span>{' '}
                              public data breach(es). Review the details below.
                            </p>
                          </div>
                        </div>
                        {breachResult.breaches.map(renderBreach)}
                      </div>
                    ) : (
                      <div className="flex items-start text-green-400 mb-4 p-4 bg-green-900/50 rounded-lg border border-green-700 shadow-sm">
                        <ShieldCheck className="h-8 w-8 mr-3 flex-shrink-0 text-green-500" />
                        <div>
                          <h3 className="font-semibold text-lg">No Breaches Found</h3>
                          <p className="text-sm">
                            Good news! This email address (
                            <span className="font-medium">{breachResult.email}</span>) was not
                            found in the XposedOrNot database of public breaches.
                          </p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default BreachCheckPage;
