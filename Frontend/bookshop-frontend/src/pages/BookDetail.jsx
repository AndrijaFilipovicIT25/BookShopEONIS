import { useState, useEffect } from 'react'
import {
  Box, Typography, Button, Grid, Chip, CircularProgress,
  Alert, Divider, Tab, Tabs, Card, CardContent, IconButton
} from '@mui/material'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import FlashOnIcon from '@mui/icons-material/FlashOn'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import CollectionsBookmarkIcon from '@mui/icons-material/CollectionsBookmark'
import PersonIcon from '@mui/icons-material/Person'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { booksApi } from '../api'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";
import Book3d from './Book3d';
export default function BookDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isLoggedIn } = useAuth()
  const { addToCart } = useCart()

  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [imageTab, setImageTab] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)
  const [cartSuccess, setCartSuccess] = useState(false)

  useEffect(() => {
    booksApi.getById(id)
      .then(res => setBook(res.data))
      .catch(() => setError('Book not found.'))
      .finally(() => setLoading(false))
  }, [id])

  const handleAddToCart = async () => {
    if (!isLoggedIn) { navigate('/login'); return }
    setAddingToCart(true)
    try {
      await addToCart(book, quantity)
      setCartSuccess(true)
      setTimeout(() => setCartSuccess(false), 3000)
    } catch {
      setError('Failed to add to cart.')
    } finally {
      setAddingToCart(false)
    }
  }

  const handleBuyNow = () => {
    if (isLoggedIn) {
      handleAddToCart().then(() => navigate('/checkout'))
    } else {
      navigate('/checkout', { state: { guestBook: book, quantity } })
    }
  }

 

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>
  if (error) return <Alert severity="error">{error}</Alert>
  if (!book) return null

  const price = book.discountPrice ?? book.price
  const images = [
    book.frontImagePath && { label: 'Front', src: `http://localhost:5003${book.frontImagePath}` },
    book.backImagePath && { label: 'Back', src: `http://localhost:5003${book.backImagePath}` },
    book.spineImagePath && { label: 'Spine', src: `http://localhost:5003${book.spineImagePath}` },
  ].filter(Boolean)


  const front = images.find(i => i.label === "Front")?.src
const back = images.find(i => i.label === "Back")?.src
const spine = images.find(i => i.label === "Spine")?.src


  const inStock = book.stockQuantity > 0 && book.isAvailable

  return (
    <Box>
      {/* Back button */}
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 3 }}>
        Back
      </Button>

      <Grid container spacing={5}>
        {/* Left — Images */}
<Grid item xs={12} md={5}>
  <Box>
    {/* Sticky images section */}
    <Box sx={{ position: 'sticky', top: 80 }}>
      {/* Main image */}
      <Box
        sx={{
          bgcolor: 'primary.light',
          borderRadius: 2,
          overflow: 'hidden',
          height: 400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 1,
        }}
      >
        {images.length > 0 ? (
          <img
            src={images[imageTab]?.src}
            alt={book.title}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        ) : (
          <MenuBookIcon sx={{ fontSize: 100, color: 'white', opacity: 0.7 }} />
        )}
      </Box>

      {/* Tabs */}
      {images.length > 1 && (
        <Tabs value={imageTab} onChange={(_, v) => setImageTab(v)} centered>
          {images.map((img, i) => (
            <Tab key={i} label={img.label} />
          ))}
        </Tabs>
      )}
    </Box>

    {/* 👇 NOVI DIV ISPOD SLIKA (NIJE STICKY) */}
<Box sx={{ mt: 3,position: 'sticky', p: 2,height: 400, bgcolor: '#27272760', borderRadius: 2 }}>
  {images.length === 3 ? (
     <Canvas
        orthographic
        flat
        camera={{
          zoom:  100,
          position: [0, 0, 10],
        }}
        
      >
<ambientLight intensity={3} />

        <Book3d
        front={front}
        spine={spine}
        back={back}
        width={book.width}
        height={book.height}
        depth={book.depth}
      />

        <OrbitControls
          enableZoom={true}
          enablePan={false}
          enableRotate={true}
        />

      </Canvas>

  ) : (
    <p>3D view is not supported for this book</p>
  )}
</Box>
  </Box>
</Grid>

        {/* Right — Info */}
        <Grid item xs={12} md={7}>
          {/* Category */}
          {book.category && (
            <Chip label={book.category.name} color="primary" variant="outlined" size="small" sx={{ mb: 1 }} />
          )}

          {/* Title */}
          <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>{book.title}</Typography>

          {/* Authors */}
          {book.authors?.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              <PersonIcon fontSize="small" color="action" />
              {book.authors.map(a => (
                <Typography
                  key={a.id}
                  variant="body1"
                  component={Link}
                  to={`/authors/${a.id}`}
                  sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                >
                  {a.firstName} {a.lastName}
                </Typography>
              ))}
            </Box>
          )}

          {/* Price */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography variant="h4" fontWeight={700} color="primary">${price.toFixed(2)}</Typography>
            {book.discountPrice && (
              <Typography variant="h6" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
                ${book.price.toFixed(2)}
              </Typography>
            )}
            {book.discountPrice && <Chip label="SALE" color="error" size="small" />}
          </Box>

          {/* Stock status */}
          <Box sx={{ mb: 3 }}>
            {inStock ? (
              <Chip label={`In Stock (${book.stockQuantity} available)`} color="success" size="small" />
            ) : (
              <Chip label="Out of Stock" color="default" size="small" />
            )}
          </Box>

          {/* Quantity selector */}
          {inStock && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Typography variant="body2" fontWeight={600}>Quantity:</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <IconButton size="small" onClick={() => setQuantity(q => Math.max(1, q - 1))}><RemoveIcon fontSize="small" /></IconButton>
                <Typography sx={{ px: 2, minWidth: 40, textAlign: 'center' }}>{quantity}</Typography>
                <IconButton size="small" onClick={() => setQuantity(q => Math.min(book.stockQuantity, q + 1))}><AddIcon fontSize="small" /></IconButton>
              </Box>
            </Box>
          )}

          {/* Cart success */}
          {cartSuccess && <Alert severity="success" sx={{ mb: 2 }}>Added to cart!</Alert>}

          {/* Action buttons */}
          <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
            {isLoggedIn && (
              <Button
                variant="outlined"
                size="large"
                startIcon={<ShoppingCartIcon />}
                onClick={handleAddToCart}
                disabled={!inStock || addingToCart}
                sx={{ flex: 1, minWidth: 160 }}
              >
                {addingToCart ? <CircularProgress size={20} /> : 'Add to Cart'}
              </Button>
            )}
            <Button
              variant="contained"
              size="large"
              startIcon={<FlashOnIcon />}
              onClick={handleBuyNow}
              disabled={!inStock}
              sx={{ flex: 1, minWidth: 160 }}
            >
              Buy Now
            </Button>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Description */}
          {book.description && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>Description</Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                {book.description}
              </Typography>
            </Box>
          )}

          {/* Collection */}
          {book.collection && (
            <Card variant="outlined" sx={{ mb: 3, cursor: 'pointer' }} onClick={() => navigate(`/collections/${book.collection.id}`)}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: '12px !important' }}>
                <CollectionsBookmarkIcon color="secondary" />
                <Box>
                  <Typography variant="body2" color="text.secondary">Part of the series</Typography>
                  <Typography fontWeight={700}>{book.collection.name}</Typography>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Book details */}
          <Box>
            <Typography variant="h6" fontWeight={700} gutterBottom>Book Details</Typography>
            <Grid container spacing={1}>
              {[
                { label: 'Publisher', value: book.publisher },
                { label: 'Published Year', value: book.publishedYear },
                { label: 'Language', value: book.language },
                { label: 'Pages', value: book.pageCount },
                { label: 'ISBN', value: book.isbn },
                { label: 'Paper Color', value: book.paperColor },
              ].filter(d => d.value).map(d => (
                <Grid item xs={6} key={d.label}>
                  <Typography variant="caption" color="text.secondary">{d.label}</Typography>
                  <Typography variant="body2" fontWeight={600}>{d.value}</Typography>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}
