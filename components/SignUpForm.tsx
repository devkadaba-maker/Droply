import { SignUp } from "@clerk/nextjs";

export default function SignUpForm() {
  return (
    <section className="bg-white">
      <div className="lg:grid lg:min-h-screen lg:grid-cols-12">
        {/* Left Branding Section */}
        <section className="relative flex h-32 items-end bg-gray-900 lg:col-span-5 lg:h-full xl:col-span-6">
          <div className="absolute inset-0 bg-blue-600 opacity-80 z-10"></div>
          
          <img
            alt="Background"
            src="https://images.unsplash.com/photo-1585399009939-5381f14120e5?q=80&w=2940&auto=format&fit=crop"
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="hidden lg:relative lg:block lg:p-12 z-20">
            <a className="flex items-center gap-2" href="/">
                <svg className="h-10 w-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                <span className="text-3xl font-bold text-white">Droply</span>
            </a>

            <h2 className="mt-6 text-2xl font-bold text-white sm:text-3xl md:text-4xl">
              Create Your Account
            </h2>

            <p className="mt-4 leading-relaxed text-white/90">
              Get started with your secure and simple cloud storage solution today.
            </p>
          </div>
        </section>

        {/* Right Sign-Up Form Section */}
        <main className="flex items-center justify-center px-8 py-8 sm:px-12 lg:col-span-7 lg:px-16 lg:py-12 xl:col-span-6">
          <div className="max-w-xl lg:max-w-3xl">
            {/* Mobile Logo */}
            <div className="relative -mt-16 block lg:hidden">
              <a
                className="inline-flex size-16 items-center justify-center rounded-full bg-white text-blue-600 sm:size-20"
                href="/"
              >
                <span className="sr-only">Home</span>
                <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
              </a>

              <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl">
                Create Your Account
              </h1>
            </div>

            {/* Clerk Sign-Up Component with Custom Styling */}
            <SignUp
              path="/sign-up"
              appearance={{
                elements: {
                  formButtonPrimary: 
                    'bg-blue-600 hover:bg-blue-700 text-sm normal-case',
                  card: 
                    'shadow-none border-none bg-transparent',
                  rootBox:
                    'border-none',
                  headerTitle:
                    'hidden',
                  headerSubtitle:
                    'hidden',
                  socialButtonsBlockButton:
                    'border-slate-200',
                  dividerLine:
                    'bg-slate-200',
                  dividerText:
                    'text-slate-500',
                  formFieldInput:
                    'rounded-lg',
                  footerActionText:
                    'text-slate-500',
                  footerActionLink:
                    'text-blue-600 hover:text-blue-700 font-medium'
                },
              }}
            />
          </div>
        </main>
      </div>
    </section>
  );
}