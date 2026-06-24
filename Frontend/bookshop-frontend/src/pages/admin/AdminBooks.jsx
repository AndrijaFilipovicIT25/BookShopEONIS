import { useState, useEffect } from 'react'
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Alert, CircularProgress,
  Chip, Avatar, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import { useNavigate } from 'react-router-dom'
import { booksApi } from '../../api'

export default function AdminBooks() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, title: '' })
  const navigate = useNavigate()

  const fetchBooks = async () => {
    try {
      const res = await booksApi.getAll(1, 100)
      setBooks(res.data)
    } catch {
      setError('Failed to load books.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchBooks() }, [])

  const handleDelete = async () => {
    try {
      await booksApi.delete(deleteDialog.id)
      setDeleteDialog({ open: false, id: null, title: '' })
      fetchBooks()
    } catch {
      setError('Failed to delete book.')
    }
  }

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Books</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/admin/books/new')}>
          Add Book
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>Book</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>Category</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>Price</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {books.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  No books yet. Add your first book.
                </TableCell>
              </TableRow>
            ) : (
              books.map(b => (
                <TableRow key={b.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar
                        src={b.frontImagePath ? `http://localhost:5003${b.frontImagePath}` : undefined}
                        variant="rounded"
                        sx={{ width: 40, height: 50, bgcolor: 'primary.light' }}
                      >
                        <MenuBookIcon fontSize="small" />
                      </Avatar>
                      <Box>
                        <Typography fontWeight={600} variant="body2">{b.title}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {b.authors?.map(a => `${a.firstName} ${a.lastName}`).join(', ')}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={b.category?.name || '—'} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    {b.discountPrice ? (
                      <Box>
                        <Typography variant="body2" fontWeight={700} color="error">${b.discountPrice.toFixed(2)}</Typography>
                        <Typography variant="caption" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>${b.price.toFixed(2)}</Typography>
                      </Box>
                    ) : (
                      <Typography fontWeight={600}>${b.price.toFixed(2)}</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={b.isAvailable ? 'Available' : 'Unavailable'}
                      color={b.isAvailable ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => navigate(`/admin/books/${b.id}/edit`)} color="primary" size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => setDeleteDialog({ open: true, id: b.id, title: b.title })} color="error" size="small">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, id: null, title: '' })}>
        <DialogTitle>Delete Book</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete <strong>{deleteDialog.title}</strong>?</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteDialog({ open: false, id: null, title: '' })}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
