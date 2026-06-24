import { useState, useEffect } from 'react'
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, CircularProgress, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Divider
} from '@mui/material'
import { ordersApi } from '../../api'

const statusColor = {
  Pending: 'warning',
  Confirmed: 'success',
  Shipped: 'info',
  Delivered: 'success',
  Cancelled: 'error',
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    ordersApi.getAllOrders()
      .then(res => setOrders(res.data))
      .catch(() => setError('Failed to load orders.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>Orders</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>Order ID</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>Customer</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>Date</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>Total</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }} align="right">Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  No orders yet.
                </TableCell>
              </TableRow>
            ) : (
              orders.map(o => (
                <TableRow key={o.id} hover>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>
                    {o.id.substring(0, 8)}...
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {o.userId ? `${o.guestFirstName} ${o.guestLastName}` : `${o.guestFirstName} ${o.guestLastName}`}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">{o.guestEmail}</Typography>
                  </TableCell>
                  <TableCell>{new Date(o.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell><strong>${o.totalAmount.toFixed(2)}</strong></TableCell>
                  <TableCell>
                    <Chip label={o.status} color={statusColor[o.status] || 'default'} size="small" />
                  </TableCell>
                  <TableCell align="right">
                    <Button size="small" onClick={() => setSelected(o)}>View</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Order Detail Dialog */}
      <Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Order Details</DialogTitle>
        <DialogContent>
          {selected && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">ORDER ID</Typography>
                <Typography variant="body2" fontFamily="monospace">{selected.id}</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 4 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">CUSTOMER</Typography>
                  <Typography>{selected.guestFirstName} {selected.guestLastName}</Typography>
                  <Typography variant="body2" color="text.secondary">{selected.guestEmail}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">STATUS</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip label={selected.status} color={statusColor[selected.status] || 'default'} size="small" />
                  </Box>
                </Box>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">SHIPPING ADDRESS</Typography>
                <Typography variant="body2">
                  {selected.addressLine1}{selected.addressLine2 ? `, ${selected.addressLine2}` : ''}<br />
                  {selected.city}, {selected.postalCode}, {selected.country}
                </Typography>
              </Box>
              <Divider />
              <Typography variant="subtitle2" fontWeight={700}>Items</Typography>
              {selected.items?.map(item => (
                <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>{item.bookTitle}</Typography>
                    <Typography variant="caption" color="text.secondary">Qty: {item.quantity} × ${item.unitPrice.toFixed(2)}</Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={600}>${item.subtotal.toFixed(2)}</Typography>
                </Box>
              ))}
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography fontWeight={700}>Total</Typography>
                <Typography fontWeight={700} color="primary">${selected.totalAmount.toFixed(2)}</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setSelected(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
