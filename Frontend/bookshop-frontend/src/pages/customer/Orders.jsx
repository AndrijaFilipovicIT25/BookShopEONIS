import { useState, useEffect } from 'react'
import {
  Box, Typography, Card, CardContent, Chip, CircularProgress,
  Alert, Button, Divider
} from '@mui/material'
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag'
import { useNavigate } from 'react-router-dom'
import { ordersApi } from '../../api'

const statusColor = {
  Pending: 'warning',
  Confirmed: 'success',
  Shipped: 'info',
  Delivered: 'success',
  Cancelled: 'error',
}

export default function Orders() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    ordersApi.getMyOrders()
      .then(res => setOrders(res.data))
      .catch(() => setError('Failed to load orders.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 4 }}>My Orders</Typography>

      {error && <Alert severity="error">{error}</Alert>}

      {orders.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <ShoppingBagIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h5" fontWeight={700} gutterBottom>No orders yet</Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>Your order history will appear here.</Typography>
          <Button variant="contained" onClick={() => navigate('/books')}>Start Shopping</Button>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {orders.map(order => (
            <Card key={order.id} elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">ORDER</Typography>
                    <Typography variant="body2" fontFamily="monospace">{order.id.substring(0, 8)}...</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </Typography>
                  </Box>
                  <Chip label={order.status} color={statusColor[order.status] || 'default'} size="small" />
                </Box>

                <Divider sx={{ mb: 2 }} />

                {order.items?.map(item => (
                  <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">{item.bookTitle} × {item.quantity}</Typography>
                    <Typography variant="body2">${item.subtotal.toFixed(2)}</Typography>
                  </Box>
                ))}

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography fontWeight={700}>Total: ${order.totalAmount.toFixed(2)}</Typography>
                  <Button size="small" onClick={() => navigate(`/orders/${order.id}`)}>View Details</Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  )
}
