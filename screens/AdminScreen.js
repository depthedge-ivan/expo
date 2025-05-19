import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { supabase } from '../lib/supabaseClient';

const AdminScreen = () => {
  const [products, setProducts] = useState([]);
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productStock, setProductStock] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('*');
    if (error) {
      console.error('Fetch error:', error.message);
    } else {
      setProducts(data);
    }
  };

  const handleAddProduct = async () => {
    if (!productName || !productDescription || !productPrice || !productStock) {
      Alert.alert('All fields are required');
      return;
    }

    const { data, error } = await supabase.from('products').insert([
      {
        name: productName,
        description: productDescription,
        price: parseFloat(productPrice),
        stock: parseInt(productStock),
      },
    ]);

    if (error) {
      console.error('Add error:', error.message);
    } else {
      console.log('Product added:', data);
      resetForm();
      fetchProducts();
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingId) return;

    const { data, error } = await supabase
      .from('products')
      .update({
        name: productName,
        description: productDescription,
        price: parseFloat(productPrice),
        stock: parseInt(productStock),
      })
      .eq('id', editingId);

    if (error) {
      console.error('Update error:', error.message);
    } else {
      console.log('Product updated:', data);
      resetForm();
      fetchProducts();
    }
  };

  const handleDeleteProduct = async (id) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this product?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const { error } = await supabase.from('products').delete().eq('id', id);
          if (error) {
            console.error('Delete error:', error.message);
          } else {
            console.log('Product deleted');
            fetchProducts();
          }
        },
      },
    ]);
  };

  const startEditing = (product) => {
    setEditingId(product.id);
    setProductName(product.name);
    setProductDescription(product.description);
    setProductPrice(product.price.toString());
    setProductStock(product.stock.toString());
  };

  const resetForm = () => {
    setEditingId(null);
    setProductName('');
    setProductDescription('');
    setProductPrice('');
    setProductStock('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Panel</Text>

      <TextInput
        style={styles.input}
        placeholder="Product Name"
        value={productName}
        onChangeText={setProductName}
      />
      <TextInput
        style={styles.input}
        placeholder="Product Description"
        value={productDescription}
        onChangeText={setProductDescription}
      />
      <TextInput
        style={styles.input}
        placeholder="Product Price"
        value={productPrice}
        onChangeText={setProductPrice}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Product Stock"
        value={productStock}
        onChangeText={setProductStock}
        keyboardType="numeric"
      />

      {editingId ? (
        <View style={styles.buttonGroup}>
          <TouchableOpacity style={styles.button} onPress={handleUpdateProduct}>
            <Text style={styles.buttonText}>Update</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, { backgroundColor: '#999' }]} onPress={resetForm}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleAddProduct}>
          <Text style={styles.buttonText}>Add Product</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={products}
        keyExtractor={(item) => item.id?.toString()}
        renderItem={({ item }) => (
          <View style={styles.productItem}>
            <Text style={styles.productText}>
              {item.name} - {item.description} - ${item.price} - Stock: {item.stock}
            </Text>
            <View style={styles.buttonGroup}>
              <TouchableOpacity style={styles.editButton} onPress={() => startEditing(item)}>
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteProduct(item.id)}>
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
};

export default AdminScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 12,
  },
  editButton: {
    backgroundColor: '#2196F3',
    padding: 8,
    borderRadius: 6,
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: '#f44336',
    padding: 8,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  buttonGroup: {
    flexDirection: 'row',
    marginTop: 8,
  },
  productItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 12,
  },
  productText: {
    fontSize: 16,
  },
});
