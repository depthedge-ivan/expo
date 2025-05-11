import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button, Input, Text, Card } from 'react-native-elements';
import { createClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseAnonKey } from '../lib/supabaseConfig';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const AdminScreen = () => {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.stock) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const { error } = await supabase.from('products').insert([
        {
          name: newProduct.name,
          description: newProduct.description,
          price: parseFloat(newProduct.price),
          stock: parseInt(newProduct.stock),
        },
      ]);

      if (error) throw error;

      Alert.alert('Success', 'Product added successfully');
      setNewProduct({
        name: '',
        description: '',
        price: '',
        stock: '',
      });
      fetchProducts();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const deleteProduct = async (id) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this product?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', id);

              if (error) throw error;

              Alert.alert('Success', 'Product deleted successfully');
              fetchProducts();
            } catch (error) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Card>
        <Card.Title>Add New Product</Card.Title>
        <Input
          placeholder="Product Name"
          value={newProduct.name}
          onChangeText={(text) => setNewProduct({ ...newProduct, name: text })}
        />
        <Input
          placeholder="Description"
          value={newProduct.description}
          onChangeText={(text) => setNewProduct({ ...newProduct, description: text })}
          multiline
        />
        <Input
          placeholder="Price"
          value={newProduct.price}
          onChangeText={(text) => setNewProduct({ ...newProduct, price: text })}
          keyboardType="numeric"
        />
        <Input
          placeholder="Stock"
          value={newProduct.stock}
          onChangeText={(text) => setNewProduct({ ...newProduct, stock: text })}
          keyboardType="numeric"
        />
        <Button title="Add Product" onPress={addProduct} />
      </Card>

      <Card>
        <Card.Title>Current Products</Card.Title>
        {products.map((product) => (
          <Card key={product.id}>
            <Text h4>{product.name}</Text>
            <Text>{product.description}</Text>
            <Text>Price: ${product.price}</Text>
            <Text>Stock: {product.stock}</Text>
            <Text>Added: {new Date(product.created_at).toLocaleDateString()}</Text>
            <Button
              title="Delete"
              onPress={() => deleteProduct(product.id)}
              buttonStyle={{ backgroundColor: 'red' }}
            />
          </Card>
        ))}
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
});

export default AdminScreen;
