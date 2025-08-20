"use client"

import { useState } from 'react'
import { useUser, useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Card, CardBody, CardHeader } from "@heroui/card"
import { Button } from "@heroui/button"
import { Input } from "@heroui/input"
import { Switch } from "@heroui/switch"
import { Tabs, Tab } from "@heroui/tabs"
import { Avatar } from "@heroui/avatar"
import { 
  User, 
  Shield, 
  Bell, 
  Palette, 
  HardDrive,
  ArrowLeft,
  Save,
  Trash2,
  Eye,
  EyeOff
} from "lucide-react"
import Link from "next/link"
import { useTheme } from "next-themes"

export default function SettingsPage() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      setIsLoading(true)
      try {
        await user?.delete()
        router.push('/')
      } catch (error) {
        console.error('Error deleting account:', error)
        setIsLoading(false)
      }
    }
  }

  const handleEmptyTrash = async () => {
    if (window.confirm('Are you sure you want to permanently delete all files in trash?')) {
      try {
        const response = await fetch('/api/files/empty-trash', {
          method: 'DELETE'
        })
        if (response.ok) {
          alert('Trash emptied successfully')
        }
      } catch (error) {
        console.error('Error emptying trash:', error)
      }
    }
  }

  const storageUsed = 2.3 // GB - this would come from your backend
  const storageLimit = 15 // GB

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button isIconOnly variant="light">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
            <p className="text-gray-500 dark:text-gray-400">Manage your account and preferences</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <Tabs aria-label="Settings tabs" color="primary" variant="underlined">
          {/* Profile Tab */}
          <Tab
            key="profile"
            title={
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Profile</span>
              </div>
            }
          >
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Profile Information</h3>
                </CardHeader>
                <CardBody className="space-y-6">
                  <div className="flex items-center gap-6">
                    <Avatar
                      src={user?.imageUrl}
                      name={user?.firstName || user?.emailAddresses[0]?.emailAddress}
                      size="lg"
                      className="w-20 h-20"
                    />
                    <div>
                      <Button color="primary" variant="bordered">
                        Change Photo
                      </Button>
                      <p className="text-sm text-gray-500 mt-2">
                        JPG, GIF or PNG. 1MB max.
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      label="First Name"
                      value={user?.firstName || ''}
                      disabled
                    />
                    <Input
                      label="Last Name"
                      value={user?.lastName || ''}
                      disabled
                    />
                  </div>

                  <Input
                    label="Email"
                    value={user?.emailAddresses[0]?.emailAddress || ''}
                    disabled
                  />

                  <div className="flex justify-end">
                    <Button color="primary" startContent={<Save className="h-4 w-4" />}>
                      Save Changes
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </div>
          </Tab>

          {/* Security Tab */}
          <Tab
            key="security"
            title={
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>Security</span>
              </div>
            }
          >
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Password & Authentication</h3>
                </CardHeader>
                <CardBody className="space-y-6">
                  <div>
                    <Input
                      label="Current Password"
                      type={showPassword ? "text" : "password"}
                      endContent={
                        <Button
                          isIconOnly
                          variant="light"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      }
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      label="New Password"
                      type="password"
                    />
                    <Input
                      label="Confirm New Password"
                      type="password"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div>
                      <h4 className="font-medium">Two-Factor Authentication</h4>
                      <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                    </div>
                    <Switch
                      isSelected={twoFactorEnabled}
                      onValueChange={setTwoFactorEnabled}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button color="primary">Update Password</Button>
                  </div>
                </CardBody>
              </Card>
            </div>
          </Tab>

          {/* Notifications Tab */}
          <Tab
            key="notifications"
            title={
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span>Notifications</span>
              </div>
            }
          >
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Notification Preferences</h3>
                </CardHeader>
                <CardBody className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Email Notifications</h4>
                      <p className="text-sm text-gray-500">Receive email updates about your files</p>
                    </div>
                    <Switch
                      isSelected={emailNotifications}
                      onValueChange={setEmailNotifications}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Push Notifications</h4>
                      <p className="text-sm text-gray-500">Receive push notifications in your browser</p>
                    </div>
                    <Switch
                      isSelected={pushNotifications}
                      onValueChange={setPushNotifications}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">File Share Notifications</h4>
                      <p className="text-sm text-gray-500">Get notified when someone shares files with you</p>
                    </div>
                    <Switch defaultSelected />
                  </div>

                  <div className="flex justify-end">
                    <Button color="primary">Save Preferences</Button>
                  </div>
                </CardBody>
              </Card>
            </div>
          </Tab>

          {/* Appearance Tab */}
          <Tab
            key="appearance"
            title={
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                <span>Appearance</span>
              </div>
            }
          >
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Theme & Display</h3>
                </CardHeader>
                <CardBody className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-3">Theme</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <Button
                        variant={theme === 'light' ? 'solid' : 'bordered'}
                        color={theme === 'light' ? 'primary' : 'default'}
                        onClick={() => setTheme('light')}
                        className="h-20 flex-col"
                      >
                        <div className="w-8 h-8 rounded bg-white border-2 border-gray-300 mb-2"></div>
                        Light
                      </Button>
                      <Button
                        variant={theme === 'dark' ? 'solid' : 'bordered'}
                        color={theme === 'dark' ? 'primary' : 'default'}
                        onClick={() => setTheme('dark')}
                        className="h-20 flex-col"
                      >
                        <div className="w-8 h-8 rounded bg-gray-800 border-2 border-gray-600 mb-2"></div>
                        Dark
                      </Button>
                      <Button
                        variant={theme === 'system' ? 'solid' : 'bordered'}
                        color={theme === 'system' ? 'primary' : 'default'}
                        onClick={() => setTheme('system')}
                        className="h-20 flex-col"
                      >
                        <div className="w-8 h-8 rounded bg-gradient-to-r from-white to-gray-800 border-2 border-gray-400 mb-2"></div>
                        System
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          </Tab>

          {/* Storage Tab */}
          <Tab
            key="storage"
            title={
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4" />
                <span>Storage</span>
              </div>
            }
          >
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Storage Usage</h3>
                </CardHeader>
                <CardBody className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Used Storage</span>
                      <span className="text-sm text-gray-500">
                        {storageUsed} GB of {storageLimit} GB
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div 
                        className="bg-primary h-3 rounded-full transition-all duration-300"
                        style={{ width: `${(storageUsed / storageLimit) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 text-center">
                    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <h4 className="font-semibold text-lg">1.8 GB</h4>
                      <p className="text-sm text-gray-500">Files</p>
                    </div>
                    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <h4 className="font-semibold text-lg">0.3 GB</h4>
                      <p className="text-sm text-gray-500">Images</p>
                    </div>
                    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <h4 className="font-semibold text-lg">0.2 GB</h4>
                      <p className="text-sm text-gray-500">Trash</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      color="warning"
                      variant="bordered"
                      startContent={<Trash2 className="h-4 w-4" />}
                      onClick={handleEmptyTrash}
                    >
                      Empty Trash
                    </Button>
                    <Button color="primary" variant="bordered">
                      Upgrade Storage
                    </Button>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-red-600">Danger Zone</h3>
                </CardHeader>
                <CardBody>
                  <div className="p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20">
                    <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
                      Delete Account
                    </h4>
                    <p className="text-sm text-red-600 dark:text-red-300 mb-4">
                      Once you delete your account, there is no going back. All your files will be permanently deleted.
                    </p>
                    <Button
                      color="danger"
                      variant="bordered"
                      startContent={<Trash2 className="h-4 w-4" />}
                      onClick={handleDeleteAccount}
                      isLoading={isLoading}
                    >
                      Delete Account
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </div>
          </Tab>
        </Tabs>
      </div>
    </div>
  )
}
