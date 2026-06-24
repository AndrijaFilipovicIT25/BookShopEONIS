import { useState, useEffect } from 'react'
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Alert, CircularProgress, Avatar
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import PersonIcon from '@mui/icons-material/Person'
import { booksApi } from '../../api'

const empty = { firstName: '', lastName: '', bio: '' }

export default function AdminAuthors() {
  const [authors, setAuthors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dialog, setDialog] = useState({ open: false, mode: 'create', data: empty })
  const [saving, setSaving] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, name: '' })

  const fetchAuthors = async () => {
    try {
      const res = await booksApi.getAuthors()
      setAuthors(res.data)
    } catch {
      setError('Failed to load authors.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAuthors() }, [])

  const openCreate = () => setDialog({ open: true, mode: 'create', data: empty })
  const openEdit = (a) => setDialog({ open: true, mode: 'edit', data: { id: a.id, firstName: a.firstName, lastName: a.lastName, bio: a.bio || '' } })
  const closeDialog = () => setDialog(d => ({ ...d, open: false }))

  const handleSave = async () => {
    setSaving(true)
    try {
      if (dialog.mode === 'create') {
        await booksApi.createAuthor(dialog.data)
      } else {
        await booksApi.updateAuthor(dialog.data.id, dialog.data)
      }
      closeDialog()
      fetchAuthors()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save author.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      await booksApi.deleteAuthor(deleteDialog.id)
      setDeleteDialog({ open: false, id: null, name: '' })
      fetchAuthors()
    } catch {
      setError('Failed to delete author.')
    }
  }

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Authors</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Add Author</Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>Author</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>Bio</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {authors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  No authors yet.
                </TableCell>
              </TableRow>
            ) : (
              authors.map(a => (
                <TableRow key={a.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ bgcolor: 'primary.light', width: 36, height: 36 }}>
                        <PersonIcon fontSize="small" />
                      </Avatar>
                      <Typography fontWeight={600}>{a.firstName} {a.lastName}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary', maxWidth: 300 }}>
                    <Typography noWrap>{a.bio || '—'}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => openEdit(a)} color="primary" size="small"><EditIcon /></IconButton>
                    <IconButton onClick={() => setDeleteDialog({ open: true, id: a.id, name: `${a.firstName} ${a.lastName}` })} color="error" size="small"><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog */}
      <Dialog open={dialog.open} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{dialog.mode === 'create' ? 'Add Author' : 'Edit Author'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="First Name"
              value={dialog.data.firstName}
              onChange={e => setDialog(d => ({ ...d, data: { ...d.data, firstName: e.target.value } }))}
              fullWidth required autoFocus
            />
            <TextField
              label="Last Name"
              value={dialog.data.lastName}
              onChange={e => setDialog(d => ({ ...d, data: { ...d.data, lastName: e.target.value } }))}
              fullWidth required
            />
          </Box>
          <TextField
            label="Bio"
            value={dialog.data.bio}
            onChange={e => setDialog(d => ({ ...d, data: { ...d.data, bio: e.target.value } }))}
            fullWidth multiline rows={4}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving || !dialog.data.firstName || !dialog.data.lastName}>
            {saving ? <CircularProgress size={20} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, id: null, name: '' })}>
        <DialogTitle>Delete Author</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete <strong>{deleteDialog.name}</strong>?</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteDialog({ open: false, id: null, name: '' })}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
