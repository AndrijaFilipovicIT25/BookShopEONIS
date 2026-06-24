import { useState, useEffect } from 'react'
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Alert, CircularProgress, Chip
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { booksApi } from '../../api'

const empty = { name: '', description: '' }

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dialog, setDialog] = useState({ open: false, mode: 'create', data: empty })
  const [saving, setSaving] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, name: '' })

  const fetchCategories = async () => {
    try {
      const res = await booksApi.getCategories()
      setCategories(res.data)
    } catch {
      setError('Failed to load categories.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCategories() }, [])

  const openCreate = () => setDialog({ open: true, mode: 'create', data: empty })
  const openEdit = (cat) => setDialog({ open: true, mode: 'edit', data: { id: cat.id, name: cat.name, description: cat.description || '' } })
  const closeDialog = () => setDialog(d => ({ ...d, open: false }))

  const handleSave = async () => {
    setSaving(true)
    try {
      if (dialog.mode === 'create') {
        await booksApi.createCategory({ name: dialog.data.name, description: dialog.data.description })
      } else {
        await booksApi.updateCategory(dialog.data.id, { name: dialog.data.name, description: dialog.data.description })
      }
      closeDialog()
      fetchCategories()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save category.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      await booksApi.deleteCategory(deleteDialog.id)
      setDeleteDialog({ open: false, id: null, name: '' })
      fetchCategories()
    } catch {
      setError('Failed to delete category.')
    }
  }

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Categories</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Add Category
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* Table */}
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
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  No categories yet. Add one to get started.
                </TableCell>
              </TableRow>
            ) : (
              categories.map(cat => (
                <TableRow key={cat.id} hover>
                  <TableCell>
                    <Chip label={cat.name} size="small" color="primary" variant="outlined" />
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{cat.description || '—'}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => openEdit(cat)} color="primary" size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => setDeleteDialog({ open: true, id: cat.id, name: cat.name })} color="error" size="small">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create / Edit Dialog */}
      <Dialog open={dialog.open} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{dialog.mode === 'create' ? 'Add Category' : 'Edit Category'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label="Name"
            value={dialog.data.name}
            onChange={e => setDialog(d => ({ ...d, data: { ...d.data, name: e.target.value } }))}
            fullWidth
            required
            autoFocus
          />
          <TextField
            label="Description"
            value={dialog.data.description}
            onChange={e => setDialog(d => ({ ...d, data: { ...d.data, description: e.target.value } }))}
            fullWidth
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving || !dialog.data.name}>
            {saving ? <CircularProgress size={20} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, id: null, name: '' })}>
        <DialogTitle>Delete Category</DialogTitle>
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
