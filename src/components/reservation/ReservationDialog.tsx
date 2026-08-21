import { useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export type ReservationValues = {
  date: string
  price: number
  airline: string | null
  expiryIso: string | null
}

type ReservationDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  initial?: { date?: string; price?: string; airline?: string; expiry?: string }
  onSave: (values: ReservationValues) => void | Promise<void>
  error?: string | null
}

const today = () => new Date().toISOString().slice(0, 10)

export function ReservationDialog({ open, onOpenChange, title, initial, onSave, error }: ReservationDialogProps) {
  const [prevOpen, setPrevOpen] = useState(open)
  const [date, setDate] = useState(initial?.date || today())
  const [price, setPrice] = useState(initial?.price ?? '')
  const [airline, setAirline] = useState(initial?.airline ?? '')
  const [expiry, setExpiry] = useState(initial?.expiry ?? '')
  const [saving, setSaving] = useState(false)

  // Reset fields to this reservation's values every time the dialog opens --
  // it's one shared component reused for both "make a reservation" and
  // "re-quote an existing one." Adjusted during render rather than in an
  // effect, per React's guidance for resetting state on a prop change.
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      setDate(initial?.date || today())
      setPrice(initial?.price ?? '')
      setAirline(initial?.airline ?? '')
      setExpiry(initial?.expiry ?? '')
    }
  }

  async function handleSave() {
    const numPrice = Number(price)
    if (!numPrice || !date) return
    setSaving(true)
    await onSave({ date, price: numPrice, airline: airline.trim() || null, expiryIso: expiry ? new Date(expiry).toISOString() : null })
    setSaving(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Log the reservation so the team can track price and expiry over time.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="res-date">Date made</Label>
            <Input id="res-date" type="date" value={date} max={today()} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="res-price">Price</Label>
            <Input id="res-price" type="number" min="0" step="0.01" placeholder="0.00" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="res-airline">Airline</Label>
            <Input id="res-airline" placeholder="e.g. Turkish Airlines" value={airline} onChange={(e) => setAirline(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="res-expiry">Expires</Label>
            <Input id="res-expiry" type="datetime-local" value={expiry} onChange={(e) => setExpiry(e.target.value)} aria-label="Reservation expiry" />
          </div>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !price || !date}>{saving ? 'Saving...' : 'Save'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
