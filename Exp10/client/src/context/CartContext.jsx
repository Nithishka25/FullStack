import { createContext, useContext, useMemo, useState } from 'react'

const CartCtx = createContext(null)

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cart') || '{"restaurantId": "", "items": []}') } catch { return { restaurantId: '', items: [] } }
  })

  const persist = (next) => localStorage.setItem('cart', JSON.stringify(next))

  const add = (restaurantId, item) => {
    // item = { item: itemId, name, price, quantity }
    setCart(prev => {
      // prevent mixing restaurants
      if (prev.restaurantId && prev.restaurantId !== restaurantId) {
        alert('Cart is limited to one restaurant at a time. Clearing previous items.')
        const next = { restaurantId, items: [{ ...item }] }
        persist(next)
        return next
      }
      const next = { restaurantId: restaurantId || prev.restaurantId, items: [...(prev.items || [])] }
      const idx = next.items.findIndex(x => x.item === item.item)
      if (idx >= 0) next.items[idx].quantity += item.quantity || 1
      else next.items.push({ ...item, quantity: item.quantity || 1 })
      persist(next)
      return next
    })
  }

  const inc = (itemId) => {
    setCart(prev => {
      const next = { ...prev, items: prev.items.map(x => x.item === itemId ? { ...x, quantity: x.quantity + 1 } : x) }
      persist(next)
      return next
    })
  }

  const dec = (itemId) => {
    setCart(prev => {
      const items = prev.items.map(x => x.item === itemId ? { ...x, quantity: Math.max(1, x.quantity - 1) } : x)
      const next = { ...prev, items }
      persist(next)
      return next
    })
  }

  const remove = (itemId) => {
    setCart(prev => {
      const items = prev.items.filter(x => x.item !== itemId)
      const next = { restaurantId: items.length ? prev.restaurantId : '', items }
      persist(next)
      return next
    })
  }

  const clear = () => { const next = { restaurantId: '', items: [] }; setCart(next); persist(next) }

  const loadFromOrder = (restaurantId, items) => {
    const next = { restaurantId, items: items.map(i => ({ item: i.item, name: i.name, price: i.price, quantity: i.quantity })) }
    setCart(next)
    persist(next)
  }

  const value = useMemo(() => ({ cart, add, inc, dec, remove, clear, loadFromOrder }), [cart])
  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>
}

export function useCart() { return useContext(CartCtx) }
