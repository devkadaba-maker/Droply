import { Button } from "@heroui/button"
import { Card, CardBody } from "@heroui/card"
import { 
  Cloud, 
  Shield, 
  Zap, 
  Share2, 
  ArrowRight,
  Check
} from "lucide-react"
import Link from "next/link"

export default function Home() {
  const features = [
    {
      icon: <Cloud className="h-8 w-8 text-blue-500" />,
      title: "Secure Cloud Storage",
      description: "Store your files safely in the cloud with enterprise-grade security"
    },
    {
      icon: <Shield className="h-8 w-8 text-green-500" />,
      title: "End-to-End Encryption",
      description: "Your files are encrypted both in transit and at rest for maximum security"
    },
    {
      icon: <Zap className="h-8 w-8 text-yellow-500" />,
      title: "Lightning Fast",
      description: "Upload, download, and access your files instantly from anywhere"
    },
    {
      icon: <Share2 className="h-8 w-8 text-purple-500" />,
      title: "Easy Sharing",
      description: "Share files and folders with others effortlessly and securely"
    }
  ]

  const benefits = [
    "Access files from any device",
    "Automatic backup and sync",
    "Collaborative file sharing",
    "Advanced search capabilities",
    "Version history tracking",
    "Mobile and desktop apps"
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cloud className="h-8 w-8 text-blue-500" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Droply</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/sign-in">
            <Button variant="light">Sign In</Button>
          </Link>
          <Link href="/sign-up">
            <Button color="primary">Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Your Files,
            <span className="text-blue-500"> Everywhere</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Droply makes it easy to store, sync, and share your files across all your devices. 
            Access your content from anywhere with our secure cloud storage solution.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up">
              <Button 
                color="primary" 
                size="lg"
                endContent={<ArrowRight className="h-5 w-5" />}
                className="min-w-48"
              >
                Start Free Today
              </Button>
            </Link>
            <Button 
              variant="bordered" 
              size="lg"
              className="min-w-48"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Why Choose Droply?
          </h3>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Built with modern technology and security best practices to keep your data safe and accessible.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg">
              <CardBody className="text-center p-8">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h4>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-white dark:bg-gray-800 py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Everything you need for file management
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Droply provides all the tools you need to organize, share, and collaborate 
                on your files with ease and security.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-8 rounded-2xl text-white">
              <h4 className="text-2xl font-bold mb-4">Ready to get started?</h4>
              <p className="text-blue-100 mb-6">
                Join thousands of users who trust Droply with their important files.
              </p>
              <Link href="/sign-up">
                <Button 
                  color="secondary" 
                  size="lg"
                  className="w-full"
                  endContent={<ArrowRight className="h-5 w-5" />}
                >
                  Create Your Account
                </Button>
              </Link>
              <p className="text-sm text-blue-100 mt-4 text-center">
                No credit card required • Free plan available
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Cloud className="h-6 w-6 text-blue-400" />
              <span className="text-xl font-bold">Droply</span>
            </div>
            <p className="text-gray-400 text-center md:text-right">
              © 2024 Droply. Secure cloud storage for everyone.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}