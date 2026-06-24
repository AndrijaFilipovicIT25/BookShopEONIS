import { createContext, useContext, useState, useEffect } from 'react'
import { ordersApi } from '../api'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { isLoggedIn } = useAuth()
  const [cart, setCart] = useState(null)
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    if (isLoggedIn) fetchCart()
    else { setCart(null); setCartCount(0) }
  }, [isLoggedIn])

  const fetchCart = async () => {
    try {
      const res = await ordersApi.getCart()
      setCart(res.data)
      setCartCount(res.data.items?.length || 0)
    } catch {
      setCart(null)
      setCartCount(0)
    }
  }

  const addToCart = async (book, quantity = 1) => {
    await ordersApi.addToCart({
      bookId: String(book.id),
      bookTitle: book.title,
      unitPrice: book.discountPrice ?? book.price,
      quantity,
    })
    await fetchCart()
  }

  const updateItem = async (itemId, quantity) => {
    await ordersApi.updateCartItem(itemId, { quantity })
    await fetchCart()
  }

  const removeItem = async (itemId) => {
    await ordersApi.removeCartItem(itemId)
    await fetchCart()
  }

  const clearCart = async () => {
    await ordersApi.clearCart()
    setCart(null)
    setCartCount(0)
  }

  return (
    <CartContext.Provider value={{ cart, cartCount, fetchCart, addToCart, updateItem, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
