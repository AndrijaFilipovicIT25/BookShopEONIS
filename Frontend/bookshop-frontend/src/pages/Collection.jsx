import { useState, useEffect } from 'react'
import {
  Box, Typography, Grid, Card, CardContent, CardMedia, CardActionArea,
  CircularProgress, Alert, Chip, Button
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import CollectionsBookmarkIcon from '@mui/icons-material/CollectionsBookmark'
import { useParams, useNavigate } from 'react-router-dom'
import { booksApi } from '../api'

export default function Collection() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [collection, setCollection] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    booksApi.getCollectionById(id)
      .then(res => setCollection(res.data))
      .catch(() => setError('Collection not found.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>
  if (error) return <Alert severity="error">{error}</Alert>
  if (!collection) return null

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 3 }}>Back</Button>

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Box sx={{ bgcolor: 'secondary.main', borderRadius: 2, p: 1.5, color: 'white' }}>
          <CollectionsBookmarkIcon sx={{ fontSize: 32 }} />
        </Box>
        <Box>
          <Typography variant="h4" fontWeight={800}>{collection.name}</Typography>
          {collection.description && (
            <Typography variant="body1" color="text.secondary">{collection.description}</Typography>
          )}
        </Box>
      </Box>

      <Chip label={`${collection.books?.length || 0} books in this series`} sx={{ mb: 4 }} />

      {/* Books grid sorted by collectionOrder */}
      <Grid container spacing={3}>
        {collection.books?.length === 0 ? (
          <Grid item xs={12}>
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <MenuBookIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography color="text.secondary">No books in this collection yet.</Typography>
            </Box>
          </Grid>
        ) : (
          collection.books?.map((book, index) => {
            const price = book.discountPrice ?? book.price
            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={book.id}>
                <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.15s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 } }}>
                  <CardActionArea onClick={() => navigate(`/books/${book.id}`)} sx={{ flex: 1 }}>
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="div"
                        sx={{ height: 200, bgcolor: 'primary.light', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        {book.frontImagePath ? (
                          <img src={`http://localhost:5003${book.frontImagePath}`} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <MenuBookIcon sx={{ fontSize: 60, color: 'white', opacity: 0.7 }} />
                        )}
                      </CardMedia>
                      {book.collectionOrder && (
                        <Chip
                          label={`#${book.collectionOrder}`}
                          size="small"
                          color="secondary"
                          sx={{ position: 'absolute', top: 8, left: 8 }}
                        />
                      )}
                    </Box>
                    <CardContent>
                      <Typography variant="subtitle2" fontWeight={700} noWrap>{book.title}</Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {book.authors?.map(a => `${a.firstName} ${a.lastName}`).join(', ')}
                      </Typography>
                      <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" fontWeight={700} color="primary">${price.toFixed(2)}</Typography>
                        {book.discountPrice && (
                          <Typography variant="caption" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>${book.price.toFixed(2)}</Typography>
                        )}
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            )
          })
        )}
      </Grid>
    </Box>
  )
}
