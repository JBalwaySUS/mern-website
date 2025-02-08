import { useNavigate } from 'react-router-dom';
import { User, ShoppingCart, Package, History, LogOut, Search, Headset } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from '../components/ui/toaster';
import { useEffect, useState } from 'react';

const Navbar = () => {
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchCartCount();
    
    // Add event listener for cart updates
    window.addEventListener('cartUpdated', fetchCartCount);
    
    // Cleanup
    return () => {
      window.removeEventListener('cartUpdated', fetchCartCount);
    };
  }, []);

  const fetchCartCount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch cart');
      
      const cartItems = await response.json();
      setCartCount(cartItems.length);
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const handleLogout = () => {
    // Clear the token from local storage
    localStorage.removeItem('token');
    // Redirect to the login page
    navigate('/login');
    // Show a success toast
    toast({
      title: "Success",
      description: "Logged out successfully",
    });
  };

  return (
    <nav className="w-full bg-white shadow-md fixed top-0">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <a href="/dashboard" className="text-xl font-bold text-gray-800">
              IIITH Buy & Sell
            </a>
          </div>
          
          <div className="flex items-center space-x-4">
            <a href="/dashboard" className="flex items-center space-x-1 text-gray-600 hover:text-gray-800">
              <User size={20} />
              <span>Profile</span>
            </a>
            <a href="/searchitems" className="flex items-center space-x-1 text-gray-600 hover:text-gray-800">
              <Search size={20} />
              <span>Search Items</span>
            </a>
            <a href="/deliveritems" className="flex items-center space-x-1 text-gray-600 hover:text-gray-800">
              <Package size={20} />
              <span>Deliver Items</span>
            </a>
            <a href="/orderhistory" className="flex items-center space-x-1 text-gray-600 hover:text-gray-800">
              <History size={20} />
              <span>Order History</span>
            </a>
            <a href="/mycart" className="flex items-center space-x-1 text-gray-600 hover:text-gray-800">
              <ShoppingCart size={20} />
              <span>My Cart ({cartCount})</span>
            </a>
            <a href="/support" className="flex items-center space-x-1 text-gray-600 hover:text-gray-800">
              <Headset size={20} />
              <span>Support</span>
            </a>
            <button onClick={handleLogout} className="flex items-center space-x-1 text-red-600 hover:text-red-800">
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;