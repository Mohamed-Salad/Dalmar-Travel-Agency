import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { FlightDivider } from '@/components/ui/flight-divider'
import { SiteHeader } from '@/components/ui/site-header'
import { CheckCircle2 } from 'lucide-react'

const LABEL_CLS = 'text-xs font-semibold uppercase tracking-wide text-muted-foreground'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }
    if (!data.user) {
      setError('Something went wrong creating your account. Please try again.')
      setLoading(false)
      return
    }

    // status is not sent here -- it defaults to 'pending' in the database.
    // Signing up does NOT grant portal access; an admin must approve first.
    const { error: agentError } = await supabase
      .from('agents')
      .insert({ id: data.user.id, name, email, phone: phone || null })
    if (agentError) {
      setError(agentError.message)
      setLoading(false)
      return
    }

    setLoading(false)
    setSubmitted(true)
  }

  return (
    <div className="theme-schiphol dot-field min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader variant="minimal" showAgentLink={false} />

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="text-center mb-6">
            <h1 className="font-display text-2xl font-bold text-foreground">Request agent access</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {submitted
                ? 'One more step.'
                : 'An admin reviews every request before it’s approved.'}
            </p>
          </div>

          <Card className="pt-0">
            <FlightDivider animated />
            {submitted ? (
              <CardContent className="text-center py-4">
                <CheckCircle2 className="size-10 text-primary mx-auto mb-3" />
                <p className="text-sm text-foreground font-medium">Request submitted</p>
                <p className="text-sm text-muted-foreground mt-1">
                  An admin will review your request. You'll be able to sign in once approved.
                </p>
                <Button asChild className="mt-6 w-full">
                  <Link to="/login">Back to sign in</Link>
                </Button>
              </CardContent>
            ) : (
              <>
                <CardHeader className="pt-6">
                  <CardTitle className="sr-only">Request access</CardTitle>
                  <CardDescription className="sr-only">Sign up for agent access</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="name" className={LABEL_CLS}>Full name</Label>
                      <Input id="name" required autoComplete="name" variant="underline" value={name}
                        onChange={(e) => setName(e.target.value)} placeholder="Faadumo Warsame" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="email" className={LABEL_CLS}>Email</Label>
                      <Input id="email" required type="email" autoComplete="email" variant="underline" value={email}
                        onChange={(e) => setEmail(e.target.value)} placeholder="agent@dalmartravel.com" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="phone" className={LABEL_CLS}>Phone (optional)</Label>
                      <Input id="phone" type="tel" autoComplete="tel" variant="underline" value={phone}
                        onChange={(e) => setPhone(e.target.value)} placeholder="+252 ..." />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="password" className={LABEL_CLS}>Password</Label>
                      <Input id="password" required type="password" autoComplete="new-password" variant="underline" value={password}
                        onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" minLength={6} />
                    </div>
                    {error && (
                      <p className="text-sm text-destructive">{error}</p>
                    )}
                    <Button type="submit" disabled={loading} className="w-full mt-2">
                      {loading ? 'Submitting...' : 'Request access'}
                    </Button>
                  </form>
                </CardContent>
              </>
            )}
          </Card>

          {!submitted && (
            <p className="text-center text-sm text-muted-foreground mt-6">
              Already approved?{' '}
              <Link to="/login" className="text-foreground font-medium hover:underline">Sign in</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
