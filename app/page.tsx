// app/page.tsx
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">F</span>
          </div>
          <span className="text-2xl font-bold text-gray-900 tracking-tight">Formify</span>
        </div>
        <div className="flex gap-4">
          <Link href="/login">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link href="/register">
            <Button>Get Started</Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 tracking-tight">
          Create forms that <br />
          <span className="text-indigo-600">actually look good.</span>
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          The most intuitive way to build, manage, and analyze your forms.
          Production-ready, beautiful, and secure.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register">
            <Button size="lg" className="px-8 py-6 text-lg rounded-xl">
              Start Building Now
            </Button>
          </Link>
          <Button variant="outline" size="lg" className="px-8 py-6 text-lg rounded-xl">
            View Sample Form
          </Button>
        </div>

        <div className="mt-20 border rounded-2xl p-2 bg-gray-50/50 max-w-5xl mx-auto shadow-2xl overflow-hidden">
          <div className="bg-white rounded-xl border shadow-sm aspect-video flex items-center justify-center text-gray-400 font-medium italic">
            Dashboard Preview Screenshot
          </div>
        </div>
      </main>
    </div>
  )
}
