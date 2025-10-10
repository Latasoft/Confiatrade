import { SignUp } from '@clerk/nextjs'
import { BackgroundWrapper } from '@/components/ui/BackgroundWrapper'

export default function Page() {
  return (
    <BackgroundWrapper>
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        {/* Header con glass effect */}
        <div className="bg-white/20 dark:bg-gray-900/20 backdrop-blur-xl rounded-3xl p-8 mb-8 border border-white/30 dark:border-gray-700/30 text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-2">
            ¡Únete a ConfiaTrade!
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Crea tu cuenta y comienza a comercializar
          </p>
        </div>
        
        {/* Clerk SignUp Component */}
        <div className="bg-white/20 dark:bg-gray-900/20 backdrop-blur-xl rounded-3xl p-2 border border-white/30 dark:border-gray-700/30">
          <SignUp 
            appearance={{
              elements: {
                formButtonPrimary: 'bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-sm transition-all duration-200',
                footerActionLink: 'text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
              }
            }}
          />
        </div>
      </div>
    </BackgroundWrapper>
  )
}