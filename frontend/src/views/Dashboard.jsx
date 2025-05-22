import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import {
  Lock, Shield, User, AlertTriangle, ArrowRight, Plus,
  Key, Fingerprint, Bell, Mail, RefreshCw, ShieldAlert
} from 'lucide-react';
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getVaultStats } from '../api/vaultApi';
import { getAppTrackerStats } from '../api/appTrackerApi';
import { checkEmailBreachesDirect } from '../api/BreachApi';

function DashboardPage() {
  const { user, isVerified } = useSelector((state) => state.auth);
  const userName = user?.name || 'User';
  const userEmail = user?.email;
  const userInitials = userName
    ? userName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'UN';

  const [stats, setStats] = useState({
    vaultCount: null,
    trackerCount: null,
    breachedCount: null,
    riskSummary: null,
    passwordStrength: null,
    twoFactorAdoption: null,
    uniquePasswords: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  const securityScore = stats.riskSummary
    ? Math.round(
        100 -
        (stats.riskSummary.critical * 10 +
          stats.riskSummary.high * 5 +
          stats.riskSummary.medium * 2 +
          stats.riskSummary.low * 1)
      )
    : 0;

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [vaultRes, trackerRes] = await Promise.all([
          getVaultStats(),
          getAppTrackerStats(),
        ]);

        setStats({
          vaultCount: vaultRes.count,
          trackerCount: trackerRes.count,
          breachedCount: trackerRes.breachedCount,
          riskSummary: trackerRes.riskSummary,
          passwordStrength: trackerRes.passwordStrength ?? 0,
          twoFactorAdoption: trackerRes.twoFactorAdoption ?? 0,
          uniquePasswords: trackerRes.uniquePasswords ?? 0,
        });
      } catch (error) {
        toast.error('Failed to load dashboard data. Please try again later.');
        console.error('Dashboard error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleQuickScan = async () => {
    if (!userEmail) {
      toast.error('No email found for scanning');
      return;
    }

    setIsScanning(true);
    try {
      const result = await checkEmailBreachesDirect(userEmail);
      setScanResult({
        breachesFound: result.breachesFound,
        count: result.breaches?.length || 0,
        date: new Date(),
      });
      toast[result.breachesFound ? 'warning' : 'success'](
        result.breachesFound
          ? `Found ${result.breaches.length} breach(es)`
          : 'No breaches found'
      );
    } catch (error) {
      toast.error('Scan failed. Please try again.');
      console.error('Scan error:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const renderRiskSummary = (summary) => {
    if (!summary) return null;
    const items = [
      { label: 'Critical', count: summary.critical, color: 'bg-red-600' },
      { label: 'High', count: summary.high, color: 'bg-orange-500' },
      { label: 'Medium', count: summary.medium, color: 'bg-yellow-500' },
      { label: 'Low', count: summary.low, color: 'bg-green-500' },
    ];
    return (
      <div className="flex flex-wrap gap-2 mt-4">
        {items
          .filter((i) => i.count > 0)
          .map((item) => (
            <span
              key={item.label}
              className={`px-2 py-1 rounded-full text-xs font-medium text-white ${item.color}`}
            >
              {item.count} {item.label}
            </span>
          ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a192f] text-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-2xl md:text-3xl font-bold text-gray-100">
              Welcome back, <span className="text-blue-400">{userName}</span>
            </h1>
            <p className="text-gray-300">Your security dashboard overview</p>
          </motion.div>

          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <Avatar className="border-2 border-blue-500">
              <AvatarImage src={user?.avatar} alt={`${userName}'s avatar`} />
              <AvatarFallback className="bg-blue-600 text-white">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-gray-100">{userName}</p>
              <Badge
                variant={isVerified ? 'success' : 'warning'}
                className="text-xs mt-1 text-gray-500"
              >
                {isVerified ? 'Verified' : <Link to='/verify-email'>Unverified</Link>}
              </Badge>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Vault Items Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="bg-[#112240] border-blue-900/50 hover:border-blue-500/30 transition-colors h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">
                  Vault Items
                </CardTitle>
                <Key className="h-5 w-5 text-blue-400" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-blue-900/50 rounded mb-2"></div>
                    <div className="h-4 bg-blue-900/50 rounded"></div>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-gray-100">
                      {stats.vaultCount ?? 'N/A'}
                    </div>
                    <p className="text-xs text-gray-300 mt-1">
                      Secured passwords & credentials
                    </p>
                  </>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  variant="link"
                  size="sm"
                  className="text-blue-400 p-0"
                  asChild
                  aria-label="View vault details"
                >
                  <Link to="/vault">
                    View vault <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </motion.div>

          {/* Tracked Apps Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-[#112240] border-blue-900/50 hover:border-blue-500/30 transition-colors h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">
                  Tracked Apps
                </CardTitle>
                <Fingerprint className="h-5 w-5 text-purple-400" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-blue-900/50 rounded mb-2"></div>
                    <div className="h-4 bg-blue-900/50 rounded"></div>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-gray-100">
                      {stats.trackerCount ?? 'N/A'}
                    </div>
                    <p className="text-xs text-gray-300 mt-1">
                      Applications being monitored
                    </p>
                  </>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  variant="link"
                  size="sm"
                  className="text-purple-400 p-0"
                  asChild
                  aria-label="View app tracker"
                >
                  <Link to="/app-tracker">
                    View tracker <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </motion.div>

          {/* Breached Apps Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card
              className={`bg-[#112240] ${
                stats.breachedCount > 0
                  ? 'border-red-900/50 hover:border-red-500/30'
                  : 'border-green-900/50 hover:border-green-500/30'
              } transition-colors h-full`}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle
                  className={`text-sm font-medium ${
                    stats.breachedCount > 0 ? 'text-red-300' : 'text-green-300'
                  }`}
                >
                  Breached Apps
                </CardTitle>
                <ShieldAlert
                  className={`h-5 w-5 ${
                    stats.breachedCount > 0 ? 'text-red-400' : 'text-green-400'
                  }`}
                />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-blue-900/50 rounded mb-2"></div>
                    <div className="h-4 bg-blue-900/50 rounded"></div>
                  </div>
                ) : (
                  <>
                    <div
                      className={`text-2xl font-bold ${
                        stats.breachedCount > 0 ? 'text-red-400' : 'text-green-400'
                      }`}
                    >
                      {stats.breachedCount ?? 'N/A'}
                    </div>
                    <p
                      className={`text-xs ${
                        stats.breachedCount > 0 ? 'text-red-300' : 'text-green-300'
                      } mt-1`}
                    >
                      {stats.breachedCount > 0 ? 'Needs attention' : 'All secure'}
                    </p>
                  </>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  variant="link"
                  size="sm"
                  className={`${
                    stats.breachedCount > 0 ? 'text-red-400' : 'text-green-400'
                  } p-0`}
                  asChild
                  aria-label="Check breaches"
                >
                  <Link to="/breach-check">
                    Check breaches <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </motion.div>

          {/* Security Score Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="bg-[#112240] border-blue-900/50 hover:border-blue-500/30 transition-colors h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">
                  Security Score
                </CardTitle>
                <Shield className="h-5 w-5 text-blue-400" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-blue-900/50 rounded mb-2"></div>
                    <div className="h-4 bg-blue-900/50 rounded"></div>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-gray-100">
                      {securityScore}/100
                    </div>
                    <Progress
                      value={securityScore}
                      className="h-2 mt-3 bg-blue-900/50"
                      indicatorClassName="bg-blue-500"
                      aria-label={`Security score: ${securityScore}%`}
                    />
                    <p className="text-xs text-gray-300 mt-2">
                      {securityScore > 80
                        ? 'Excellent'
                        : securityScore > 60
                        ? 'Good'
                        : 'Needs improvement'}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left Column - Alerts and Security Status */}
          <div className="lg:col-span-2 space-y-6">
            {/* Alerts Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-[#112240] border-blue-900/50">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-yellow-400" />
                    <CardTitle className="text-lg text-gray-100">
                      Security Alerts
                    </CardTitle>
                  </div>
                  <Badge
                    variant="warning"
                    className="text-xs text-gray-500"
                    aria-label={
                      stats.breachedCount > 0 || !isVerified
                        ? 'Action needed'
                        : 'All clear'
                    }
                  >
                    {stats.breachedCount > 0 || !isVerified
                      ? 'Action Needed'
                      : 'All Clear'}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoading ? (
                    <div className="animate-pulse">
                      <div className="h-16 bg-blue-900/50 rounded mb-2"></div>
                    </div>
                  ) : (
                    <>
                      {stats.breachedCount > 0 && (
                        <div className="flex items-start gap-3 p-4 bg-red-900/20 rounded-lg border border-red-900/50">
                          <ShieldAlert className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-semibold text-gray-100">
                              Breached Apps Detected
                            </h4>
                            <p className="text-sm text-gray-300 mt-1">
                              You have {stats.breachedCount} app(s) that appeared
                              in data breaches. Consider changing passwords for
                              these services immediately.
                            </p>
                            <Button
                              variant="link"
                              size="sm"
                              className="text-red-400 p-0 mt-2"
                              asChild
                              aria-label="View affected apps"
                            >
                              <Link to="/app-tracker">
                                View affected apps{' '}
                                <ArrowRight className="h-4 w-4 ml-1" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      )}

                      {!isVerified && (
                        <div className="flex items-start gap-3 p-4 bg-blue-900/20 rounded-lg border border-blue-900/50">
                          <Mail className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-semibold text-gray-100">
                              Email Not Verified
                            </h4>
                            <p className="text-sm text-gray-300 mt-1">
                              Verify your email to ensure account security and
                              full feature access.
                            </p>
                            <Button
                              variant="link"
                              size="sm"
                              className="text-blue-400 p-0 mt-2"
                              asChild
                              aria-label="Verify email"
                            >
                              <Link to="/verify-email">
                                Verify email{' '}
                                <ArrowRight className="h-4 w-4 ml-1" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      )}

                      {stats.breachedCount === 0 && isVerified && (
                        <div className="flex items-center gap-3 p-4 bg-green-900/20 rounded-lg border border-green-900/50">
                          <Shield className="h-5 w-5 text-green-400" />
                          <p className="text-sm text-gray-300">
                            No critical security issues detected. Your accounts
                            are secure.
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Risk Summary */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="bg-[#112240] border-blue-900/50">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-100">
                    Risk Summary
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Overview of potential vulnerabilities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="animate-pulse">
                      <div className="h-16 bg-blue-900/50 rounded mb-2"></div>
                      <div className="h-8 bg-blue-900/50 rounded"></div>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-4 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-red-400">
                            {stats.riskSummary?.critical ?? 0}
                          </div>
                          <div className="text-xs text-gray-300">Critical</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-orange-400">
                            {stats.riskSummary?.high ?? 0}
                          </div>
                          <div className="text-xs text-gray-300">High</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-yellow-400">
                            {stats.riskSummary?.medium ?? 0}
                          </div>
                          <div className="text-xs text-gray-300">Medium</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-green-400">
                            {stats.riskSummary?.low ?? 0}
                          </div>
                          <div className="text-xs text-gray-300">Low</div>
                        </div>
                      </div>
                      {stats.riskSummary && renderRiskSummary(stats.riskSummary)}
                      <div className="mt-6 space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1 text-gray-300">
                            <span>Password Strength</span>
                            <span>{stats.passwordStrength ?? 0}%</span>
                          </div>
                          <Progress
                            value={stats.passwordStrength ?? 0}
                            className="h-2 bg-blue-900/50"
                            indicatorClassName="bg-green-500"
                            aria-label={`Password strength: ${
                              stats.passwordStrength ?? 0
                            }%`}
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1 text-gray-300">
                            <span>2FA Adoption</span>
                            <span>{stats.twoFactorAdoption ?? 0}%</span>
                          </div>
                          <Progress
                            value={stats.twoFactorAdoption ?? 0}
                            className="h-2 bg-blue-900/50"
                            indicatorClassName="bg-yellow-500"
                            aria-label={`2FA adoption: ${
                              stats.twoFactorAdoption ?? 0
                            }%`}
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1 text-gray-300">
                            <span>Unique Passwords</span>
                            <span>{stats.uniquePasswords ?? 0}%</span>
                          </div>
                          <Progress
                            value={stats.uniquePasswords ?? 0}
                            className="h-2 bg-blue-900/50"
                            indicatorClassName="bg-orange-500"
                            aria-label={`Unique passwords: ${
                              stats.uniquePasswords ?? 0
                            }%`}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - Quick Actions and Breach Scan */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-[#112240] border-blue-900/50">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-100">
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="flex flex-col items-center justify-center h-24 gap-2 bg-blue-900/20 hover:bg-blue-900/30 border-blue-800"
                    asChild
                    aria-label="Add vault item"
                  >
                    <Link to="/vault">
                      <Key className="h-6 w-6 text-blue-400" />
                      <span className="text-gray-300">Add Vault Item</span>
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex flex-col items-center justify-center h-24 gap-2 bg-purple-900/20 hover:bg-purple-900/30 border-purple-800"
                    asChild
                    aria-label="Track app"
                  >
                    <Link to="/app-tracker">
                      <Fingerprint className="h-6 w-6 text-purple-400" />
                      <span className="text-gray-300">Track App</span>
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex flex-col items-center justify-center h-24 gap-2 bg-red-900/20 hover:bg-red-900/30 border-red-800"
                    asChild
                    aria-label="Check breaches"
                  >
                    <Link to="/breach-check">
                      <ShieldAlert className="h-6 w-6 text-red-400" />
                      <span className="text-gray-300">Check Breaches</span>
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex flex-col items-center justify-center h-24 gap-2 bg-green-900/20 hover:bg-green-900/30 border-green-800"
                    asChild
                    aria-label="Generate data"
                  >
                    <Link to="/fake-data">
                      <User className="h-6 w-6 text-green-400" />
                      <span className="text-gray-300">Generate Data</span>
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Breach Scan */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="bg-[#112240] border-blue-900/50">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-100">
                    Email Breach Scan
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Check if your email appears in known data breaches
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="animate-pulse">
                      <div className="h-16 bg-blue-900/50 rounded mb-4"></div>
                      <div className="h-10 bg-blue-900/50 rounded"></div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          {scanResult ? (
                            scanResult.breachesFound ? (
                              <>
                                <ShieldAlert className="h-5 w-5 text-red-400" />
                                <span className="text-red-400">
                                  Breaches Found
                                </span>
                              </>
                            ) : (
                              <>
                                <Shield className="h-5 w-5 text-green-400" />
                                <span className="text-green-400">
                                  No Breaches
                                </span>
                              </>
                            )
                          ) : (
                            <>
                              <AlertTriangle className="h-5 w-5 text-yellow-400" />
                              <span className="text-yellow-400">
                                Not Scanned
                              </span>
                            </>
                          )}
                        </div>
                        {scanResult?.date && (
                          <span className="text-xs text-gray-300">
                            Last scan: {scanResult.date.toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      <div className="mb-4">
                        {scanResult?.breachesFound ? (
                          <div className="text-center py-4 bg-red-900/20 rounded-lg">
                            <div className="text-3xl font-bold text-red-400 mb-1">
                              {scanResult.count}
                            </div>
                            <div className="text-sm text-gray-300">
                              {scanResult.count === 1
                                ? 'Breach Found'
                                : 'Breaches Found'}
                            </div>
                          </div>
                        ) : scanResult ? (
                          <div className="text-center py-4 bg-green-900/20 rounded-lg">
                            <div className="text-3xl font-bold text-green-400 mb-1">
                              ✓
                            </div>
                            <div className="text-sm text-gray-300">
                              No breaches detected
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4 bg-blue-900/20 rounded-lg">
                            <div className="text-sm text-gray-300">
                              Run a scan to check for breaches
                            </div>
                          </div>
                        )}
                      </div>

                      <Button
                        onClick={handleQuickScan}
                        disabled={isScanning}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-gray-100"
                        aria-label={
                          isScanning
                            ? 'Scanning for email breaches'
                            : 'Run email breach scan'
                        }
                      >
                        {isScanning ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Scanning...
                          </>
                        ) : (
                          'Run Email Scan'
                        )}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;