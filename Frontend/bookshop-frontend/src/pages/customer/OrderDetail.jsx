import { useState, useEffect } from 'react'
import {
  Box, Typography, Card, CardContent, Chip, CircularProgress,
  Alert, Button, Divider, Grid
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useParams, useNavigate } from 'react-router-dom'
import { ordersApi } from '../../api'

const statusColor = {
  Pending: 'warning',
  Confirmed: 'success',
  Shipped: 'info',
  Delivered: 'success',
  Cancelled: 'error',
}

export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    ordersApi.getOrderById(id)
      .then(res => setOrder(res.data))
      .catch(() => setError('Order not found.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>
  if (error) return <Alert severity="error">{error}</Alert>
  if (!order) return null

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto' }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/orders')} sx={{ mb: 3 }}>Back to Orders</Button>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight={700}>Order Details</Typography>
        <Chip label={order.status} color={statusColor[order.status] || 'default'} />
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>ORDER INFO</Typography>
              <Typography variant="body2" fontFamily="monospace" sx={{ mb: 1 }}>{order.id}</Typography>
              <Typography variant="body2" color="text.secondary">
                {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>SHIPPING ADDRESS</Typography>
              <Typography variant="body2">{order.guestFirstName} {order.guestLastName}</Typography>
              <Typography variant="body2">{order.addressLine1}</Typography>
              {order.addressLine2 && <Typography variant="body2">{order.addressLine2}</Typography>}
              <Typography variant="body2">{order.city}, {order.postalCode}</Typography>
              <Typography variant="body2">{order.country}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>ITEMS</Typography>
              <Divider sx={{ mb: 2 }} />
              {order.items?.map(item => (
                <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Box>
                    <Typography fontWeight={600}>{item.bookTitle}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.quantity} × ${item.unitPrice.toFixed(2)}
                    </Typography>
                  </Box>
                  <Typography fontWeight={600}>${item.subtotal.toFixed(2)}</Typography>
                </Box>
              ))}
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6" fontWeight={700}>Total</Typography>
                <Typography variant="h6" fontWeight={700} color="primary">${order.totalAmount.toFixed(2)}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
