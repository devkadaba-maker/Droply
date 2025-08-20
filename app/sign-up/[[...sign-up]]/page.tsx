import SignUpForm from '@/components/SignUpForm'
import React from 'react'

const SignUpPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Droply</h2>
          <p className="text-gray-600 dark:text-gray-400">Your secure cloud storage</p>
        </div>
        <SignUpForm/>
      </div>
    </div>
  )
}

export default SignUpPage