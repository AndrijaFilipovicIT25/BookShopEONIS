import { useState, useEffect } from 'react'
import {
  Box, Typography, TextField, Button, Card, CardContent,
  Grid, Alert, CircularProgress, Divider, Avatar
} from '@mui/material'
import PersonIcon from '@mui/icons-material/Person'
import SaveIcon from '@mui/icons-material/Save'
import { usersApi } from '../../api'

export default function Profile() {
  const [form, setForm] = useState({
    firstName: '', lastName: '',
    addressLine1: '', addressLine2: '',
    city: '', postalCode: '', country: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [email, setEmail] = useState('')

  useEffect(() => {
    usersApi.getMe().then(res => {
      const u = res.data
      setEmail(u.email)
      setForm({
        firstName: u.firstName || '',
        lastName: u.lastName || '',
        addressLine1: u.addressLine1 || '',
        addressLine2: u.addressLine2 || '',
        city: u.city || '',
        postalCode: u.postalCode || '',
        country: u.country || '',
      })
    }).catch(() => setError('Failed to load profile.'))
      .finally(() => setLoading(false))
  }, [])

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)
    try {
      await usersApi.updateMe(form)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch {
      setError('Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}>
          <PersonIcon sx={{ fontSize: 36 }} />
        </Avatar>
        <Box>
          <Typography variant="h4" fontWeight={700}>My Profile</Typography>
          <Typography color="text.secondary">{email}</Typography>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>Profile updated successfully!</Alert>}

      <Box component="form" onSubmit={handleSubmit}>
        <Card elevation={2} sx={{ mb: 3 }}>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6" fontWeight={700}>Personal Info</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField label="First Name" value={form.firstName} onChange={set('firstName')} fullWidth required />
              </Grid>
              <Grid item xs={6}>
                <TextField label="Last Name" value={form.lastName} onChange={set('lastName')} fullWidth required />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card elevation={2} sx={{ mb: 3 }}>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6" fontWeight={700}>Default Address</Typography>
            <Typography variant="body2" color="text.secondary">This will be preloaded at checkout.</Typography>
            <TextField label="Address Line 1" value={form.addressLine1} onChange={set('addressLine1')} fullWidth />
            <TextField label="Address Line 2 (optional)" value={form.addressLine2} onChange={set('addressLine2')} fullWidth />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField label="City" value={form.city} onChange={set('city')} fullWidth />
              </Grid>
              <Grid item xs={6}>
                <TextField label="Postal Code" value={form.postalCode} onChange={set('postalCode')} fullWidth />
              </Grid>
            </Grid>
            <TextField label="Country" value={form.country} onChange={set('country')} fullWidth />
          </CardContent>
        </Card>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="submit" variant="contained" size="large" startIcon={<SaveIcon />} disabled={saving}>
            {saving ? <CircularProgress size={22} color="inherit" /> : 'Save Changes'}
          </Button>
        </Box>
      </Box>
    </Box>
  )
}
