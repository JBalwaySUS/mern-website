import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import Navbar from '../components/Navbar';
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

const SearchItems = () => {
  const categories = [
    "Clothing",
    "Electronics",
    "Books",
    "Furniture",
    "Sports",
    "Groceries",
    "Stationery",
    "Others"
  ];

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [items, setItems] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState({ _id: "", name: "", price: "", category: "", seller: "" });
  const { toast } = useToast();

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/items/search');
      if (!response.ok) {
        throw new Error('Failed to fetch items');
      }
      const data = await response.json();

      function capitalizeFirstLetter(string: string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
      }

      const temp_items = [];
      for (const tempitem of data) {
        temp_items.push({
          _id: tempitem._id,
          name: tempitem.name,
          price: tempitem.price,
          category: capitalizeFirstLetter(tempitem.category),
          seller: tempitem.sellerId.firstName + " " + tempitem.sellerId.lastName
        });
      }

      setItems(temp_items);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(item.category);
    return matchesSearch && matchesCategory;
  });

  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setNewItem({ ...newItem, [e.target.name]: e.target.value });
  };

  const handleAddItem = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast({
        title: "Error",
        description: "You must be logged in to add items",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newItem.name,
          price: parseFloat(newItem.price),
          category: newItem.category.toLowerCase(),
          description: newItem.description
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast({
            title: "Error",
            description: "Login expired. Please login again",
            variant: "destructive"
          });
          return;
        }
        toast({
          title: "Error",
          description: response.message,
          variant: "destructive"
        });
        return;
      }

      const addedItem = await response.json();
      setIsDialogOpen(false);
      fetchItems();

      toast({
        title: "Success",
        description: "Item added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <Toaster />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto p-4">
          <div className="grid grid-cols-4 gap-6">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle>Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox 
                        id={category} 
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={() => handleCategoryChange(category)}
                      />
                      <Label htmlFor={category}>{category}</Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="col-span-3 space-y-4">
              <div className="flex justify-between items-center">
                <Input 
                  placeholder="Search items..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
                <Button onClick={() => setIsDialogOpen(true)} className="ml-4">
                  Sell Items
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map((item) => (
                  <Card key={item._id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate(`/items/${item._id}`)}>
                    <CardHeader>
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">Category: {item.category}</p>
                      <p className="text-gray-600">Seller: {item.seller}</p>
                    </CardContent>
                    <CardFooter>
                      <p className="text-lg font-bold">₹{item.price}</p>
                    </CardFooter>
                  </Card>
                ))}
              </div>

              {filteredItems.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No items found matching your criteria</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Item Name</Label>
              <Input 
                id="name" 
                name="name" 
                value={newItem.name}
                onChange={handleInputChange}
                required 
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="price">Price</Label>
              <Input 
                id="price" 
                name="price" 
                type="number"
                value={newItem.price}
                onChange={handleInputChange}
                required 
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="category">Category</Label>
              <select 
                id="category" 
                name="category" 
                value={newItem.category}
                onChange={handleInputChange}
                required 
                className="border rounded p-2 bg-white"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Input 
                id="description" 
                name="description" 
                value={newItem.description}
                onChange={handleInputChange}
                required 
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddItem}>Add Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SearchItems;