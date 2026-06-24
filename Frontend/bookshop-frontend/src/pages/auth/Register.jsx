import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Box, Card, CardContent, TextField, Button,
  Typography, Alert, Divider, CircularProgress, Grid
} from '@mui/material'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import { useAuth } from '../../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    try {
      await register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
      })
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
      <Card sx={{ width: '100%', maxWidth: 480, p: 2 }} elevation={3}>
        <CardContent>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <MenuBookIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h5" fontWeight={700}>Create account</Typography>
            <Typography variant="body2" color="text.secondary">Join our bookshop today</Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="First Name"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                  fullWidth
                  autoFocus
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Last Name"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                  fullWidth
                />
              </Grid>
            </Grid>

            <TextField
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              fullWidth
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              fullWidth
              helperText="Min 8 characters, one uppercase, one number"
            />
            <TextField
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              fullWidth
              error={form.confirmPassword !== '' && form.password !== form.confirmPassword}
              helperText={
                form.confirmPassword !== '' && form.password !== form.confirmPassword
                  ? 'Passwords do not match'
                  : ''
              }
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading}
              sx={{ mt: 1 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="body2" textAlign="center">
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#1a237e', fontWeight: 600 }}>
              Sign in
            </Link>
          </Typography>

        </CardContent>
      </Card>
    </Box>
  )
}
