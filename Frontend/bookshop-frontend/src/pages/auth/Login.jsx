import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Box, Card, CardContent, TextField, Button,
  Typography, Alert, Divider, CircularProgress
} from '@mui/material'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      if (user?.role === 'Admin') navigate('/admin')
      else navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
      <Card sx={{ width: '100%', maxWidth: 420, p: 2 }} elevation={3}>
        <CardContent>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <MenuBookIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h5" fontWeight={700}>Welcome back</Typography>
            <Typography variant="body2" color="text.secondary">Sign in to your account</Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              fullWidth
              autoFocus
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              fullWidth
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading}
              sx={{ mt: 1 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="body2" textAlign="center">
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#1a237e', fontWeight: 600 }}>
              Create one
            </Link>
          </Typography>

        </CardContent>
      </Card>
    </Box>
  )
}
