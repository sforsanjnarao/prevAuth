import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import {
  Lock, Shield, User, AlertTriangle, ArrowRight, Plus,
  Key, Fingerprint, Code, Bell, Mail, RefreshCw, ShieldAlert
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getVaultStats } from '../api/vaultApi';
import { getAppTrackerStats } from '../api/appTrackerApi';
import { checkEmailBreachesDirect } from '../api/BreachApi';

// // Stat Card Component
// const StatCard = ({ icon: Icon, title, value, isLoading, linkTo, bgColorClass = 'bg-gray-100', textColorClass = 'text-gray-800' }) => (
//     <div className={`p-5 rounded-lg shadow border ${isLoading ? 'animate-pulse bg-gray-50' : 'bg-white border-gray-200'} flex flex-col h-full`}>
//         <div className="flex items-center gap-3 mb-3">
//             <div className={`p-2 rounded-md ${bgColorClass}`}>
//                 <Icon className={`h-5 w-5 ${textColorClass}`} />
//             </div>
//             <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
//         </div>
//         <div className="my-4">
//             {isLoading ? (
//                 <div className="h-8 bg-gray-200 rounded w-1/2"></div>
//             ) : (
//                 <p className="text-3xl font-bold text-gray-900">{value ?? 'N/A'}</p>
//             )}
//         </div>
//         {linkTo && !isLoading && (
//             <Link to={linkTo} className="mt-auto inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800 font-medium">
//                 View details <ArrowRightIcon className="h-4 w-4 ml-1" />
//             </Link>
//         )}
//     </div>
// );

// // Alert Card Component
// const AlertCard = ({ icon: Icon, title, children, linkTo, bgColorClass = 'bg-red-50', borderColorClass = 'border-red-200', iconColorClass = 'text-red-500' }) => (
//     <div className={`p-4 rounded-lg border ${borderColorClass} ${bgColorClass} flex items-start gap-3`}>
//         <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${iconColorClass}`} />
//         <div className="flex-1">
//             <h4 className="font-semibold text-gray-800">{title}</h4>
//             <div className="text-sm text-gray-600 mt-1">
//                 {children}
//             </div>
//             {linkTo && (
//                 <Link to={linkTo} className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800 font-medium mt-2">
//                     Take action <ArrowRightIcon className="h-4 w-4 ml-1" />
//                 </Link>
//             )}
//         </div>
//     </div>
// );

function DashboardPage() {
    const { user, isVerified } = useSelector((state) => state.auth);
    const userName = user?.name || 'User';
    const userEmail = user?.email;

    const [stats, setStats] = useState({
        vaultCount: null,
        trackerCount: null,
        breachedCount: null,
        riskSummary: null
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState(null);

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
                    riskSummary: trackerRes.riskSummary
                });
            } catch (error) {
                toast.error("Failed to load dashboard data");
                console.error("Dashboard error:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const handleQuickScan = async () => {
        if (!userEmail) {
            toast.error("No email found for scanning");
            return;
        }

        setIsScanning(true);
        try {
            const result = await checkEmailBreachesDirect(userEmail);
            setScanResult({
                breachesFound: result.breachesFound,
                count: result.breaches?.length || 0,
                date: new Date()
            });
            toast[result.breachesFound ? 'warning' : 'success'](
                result.breachesFound 
                    ? `Found ${result.breaches.length} breach(es)` 
                    : "No breaches found"
            );
        } catch (error) {
            toast.error("Scan failed");
            console.error("Scan error:", error);
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
            <div className="flex flex-wrap gap-2 mt-2">
                {items.filter(i => i.count > 0).map(item => (
                    <span key={item.label} className={`px-2 py-1 rounded-full text-xs font-medium text-white ${item.color}`}>
                        {item.count} {item.label}
                    </span>
                ))}
            </div>
        );
    };
    const securityScore = stats.riskSummary
  ? Math.round(
      100 -
      (stats.riskSummary.critical * 10 +
        stats.riskSummary.high * 5 +
        stats.riskSummary.medium * 2 +
        stats.riskSummary.low * 1)
    )
  : 0;

const userInitials = userName
  ? userName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  : 'UN';

   
return(
    <div className="min-h-screen bg-[#0a192f] text-gray-100">
      <div className="container mx-auto px-4 py-8 text-gray-100">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-2xl md:text-3xl font-bold">
              Welcome back, <span className="text-blue-400">{userName}</span>
            </h1>
            <p className="text-blue-200">Your security dashboard overview</p>
          </motion.div>
          
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <Avatar className="border-2 border-blue-500">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="bg-blue-600 text-white">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{userName}</p>
              <Badge 
                variant={isVerified ? "success" : "warning"} 
                className="text-xs mt-1"
              >
                {isVerified ? "Verified" : "Unverified"}
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
                <CardTitle className="text-sm font-medium text-blue-300">
                  Vault Items
                </CardTitle>
                <Key className="h-5 w-5 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.vaultCount}</div>
                <p className="text-xs text-blue-300 mt-1">
                  Secured passwords & credentials
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="link" size="sm" className="text-blue-400 p-0" asChild>
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
                <CardTitle className="text-sm font-medium text-purple-300">
                  Tracked Apps
                </CardTitle>
                <Fingerprint className="h-5 w-5 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.trackerCount}</div>
                <p className="text-xs text-purple-300 mt-1">
                  Applications being monitored
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="link" size="sm" className="text-purple-400 p-0" asChild>
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
            <Card className={`bg-[#112240] ${
              stats.breachedCount > 0 
                ? 'border-red-900/50 hover:border-red-500/30' 
                : 'border-green-900/50 hover:border-green-500/30'
            } transition-colors h-full`}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className={`text-sm font-medium ${
                  stats.breachedCount > 0 ? 'text-red-300' : 'text-green-300'
                }`}>
                  Breached Apps
                </CardTitle>
                <ShieldAlert className={`h-5 w-5 ${
                  stats.breachedCount > 0 ? 'text-red-400' : 'text-green-400'
                }`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${
                  stats.breachedCount > 0 ? 'text-red-400' : 'text-green-400'
                }`}>
                  {stats.breachedCount}
                </div>
                <p className={`text-xs ${
                  stats.breachedCount > 0 ? 'text-red-300' : 'text-green-300'
                } mt-1`}>
                  {stats.breachedCount > 0 ? 'Needs attention' : 'All secure'}
                </p>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="link" 
                  size="sm" 
                  className={`${
                    stats.breachedCount > 0 ? 'text-red-400' : 'text-green-400'
                  } p-0`} 
                  asChild
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
                <CardTitle className="text-sm font-medium text-blue-300">
                  Security Score
                </CardTitle>
                <Shield className="h-5 w-5 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl text-gray-100 font-bold">{securityScore}/100</div>
                <Progress 
                  value={securityScore} 
                  className="h-2 mt-3 bg-blue-900/50"
                  indicatorClassName="bg-blue-500"
                />
                <p className="text-xs text-blue-300 mt-2">
                  {securityScore > 80 ? 'Excellent' : securityScore > 60 ? 'Good' : 'Needs improvement'}
                </p>
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
                    <CardTitle className="text-lg text-gray-100">Security Alerts</CardTitle>
                  </div>
                  <Badge variant="warning" className="text-xs text-gray-500">
                    {stats.breachedCount > 0 || !isVerified ? 'Action Needed' : 'All Clear'}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  {stats.breachedCount > 0 && (
                    <div className="flex items-start gap-3 p-4 bg-red-900/20 rounded-lg border border-red-900/50">
                      <ShieldAlert className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold">Breached Apps Detected</h4>
                        <p className="text-sm text-red-300 mt-1">
                          You have {stats.breachedCount} app(s) that appeared in data breaches. 
                          Consider changing passwords for these services immediately.
                        </p>
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="text-red-400 p-0 mt-2" 
                          asChild
                        >
                          <Link to="/app-tracker">
                            View affected apps <ArrowRight className="h-4 w-4 ml-1" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  )}

                  {!isVerified && (
                    <div className="flex items-start gap-3 p-4 bg-blue-900/20 rounded-lg border border-blue-900/50">
                      <Mail className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold">Email Not Verified</h4>
                        <p className="text-sm text-blue-300 mt-1">
                          Verify your email to ensure account security and full feature access.
                        </p>
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="text-blue-400 p-0 mt-2" 
                          asChild
                        >
                          <Link to="/verify-email">
                            Verify email <ArrowRight className="h-4 w-4 ml-1" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  )}

                  {stats.breachedCount === 0 && isVerified && (
                    <div className="flex items-center gap-3 p-4 bg-green-900/20 rounded-lg border border-green-900/50">
                      <Shield className="h-5 w-5 text-green-400" />
                      <p className="text-sm text-green-300">
                        No critical security issues detected. Your accounts are secure.
                      </p>
                    </div>
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
                  <CardTitle className="text-lg">Risk Summary</CardTitle>
                  <CardDescription className="text-blue-300">
                    Overview of potential vulnerabilities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-red-400">
                        {stats.riskSummary?.critical || 0}
                      </div>
                      <div className="text-xs text-red-300">Critical</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-400">
                        {stats.riskSummary?.high || 0}
                      </div>
                      <div className="text-xs text-orange-300">High</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-400">
                        {stats.riskSummary?.medium || 0}
                      </div>
                      <div className="text-xs text-yellow-300">Medium</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-400">
                        {stats.riskSummary?.low || 0}
                      </div>
                      <div className="text-xs text-green-300">Low</div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Password Strength</span>
                        <span>82%</span>
                      </div>
                      <Progress 
                        value={82} 
                        className="h-2 bg-blue-900/50"
                        indicatorClassName="bg-green-500"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>2FA Adoption</span>
                        <span>45%</span>
                      </div>
                      <Progress 
                        value={45} 
                        className="h-2 bg-blue-900/50"
                        indicatorClassName="bg-yellow-500"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Unique Passwords</span>
                        <span>67%</span>
                      </div>
                      <Progress 
                        value={67} 
                        className="h-2 bg-blue-900/50"
                        indicatorClassName="bg-orange-500"
                      />
                    </div>
                  </div>
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
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    className="flex flex-col items-center justify-center h-24 gap-2 bg-blue-900/20 hover:bg-blue-900/30 border-blue-800"
                    asChild
                  >
                    <Link to="/vault">
                      <Key className="h-6 w-6 text-blue-400" />
                      <span>Add Vault Item</span>
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex flex-col items-center justify-center h-24 gap-2 bg-purple-900/20 hover:bg-purple-900/30 border-purple-800"
                    asChild
                  >
                    <Link to="/app-tracker">
                      <Fingerprint className="h-6 w-6 text-purple-400" />
                      <span>Track App</span>
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex flex-col items-center justify-center h-24 gap-2 bg-red-900/20 hover:bg-red-900/30 border-red-800"
                    asChild
                  >
                    <Link to="/breach-check">
                      <ShieldAlert className="h-6 w-6 text-red-400" />
                      <span>Check Breaches</span>
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex flex-col items-center justify-center h-24 gap-2 bg-green-900/20 hover:bg-green-900/30 border-green-800"
                    asChild
                  >
                    <Link to="/fake-data">
                      <User className="h-6 w-6 text-green-400" />
                      <span>Generate Data</span>
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
                  <CardTitle className="text-lg">Email Breach Scan</CardTitle>
                  <CardDescription className="text-blue-300">
                    Check if your email appears in known data breaches
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {scanResult ? (
                        scanResult.breachesFound ? (
                          <>
                            <ShieldAlert className="h-5 w-5 text-red-400" />
                            <span className="text-red-400">Breaches Found</span>
                          </>
                        ) : (
                          <>
                            <Shield className="h-5 w-5 text-green-400" />
                            <span className="text-green-400">No Breaches</span>
                          </>
                        )
                      ) : (
                        <>
                          <AlertTriangle className="h-5 w-5 text-yellow-400" />
                          <span className="text-yellow-400">Not Scanned</span>
                        </>
                      )}
                    </div>
                    {scanResult?.date && (
                      <span className="text-xs text-blue-300">
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
                        <div className="text-sm text-red-300">
                          {scanResult.count === 1 ? 'Breach Found' : 'Breaches Found'}
                        </div>
                      </div>
                    ) : scanResult ? (
                      <div className="text-center py-4 bg-green-900/20 rounded-lg">
                        <div className="text-3xl font-bold text-green-400 mb-1">
                          ✓
                        </div>
                        <div className="text-sm text-green-300">
                          No breaches detected
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4 bg-blue-900/20 rounded-lg">
                        <div className="text-sm text-blue-300">
                          Run a scan to check for breaches
                        </div>
                      </div>
                    )}
                  </div>

                  <Button 
                    onClick={handleQuickScan}
                    disabled={isScanning}
                    className="w-full bg-blue-600 hover:bg-blue-700"
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
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default DashboardPage;