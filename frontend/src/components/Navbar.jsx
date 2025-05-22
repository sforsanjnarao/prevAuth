import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logoutUser } from '../api/authApi'
import { clearAuth } from '../features/authSlice'
import { toast } from 'react-toastify'
import {
  LockClosedIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  UserGroupIcon,
  UserCircleIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  ExclamationTriangleIcon,
  Squares2X2Icon,
  WrenchScrewdriverIcon,
  CogIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

function Navbar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isAuthenticated, isVerified, user } = useSelector((state) => state.auth)
  const userName = user?.name || 'User'
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logoutUser()
      dispatch(clearAuth())
      toast.success("Logged out successfully.")
      navigate('/login')
    } catch (error) {
      toast.error("Logout failed. Please try again.")
      console.error("Logout Error:", error)
      dispatch(clearAuth())
      navigate('/login')
    }
  }

  return (
    <nav className="bg-[#0a192f] fixed w-full z-50 top-0 border-b border-gray-700/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex-shrink-0 text-white font-bold text-xl bg-blue-600/20 px-3 py-1 rounded-md">
                Secure<span className="text-blue-400">Suite</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <NavigationMenu>
                  <NavigationMenuList className="gap-1">
                    {/* Dashboard Link */}
                  <NavigationMenuItem>
  <NavigationMenuLink
    asChild
    className={cn(
      navigationMenuTriggerStyle(),
      "bg-transparent hover:bg-blue-900/30 text-gray-200 hover:text-white"
    )}
  >
    <Link to="/dashboard" className="flex flex-row items-center">
      <Squares2X2Icon className="h-5 w-5 mr-2" />
      Dashboard
    </Link>
  </NavigationMenuLink>
</NavigationMenuItem>


                    {/* Tools Dropdown */}
                    <NavigationMenuItem>
                      <NavigationMenuTrigger className="bg-transparent hover:bg-blue-900/30 text-gray-200 hover:text-white data-[state=open]:bg-blue-900/30">
                        <WrenchScrewdriverIcon className="h-5 w-5 mr-2" />
                        Tools
                      </NavigationMenuTrigger>
                      <NavigationMenuContent className="bg-[#0a192f] border border-gray-700/50 rounded-lg shadow-xl">
                        <ul className="grid w-[220px] gap-1 p-2">
                          <NavLink to="/vault">
                            <NavigationMenuLink className="hover:bg-blue-900/30 p-3 rounded-md flex items-center text-gray-200 hover:text-white">
                              <LockClosedIcon className="h-5 w-5 mr-3 text-blue-400" />
                              <div>
                                <p className="font-medium">Vault</p>
                                <p className="text-xs text-gray-400">Secure password storage</p>
                              </div>
                            </NavigationMenuLink>
                          </NavLink>
                          <NavLink to="/app-tracker">
                            <NavigationMenuLink className="hover:bg-blue-900/30 p-3 rounded-md flex items-center text-gray-200 hover:text-white">
                              <ShieldCheckIcon className="h-5 w-5 mr-3 text-blue-400" />
                              <div>
                                <p className="font-medium">App Tracker</p>
                                <p className="text-xs text-gray-400">Manage app permissions</p>
                              </div>
                            </NavigationMenuLink>
                          </NavLink>
                          <NavLink to="/breach-check">
                            <NavigationMenuLink className="hover:bg-blue-900/30 p-3 rounded-md flex items-center text-gray-200 hover:text-white">
                              <ShieldExclamationIcon className="h-5 w-5 mr-3 text-blue-400" />
                              <div>
                                <p className="font-medium">Breach Check</p>
                                <p className="text-xs text-gray-400">Check data breaches</p>
                              </div>
                            </NavigationMenuLink>
                          </NavLink>
                          <NavLink to="/fakedata">
                            <NavigationMenuLink className="hover:bg-blue-900/30 p-3 rounded-md flex items-center text-gray-200 hover:text-white">
                              <UserGroupIcon className="h-5 w-5 mr-3 text-blue-400" />
                              <div>
                                <p className="font-medium">Fake Data</p>
                                <p className="text-xs text-gray-400">Generate test data</p>
                              </div>
                            </NavigationMenuLink>
                          </NavLink>
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>

                {/* User Profile Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-blue-900/30"
                    >
                      <div className="relative flex items-center gap-1">
                        <UserCircleIcon className="h-7 w-7 text-gray-300" />
                         <span className="text-gray-200 font-medium">
                        {userName.split(' ')[0]}
                      </span>
                        {!isVerified && (
                          <ExclamationTriangleIcon className="h-3 w-3 text-yellow-400 " />
                        )}
                      </div>
                     
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    className="w-56 bg-[#0a192f] border border-gray-700/50 text-gray-200 rounded-lg shadow-xl"
                    align="end"
                  >
                    <DropdownMenuItem asChild className="hover:bg-blue-900/30 focus:bg-blue-900/30">
                      <Link to="/profile" className="cursor-pointer flex items-center gap-2">
                        <UserIcon className="h-4 w-4 text-blue-400" />
                        Your Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="hover:bg-blue-900/30 focus:bg-blue-900/30">
                      <Link to="/settings" className="cursor-pointer flex items-center gap-2">
                        <CogIcon className="h-4 w-4 text-blue-400" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="cursor-pointer text-red-400 hover:bg-blue-900/30 focus:bg-blue-900/30 focus:text-red-400 flex items-center gap-2"
                    >
                      <ArrowLeftOnRectangleIcon className="h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex gap-2">
                <Button asChild variant="ghost" className="text-gray-200 hover:bg-blue-900/30 hover:text-white">
                  <Link to="/login">Log in</Link>
                </Button>
                <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Link to="/register">Sign up</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-gray-300 hover:bg-blue-900/30 hover:text-white"
                >
                  {isMobileMenuOpen ? (
                    <XMarkIcon className="h-6 w-6" />
                  ) : (
                    <Bars3Icon className="h-6 w-6" />
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent 
                side="right" 
                className="bg-[#0a192f] text-gray-200 border-l border-gray-700/50 w-full max-w-xs"
              >
                <div className="flex flex-col h-full">
                  <div className="flex-1 space-y-6 py-6">
                    {isAuthenticated ? (
                      <>
                        <div className="px-4">
                          <div className="flex items-center gap-3 mb-6 p-3 bg-blue-900/20 rounded-lg">
                            <UserCircleIcon className="h-10 w-10 text-blue-400" />
                            <div>
                              <p className="font-medium text-white">
                                {userName}
                                {!isVerified && (
                                  <ExclamationTriangleIcon className="h-4 w-4 text-yellow-400 ml-2 inline" />
                                )}
                              </p>
                              <p className="text-sm text-gray-400">Premium Member</p>
                            </div>
                          </div>
                        </div>

                        <nav className="space-y-1 px-2">
                          <NavLink
                            to="/dashboard"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={({ isActive }) =>
                              `flex items-center gap-3 px-4 py-3 rounded-lg ${isActive ? 'bg-blue-900/30 text-white' : 'hover:bg-blue-900/20 text-gray-300 hover:text-white'}`
                            }
                          >
                            <Squares2X2Icon className="h-5 w-5" />
                            Dashboard
                          </NavLink>

                          <div className="px-2">
                            <p className="text-gray-400 text-xs font-medium px-4 py-2 uppercase tracking-wider">Tools</p>
                            <div className="space-y-1">
                              <NavLink
                                to="/vault"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={({ isActive }) =>
                                  `flex items-center gap-3 px-4 py-3 rounded-lg ${isActive ? 'bg-blue-900/30 text-white' : 'hover:bg-blue-900/20 text-gray-300 hover:text-white'}`
                                }
                              >
                                <LockClosedIcon className="h-5 w-5" />
                                Vault
                              </NavLink>
                              <NavLink
                                to="/app-tracker"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={({ isActive }) =>
                                  `flex items-center gap-3 px-4 py-3 rounded-lg ${isActive ? 'bg-blue-900/30 text-white' : 'hover:bg-blue-900/20 text-gray-300 hover:text-white'}`
                                }
                              >
                                <ShieldCheckIcon className="h-5 w-5" />
                                App Tracker
                              </NavLink>
                              <NavLink
                                to="/breach-check"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={({ isActive }) =>
                                  `flex items-center gap-3 px-4 py-3 rounded-lg ${isActive ? 'bg-blue-900/30 text-white' : 'hover:bg-blue-900/20 text-gray-300 hover:text-white'}`
                                }
                              >
                                <ShieldExclamationIcon className="h-5 w-5" />
                                Breach Check
                              </NavLink>
                              <NavLink
                                to="/fakedata"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={({ isActive }) =>
                                  `flex items-center gap-3 px-4 py-3 rounded-lg ${isActive ? 'bg-blue-900/30 text-white' : 'hover:bg-blue-900/20 text-gray-300 hover:text-white'}`
                                }
                              >
                                <UserGroupIcon className="h-5 w-5" />
                                Fake Data
                              </NavLink>
                            </div>
                          </div>
                        </nav>
                      </>
                    ) : (
                      <nav className="space-y-2 px-2">
                        <NavLink
                          to="/login"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={({ isActive }) =>
                            `block px-4 py-3 rounded-lg ${isActive ? 'bg-blue-900/30 text-white' : 'hover:bg-blue-900/20 text-gray-300 hover:text-white'}`
                          }
                        >
                          Log in
                        </NavLink>
                        <NavLink
                          to="/register"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={({ isActive }) =>
                            `block px-4 py-3 rounded-lg ${isActive ? 'bg-blue-900/30 text-white' : 'hover:bg-blue-900/20 text-gray-300 hover:text-white'}`
                          }
                        >
                          Sign up
                        </NavLink>
                      </nav>
                    )}
                  </div>

                  {isAuthenticated && (
                    <div className="pb-6 px-4">
                      <Button
                        variant="outline"
                        className="w-full text-red-400 border-red-400/30 hover:bg-red-400/10 hover:text-red-300 gap-2"
                        onClick={() => {
                          handleLogout()
                          setIsMobileMenuOpen(false)
                        }}
                      >
                        <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                        Sign out
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar