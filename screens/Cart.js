import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { Button, Input, ListItem, Icon, Text } from 'react-native-elements';
import { supabase } from '../lib/supabaseConfig';

export default function Cart({ navigation, route }) {
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    description: '',
    stock: ''
  });

  useEffect(() => {
    fetchProducts();
    fetchCart();
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        setIsAdmin(profileData?.role === 'admin');
      }
    } catch (error) {
      console.error('Error checking user role:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCart = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('cart')
        .select(`
          *,
          products (*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      setCartItems(data || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch cart items');
    }
  };

  const addToCart = async (product) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'Please log in to add items to cart');
        return;
      }

      // Check if item already exists in cart
      const existingItem = cartItems.find(item => item.product_id === product.id);
      
      if (existingItem) {
        // Update quantity
        const { error } = await supabase
          .from('cart')
          .update({ quantity: existingItem.quantity + 1 })
          .eq('id', existingItem.id);

        if (error) throw error;
      } else {
        // Add new item
        const { error } = await supabase
          .from('cart')
          .insert([{
            user_id: user.id,
            product_id: product.id,
            quantity: 1
          }]);

        if (error) throw error;
      }

      fetchCart();
      Alert.alert('Success', 'Item added to cart');
    } catch (error) {
      Alert.alert('Error', 'Failed to add item to cart');
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('id', cartItemId);

      if (error) throw error;
      fetchCart();
    } catch (error) {
      Alert.alert('Error', 'Failed to remove item from cart');
    }
  };

  const updateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(cartItemId);
      return;
    }

    try {
      const { error } = await supabase
        .from('cart')
        .update({ quantity: newQuantity })
        .eq('id', cartItemId);

      if (error) throw error;
      fetchCart();
    } catch (error) {
      Alert.alert('Error', 'Failed to update quantity');
    }
  };

  const addProduct = async () => {
    try {
      if (!newProduct.name || !newProduct.price || !newProduct.description || !newProduct.stock) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
      }

      const { error } = await supabase
        .from('products')
        .insert([{
          name: newProduct.name,
          price: parseFloat(newProduct.price),
          description: newProduct.description,
          stock: parseInt(newProduct.stock)
        }]);

      if (error) throw error;

      setNewProduct({
        name: '',
        price: '',
        description: '',
        stock: ''
      });
      fetchProducts();
      Alert.alert('Success', 'Product added successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to add product');
    }
  };

  const deleteProduct = async (productId) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      fetchProducts();
      Alert.alert('Success', 'Product deleted successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to delete product');
    }
  };

  const updateProduct = async (productId, updates) => {
    try {
      const { error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', productId);

      if (error) throw error;
      fetchProducts();
      Alert.alert('Success', 'Product updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update product');
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.products.price * item.quantity);
    }, 0);
  };

  return (
    <ScrollView style={styles.container}>
      {isAdmin && (
        <View style={styles.adminSection}>
          <Text h4 style={styles.sectionTitle}>Add New Product</Text>
          <Input
            placeholder="Product Name"
            value={newProduct.name}
            onChangeText={(text) => setNewProduct({ ...newProduct, name: text })}
          />
          <Input
            placeholder="Price"
            value={newProduct.price}
            onChangeText={(text) => setNewProduct({ ...newProduct, price: text })}
            keyboardType="numeric"
          />
          <Input
            placeholder="Description"
            value={newProduct.description}
            onChangeText={(text) => setNewProduct({ ...newProduct, description: text })}
            multiline
          />
          <Input
            placeholder="Stock"
            value={newProduct.stock}
            onChangeText={(text) => setNewProduct({ ...newProduct, stock: text })}
            keyboardType="numeric"
          />
          <Button
            title="Add Product"
            onPress={addProduct}
            loading={loading}
          />
        </View>
      )}

      <View style={styles.productsSection}>
        <Text h4 style={styles.sectionTitle}>Products</Text>
        {products.map((product) => (
          <ListItem key={product.id} bottomDivider>
            <ListItem.Content>
              <ListItem.Title>{product.name}</ListItem.Title>
              <ListItem.Subtitle>${product.price}</ListItem.Subtitle>
              <ListItem.Subtitle>{product.description}</ListItem.Subtitle>
              <ListItem.Subtitle>Stock: {product.stock}</ListItem.Subtitle>
            </ListItem.Content>
            {isAdmin ? (
              <View style={styles.adminActions}>
                <Button
                  icon={<Icon name="edit" type="material" />}
                  type="clear"
                  onPress={() => {
                    // Implement edit functionality
                    Alert.alert('Edit Product', 'Edit functionality to be implemented');
                  }}
                />
                <Button
                  icon={<Icon name="delete" type="material" color="red" />}
                  type="clear"
                  onPress={() => deleteProduct(product.id)}
                />
              </View>
            ) : (
              <Button
                title="Add to Cart"
                onPress={() => addToCart(product)}
                disabled={product.stock < 1}
              />
            )}
          </ListItem>
        ))}
      </View>

      <View style={styles.cartSection}>
        <Text h4 style={styles.sectionTitle}>Shopping Cart</Text>
        {cartItems.map((item) => (
          <ListItem key={item.id} bottomDivider>
            <ListItem.Content>
              <ListItem.Title>{item.products.name}</ListItem.Title>
              <ListItem.Subtitle>${item.products.price} x {item.quantity}</ListItem.Subtitle>
            </ListItem.Content>
            <View style={styles.quantityControls}>
              <Button
                icon={<Icon name="remove" type="material" />}
                onPress={() => updateQuantity(item.id, item.quantity - 1)}
              />
              <Text style={styles.quantityText}>{item.quantity}</Text>
              <Button
                icon={<Icon name="add" type="material" />}
                onPress={() => updateQuantity(item.id, item.quantity + 1)}
              />
            </View>
          </ListItem>
        ))}
        <Text h4 style={styles.totalPrice}>Total: ${getTotalPrice().toFixed(2)}</Text>
        {cartItems.length > 0 && (
          <Button
            title="Checkout"
            onPress={() => {
              // Implement checkout functionality
              Alert.alert('Checkout', 'Checkout functionality to be implemented');
            }}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  adminSection: {
    padding: 15,
    backgroundColor: '#f8f8f8',
  },
  productsSection: {
    padding: 15,
  },
  cartSection: {
    padding: 15,
    backgroundColor: '#f8f8f8',
  },
  sectionTitle: {
    marginBottom: 15,
  },
  adminActions: {
    flexDirection: 'row',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityText: {
    marginHorizontal: 10,
    fontSize: 16,
  },
  totalPrice: {
    textAlign: 'right',
    marginVertical: 15,
  },
}); 