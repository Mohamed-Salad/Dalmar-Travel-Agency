import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Stripe } from '@/components/ui/stripe'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) { setError(err.message); setLoading(false) }
    else navigate('/dashboard')
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="h-16 border-b border-border">
        <div className="mx-auto max-w-6xl h-full px-6 flex items-center">
          <Link to="/" className="font-display text-lg font-bold text-foreground">Dalmar Travel</Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="text-center mb-6">
            <h1 className="font-display text-2xl font-bold text-foreground">Agent login</h1>
            <p className="text-sm text-muted-foreground mt-1">This portal is for Dalmar Travel agents only.</p>
          </div>

          <Card className="pt-0">
            <Stripe />
            <CardHeader className="pt-6">
              <CardTitle className="sr-only">Sign in</CardTitle>
              <CardDescription className="sr-only">Enter your agent email and password</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" required type="email" value={email}
                    onChange={(e) => setEmail(e.target.value)} placeholder="agent@dalmartravel.com" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" required type="password" value={password}
                    onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                </div>
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
                <Button type="submit" disabled={loading} className="w-full mt-2">
                  {loading ? 'Signing in…' : 'Sign in'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Not an agent?{' '}
            <Link to="/" className="text-foreground font-medium hover:underline">Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
