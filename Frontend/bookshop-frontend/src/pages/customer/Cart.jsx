import { useState } from 'react'
import {
  Box, Typography, Button, Grid, Card, CardContent, IconButton,
  Divider, Alert, CircularProgress, Chip
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import DeleteIcon from '@mui/icons-material/Delete'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'

export default function Cart() {
  const navigate = useNavigate()
  const { cart, updateItem, removeItem, clearCart } = useCart()
  const [loading, setLoading] = useState({})
  const [error, setError] = useState('')

const handleUpdate = async (itemId, quantity) => {
    setLoading(l => ({ ...l, [itemId]: true }))
    try {
      await updateItem(itemId, quantity)
    } catch (err) {
      setError(err.response?.data?.error || 'Not enough stock.')
    } finally {
      setLoading(l => ({ ...l, [itemId]: false }))
    }
  }

  const handleRemove = async (itemId) => {
    setLoading(l => ({ ...l, [itemId]: true }))
    try {
      await removeItem(itemId)
    } catch {
      setError('Failed to remove item.')
    } finally {
      setLoading(l => ({ ...l, [itemId]: false }))
    }
  }

  const items = cart?.items || []
  const total = cart?.total ?? 0

  if (items.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 10 }}>
        <ShoppingCartIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h5" fontWeight={700} gutterBottom>Your cart is empty</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>Browse our collection and add some books!</Typography>
        <Button variant="contained" onClick={() => navigate('/books')}>Browse Books</Button>
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 4 }}>Your Cart</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Grid container spacing={3}>
        {/* Cart items */}
        <Grid item xs={12} md={8}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {items.map(item => (
              <Card key={item.id} elevation={2}>
                <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  {/* Book image placeholder */}
                  <Box sx={{
                    width: 60, height: 80, bgcolor: 'primary.light', borderRadius: 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    <MenuBookIcon sx={{ color: 'white' }} />
                  </Box>

                  {/* Book info */}
                  <Box sx={{ flex: 1 }}>
                    <Typography fontWeight={700}>{item.bookTitle}</Typography>
                    <Typography variant="body2" color="text.secondary">${item.unitPrice.toFixed(2)} each</Typography>
                  </Box>

                  {/* Quantity */}
                  <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => item.quantity > 1 ? handleUpdate(item.id, item.quantity - 1) : handleRemove(item.id)}
                      disabled={loading[item.id]}
                    >
                      <RemoveIcon fontSize="small" />
                    </IconButton>
                    <Typography sx={{ px: 2, minWidth: 32, textAlign: 'center' }}>
                      {loading[item.id] ? <CircularProgress size={16} /> : item.quantity}
                    </Typography>
                    <IconButton size="small" onClick={() => handleUpdate(item.id, item.quantity + 1)} disabled={loading[item.id]}>
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  {/* Subtotal */}
                  <Typography fontWeight={700} sx={{ minWidth: 70, textAlign: 'right' }}>
                    ${item.subtotal.toFixed(2)}
                  </Typography>

                  {/* Remove */}
                  <IconButton color="error" onClick={() => handleRemove(item.id)} disabled={loading[item.id]}>
                    <DeleteIcon />
                  </IconButton>
                </CardContent>
              </Card>
            ))}
          </Box>

          <Button color="error" onClick={clearCart} sx={{ mt: 2 }}>Clear Cart</Button>
        </Grid>

        {/* Order summary */}
        <Grid item xs={12} md={4}>
          <Card elevation={2} sx={{ position: 'sticky', top: 80 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>Order Summary</Typography>
              <Divider sx={{ mb: 2 }} />

              {items.map(item => (
                <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" noWrap sx={{ maxWidth: 160 }}>{item.bookTitle}</Typography>
                  <Typography variant="body2">${item.subtotal.toFixed(2)}</Typography>
                </Box>
              ))}

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" fontWeight={700}>Total</Typography>
                <Typography variant="h6" fontWeight={700} color="primary">${total.toFixed(2)}</Typography>
              </Box>

              <Button
                variant="contained"
                fullWidth
                size="large"
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/checkout')}
              >
                Proceed to Checkout
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
