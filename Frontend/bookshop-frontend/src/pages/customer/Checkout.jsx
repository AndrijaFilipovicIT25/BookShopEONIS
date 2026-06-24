import { useState, useEffect } from 'react'
import {
  Box, Typography, Button, Grid, TextField, Card, CardContent,
  Divider, Alert, CircularProgress, Stepper, Step, StepLabel
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import LockIcon from '@mui/icons-material/Lock'
import { useNavigate } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { ordersApi, usersApi } from '../../api'

const stripePromise = loadStripe('pk_test_51Tl9t5KMme6usLuAqXBdVgw1Anhxs5LJQ7NKI0bSSTEfzPvGCQfjaJ7CmzVPH2qCDjl2Rd7iVVycTHFDAYeCVw7200e9BZvatl')

const steps = ['Shipping', 'Payment', 'Confirmation']

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': { color: '#aab7c4' },
    },
    invalid: { color: '#9e2146' },
  },
}

// ── Payment form (must be inside Elements) ────────────────────────────────────
function PaymentForm({ clientSecret, total, onSuccess, onBack }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handlePay = async () => {
    if (!stripe || !elements) return
    setLoading(true)
    setError('')

    const cardElement = elements.getElement(CardElement)

    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: cardElement }
    })

    if (stripeError) {
      setError(stripeError.message)
      setLoading(false)
    } else if (paymentIntent.status === 'succeeded') {
      onSuccess()
    }
  }

  return (
    <Card elevation={2}>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography variant="h6" fontWeight={700}>Payment</Typography>

        <Alert severity="info">
          Test card: <strong>4242 4242 4242 4242</strong> — any future date, any CVC.
        </Alert>

        {error && <Alert severity="error">{error}</Alert>}

        <Box sx={{
          border: '1px solid #e0e0e0', borderRadius: 1, p: 2,
          '&:focus-within': { borderColor: 'primary.main', boxShadow: '0 0 0 2px rgba(26,35,126,0.2)' }
        }}>
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </Box>

        <Button
          variant="contained"
          size="large"
          startIcon={<LockIcon />}
          onClick={handlePay}
          disabled={loading || !stripe}
        >
          {loading ? <CircularProgress size={22} color="inherit" /> : `Pay $${total.toFixed(2)}`}
        </Button>
        <Button onClick={onBack}>Back to Shipping</Button>
      </CardContent>
    </Card>
  )
}

// ── Main Checkout component ───────────────────────────────────────────────────
export default function Checkout() {
  const navigate = useNavigate()
  const { isLoggedIn } = useAuth()
  const { cart, clearCart } = useCart()

  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [clientSecret, setClientSecret] = useState('')

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '',
    addressLine1: '', addressLine2: '',
    city: '', postalCode: '', country: '',
  })

  useEffect(() => {
    if (isLoggedIn) {
      usersApi.getMe().then(res => {
        const u = res.data
        setForm(f => ({
          ...f,
          firstName: u.firstName || '',
          lastName: u.lastName || '',
          email: u.email || '',
          addressLine1: u.addressLine1 || '',
          addressLine2: u.addressLine2 || '',
          city: u.city || '',
          postalCode: u.postalCode || '',
          country: u.country || '',
        }))
      }).catch(() => {})
    }
  }, [isLoggedIn])

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const items = cart?.items || []
  const total = cart?.total ?? 0

  const handleShippingSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const payload = {
        guestEmail: isLoggedIn ? null : form.email,
        guestFirstName: isLoggedIn ? null : form.firstName,
        guestLastName: isLoggedIn ? null : form.lastName,
        addressLine1: form.addressLine1,
        addressLine2: form.addressLine2 || null,
        city: form.city,
        postalCode: form.postalCode,
        country: form.country,
        items: items.map(i => ({
          bookId: i.bookId,
          bookTitle: i.bookTitle,
          unitPrice: i.unitPrice,
          quantity: i.quantity,
        }))
      }
      const res = await ordersApi.checkout(payload)
      setClientSecret(res.data.clientSecret)
      setStep(1)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create order.')
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSuccess = () => {
    clearCart()
    setStep(2)
  }

  if (items.length === 0 && step === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 10 }}>
        <Typography variant="h5" gutterBottom>Your cart is empty</Typography>
        <Button variant="contained" onClick={() => navigate('/books')}>Browse Books</Button>
      </Box>
    )
  }

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 3 }}>Back</Button>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 4 }}>Checkout</Typography>

      <Stepper activeStep={step} sx={{ mb: 5 }}>
        {steps.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
      </Stepper>

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}

      <Grid container spacing={4}>
        <Grid item xs={12} md={7}>

          {/* Step 0 — Shipping */}
          {step === 0 && (
            <Box component="form" onSubmit={handleShippingSubmit}>
              <Card elevation={2}>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography variant="h6" fontWeight={700}>Shipping Information</Typography>

                  {!isLoggedIn && (
                    <>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <TextField label="First Name" value={form.firstName} onChange={set('firstName')} fullWidth required />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField label="Last Name" value={form.lastName} onChange={set('lastName')} fullWidth required />
                        </Grid>
                      </Grid>
                      <TextField label="Email" type="email" value={form.email} onChange={set('email')} fullWidth required />
                    </>
                  )}

                  <TextField label="Address Line 1" value={form.addressLine1} onChange={set('addressLine1')} fullWidth required />
                  <TextField label="Address Line 2 (optional)" value={form.addressLine2} onChange={set('addressLine2')} fullWidth />
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField label="City" value={form.city} onChange={set('city')} fullWidth required />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField label="Postal Code" value={form.postalCode} onChange={set('postalCode')} fullWidth required />
                    </Grid>
                  </Grid>
                  <TextField label="Country" value={form.country} onChange={set('country')} fullWidth required />

                  <Button type="submit" variant="contained" size="large" disabled={loading} sx={{ mt: 1 }}>
                    {loading ? <CircularProgress size={22} color="inherit" /> : 'Continue to Payment'}
                  </Button>
                </CardContent>
              </Card>
            </Box>
          )}

          {/* Step 1 — Stripe Payment */}
          {step === 1 && clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentForm
                clientSecret={clientSecret}
                total={total}
                onSuccess={handlePaymentSuccess}
                onBack={() => setStep(0)}
              />
            </Elements>
          )}

          {/* Step 2 — Confirmation */}
          {step === 2 && (
            <Card elevation={2}>
              <CardContent sx={{ textAlign: 'center', py: 5 }}>
                <Typography variant="h4" sx={{ mb: 2 }}>🎉</Typography>
                <Typography variant="h5" fontWeight={700} gutterBottom>Order Confirmed!</Typography>
                <Typography color="text.secondary" sx={{ mb: 4 }}>
                  Thank you for your purchase. Your order has been placed successfully.
                </Typography>
                {isLoggedIn && (
                  <Button variant="outlined" onClick={() => navigate('/orders')} sx={{ mr: 2 }}>
                    View My Orders
                  </Button>
                )}
                <Button variant="contained" onClick={() => navigate('/books')}>
                  Continue Shopping
                </Button>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Order Summary */}
        {step < 2 && (
          <Grid item xs={12} md={5}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>Order Summary</Typography>
                <Divider sx={{ mb: 2 }} />
                {items.map(item => (
                  <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>{item.bookTitle}</Typography>
                      <Typography variant="caption" color="text.secondary">Qty: {item.quantity}</Typography>
                    </Box>
                    <Typography variant="body2">${item.subtotal.toFixed(2)}</Typography>
                  </Box>
                ))}
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography fontWeight={700}>Total</Typography>
                  <Typography fontWeight={700} color="primary">${total.toFixed(2)}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  )
}
