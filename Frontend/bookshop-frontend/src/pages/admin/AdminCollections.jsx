import { useState, useEffect } from 'react'
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Alert, CircularProgress, Chip
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import CollectionsBookmarkIcon from '@mui/icons-material/CollectionsBookmark'
import { booksApi } from '../../api'

const empty = { name: '', description: '' }

export default function AdminCollections() {
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dialog, setDialog] = useState({ open: false, mode: 'create', data: empty })
  const [saving, setSaving] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, name: '' })

  const fetchCollections = async () => {
    try {
      const res = await booksApi.getCollections()
      setCollections(res.data)
    } catch {
      setError('Failed to load collections.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCollections() }, [])

  const openCreate = () => setDialog({ open: true, mode: 'create', data: empty })
  const openEdit = (c) => setDialog({ open: true, mode: 'edit', data: { id: c.id, name: c.name, description: c.description || '' } })
  const closeDialog = () => setDialog(d => ({ ...d, open: false }))

  const handleSave = async () => {
    setSaving(true)
    try {
      if (dialog.mode === 'create') {
        await booksApi.createCollection({ name: dialog.data.name, description: dialog.data.description })
      } else {
        await booksApi.updateCollection(dialog.data.id, { name: dialog.data.name, description: dialog.data.description })
      }
      closeDialog()
      fetchCollections()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save collection.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      await booksApi.deleteCollection(deleteDialog.id)
      setDeleteDialog({ open: false, id: null, name: '' })
      fetchCollections()
    } catch {
      setError('Failed to delete collection.')
    }
  }

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CollectionsBookmarkIcon color="primary" />
          <Typography variant="h5" fontWeight={700}>Collections</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Add Collection</Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>Name</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>Description</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {collections.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  No collections yet. Create one to group books into series.
                </TableCell>
              </TableRow>
            ) : (
              collections.map(c => (
                <TableRow key={c.id} hover>
                  <TableCell>
                    <Chip
                      icon={<CollectionsBookmarkIcon />}
                      label={c.name}
                      color="secondary"
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{c.description || '—'}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => openEdit(c)} color="primary" size="small"><EditIcon /></IconButton>
                    <IconButton onClick={() => setDeleteDialog({ open: true, id: c.id, name: c.name })} color="error" size="small"><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog */}
      <Dialog open={dialog.open} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{dialog.mode === 'create' ? 'Add Collection' : 'Edit Collection'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label="Collection Name"
            value={dialog.data.name}
            onChange={e => setDialog(d => ({ ...d, data: { ...d.data, name: e.target.value } }))}
            fullWidth required autoFocus
            helperText='e.g. "Naruto", "Harry Potter", "The Witcher"'
          />
          <TextField
            label="Description"
            value={dialog.data.description}
            onChange={e => setDialog(d => ({ ...d, data: { ...d.data, description: e.target.value } }))}
            fullWidth multiline rows={3}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving || !dialog.data.name}>
            {saving ? <CircularProgress size={20} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, id: null, name: '' })}>
        <DialogTitle>Delete Collection</DialogTitle>
        <DialogContent>
          <Typography>Delete <strong>{deleteDialog.name}</strong>?</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Books in this collection will not be deleted — they will just be removed from the collection.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteDialog({ open: false, id: null, name: '' })}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
