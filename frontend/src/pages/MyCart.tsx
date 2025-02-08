import { useEffect, useState } from "react"
import Navbar from "@/components/Navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"

interface CartItem {
  id: string
  name: string
  price: number
  sellerId: string
}

export default function MyCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [totalCost, setTotalCost] = useState(0)

  const { toast } = useToast()

  useEffect(() => {
    fetchCartItems()
  }, [])

  const fetchCartItems = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('You must be logged in to view the cart')
      }

      const response = await fetch('http://localhost:5000/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch cart items')
      }

      const data = await response.json()
      setCartItems(data)
      calculateTotal(data)
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const calculateTotal = (items: CartItem[]) => {
    const total = items.reduce((sum, item) => sum + item.price, 0)
    setTotalCost(total)
  }

  const removeFromCart = async (itemId: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('You must be logged in to remove items from the cart')
      }

      const response = await fetch('http://localhost:5000/api/cart', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ itemId })
      })
      if (!response.ok) {
        throw new Error('Failed to remove item from cart')
      }

      const updatedItems = cartItems.filter(item => item._id !== itemId)
      setCartItems(updatedItems)
      calculateTotal(updatedItems)

      toast({
        title: "Success",
        description: "Item removed from cart",
      })

      // Dispatch event to update cart count in Navbar
      window.dispatchEvent(new Event('cartUpdated'))
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const placeOrder = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('You must be logged in to place an order')
      }

      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to place order')
      }

      const data = await response.json()
      setCartItems([])
      setTotalCost(0)

      toast({
        title: "Success",
        description: `Order placed successfully! Your OTP is ${data.otp}. Check Orders History for details.`,
      })

      // Dispatch event to update cart count in Navbar
      window.dispatchEvent(new Event('cartUpdated'))
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto py-6 px-4">
        <h1 className="text-3xl font-bold mb-6">My Cart</h1>

        <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
          <Card>
            <CardContent className="p-6">
              {cartItems.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-2">Your cart is empty</p>
                  <p className="text-sm text-muted-foreground">
                    Add items from the search page to see them here
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[500px] pr-4">
                  {cartItems.map((item) => (
                    <div key={item._id}>
                      <div className="flex items-center justify-between py-4">
                        <div>
                          <h3 className="font-medium">{item.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            ₹{item.price.toFixed(2)}
                          </p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeFromCart(item._id)}
                        >
                          Remove
                        </Button>
                      </div>
                      <Separator />
                    </div>
                  ))}
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Items</span>
                  <span>{cartItems.length}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total Cost</span>
                  <span>₹{totalCost.toFixed(2)}</span>
                </div>
                <Button
                  className="w-full"
                  size="lg"
                  disabled={cartItems.length === 0}
                  onClick={placeOrder}
                >
                  Place Order
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}