import { login } from "@/lib/actions/auth"
import { LoginForm } from "@/components/Auth/LoginForm"

export const metadata = {
  title: "Login — Tohfawala CRM",
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-md space-y-8 bg-white dark:bg-black p-8 shadow rounded-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-900">Tohfawala CRM</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Sign in to your account
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
