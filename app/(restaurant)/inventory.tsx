import { getThemedStyles, useTheme } from '@/contexts/ThemeContext';
import { addMenuItem as createMenuItem, deleteMenuItem, getMenuItems, supabase, updateMenuItem } from '@/lib/supabase';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import {
    AlertCircle,
    Check,
    Edit3,
    Image as ImageIcon,
    Leaf,
    Package,
    Plus,
    Trash2,
    TrendingUp,
    X
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  image_url: string;
  is_available: boolean;
  stock_quantity: number;
  is_vegetarian: boolean;
  is_vegan: boolean;
}

const categories = ['Appetizers', 'Mains', 'Desserts', 'Beverages', 'Sides'];

export default function InventoryManagement() {
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors, isDark);

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Appetizers',
    price: '',
    stock_quantity: '',
    is_available: true,
    is_vegetarian: false,
    is_vegan: false,
    image_url: '',
  });

  useEffect(() => {
    loadMenuItems();
  }, []);

  useEffect(() => {
    filterItems();
  }, [selectedCategory, menuItems]);

  const loadMenuItems = async () => {
    try {
      setLoading(true);
      // Get current user's restaurant
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: restaurant } = await supabase
        .from('restaurants')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (restaurant) {
        const items = await getMenuItems(restaurant.id);
        setMenuItems(items as MenuItem[]);
      }
    } catch (error) {
      console.error('Error loading menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    if (selectedCategory === 'All') {
      setFilteredItems(menuItems);
    } else {
      setFilteredItems(menuItems.filter(item => item.category === selectedCategory));
    }
  };

  const handleOpenModal = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        description: item.description || '',
        category: item.category,
        price: item.price.toString(),
        stock_quantity: item.stock_quantity.toString(),
        is_available: item.is_available,
        is_vegetarian: item.is_vegetarian,
        is_vegan: item.is_vegan,
        image_url: item.image_url || '',
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        description: '',
        category: 'Appetizers',
        price: '',
        stock_quantity: '',
        is_available: true,
        is_vegetarian: false,
        is_vegan: false,
        image_url: '',
      });
    }
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingItem(null);
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      // In production, upload to Supabase Storage
      setFormData({ ...formData, image_url: result.assets[0].uri });
    }
  };

  const handleSave = async () => {
    try {
      if (!formData.name || !formData.price) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: restaurant } = await supabase
        .from('restaurants')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (!restaurant) return;

      const itemData = {
        restaurant_id: restaurant.id,
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        is_available: formData.is_available,
        is_vegetarian: formData.is_vegetarian,
        is_vegan: formData.is_vegan,
        image_url: formData.image_url,
      };

      if (editingItem) {
        await updateMenuItem(editingItem.id, itemData);
      } else {
        await createMenuItem(itemData);
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      handleCloseModal();
      loadMenuItems();
    } catch (error) {
      console.error('Error saving item:', error);
      Alert.alert('Error', 'Failed to save menu item');
    }
  };

  const handleDelete = (item: MenuItem) => {
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete "${item.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMenuItem(item.id);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              loadMenuItems();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete item');
            }
          },
        },
      ]
    );
  };

  const toggleAvailability = async (item: MenuItem) => {
    try {
      await updateMenuItem(item.id, { is_available: !item.is_available });
      loadMenuItems();
    } catch (error) {
      Alert.alert('Error', 'Failed to update availability');
    }
  };

  const renderStats = () => {
    const totalItems = menuItems.length;
    const availableItems = menuItems.filter(i => i.is_available).length;
    const lowStock = menuItems.filter(i => i.stock_quantity < 10).length;
    const totalValue = menuItems.reduce((sum, i) => sum + (i.price * i.stock_quantity), 0);

    return (
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Package size={24} color={colors.primary} />
          <Text style={styles.statValue}>{totalItems}</Text>
          <Text style={styles.statLabel}>Total Items</Text>
        </View>

        <View style={styles.statCard}>
          <Check size={24} color={colors.success} />
          <Text style={styles.statValue}>{availableItems}</Text>
          <Text style={styles.statLabel}>Available</Text>
        </View>

        <View style={styles.statCard}>
          <AlertCircle size={24} color={colors.warning} />
          <Text style={styles.statValue}>{lowStock}</Text>
          <Text style={styles.statLabel}>Low Stock</Text>
        </View>

        <View style={styles.statCard}>
          <TrendingUp size={24} color={colors.accent} />
          <Text style={styles.statValue}>${totalValue.toFixed(0)}</Text>
          <Text style={styles.statLabel}>Total Value</Text>
        </View>
      </View>
    );
  };

  const renderMenuItem = (item: MenuItem) => (
    <View key={item.id} style={styles.menuItem}>
      <Image
        source={{ uri: item.image_url || 'https://via.placeholder.com/80' }}
        style={styles.itemImage}
      />

      <View style={styles.itemInfo}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemName}>{item.name}</Text>
          <View style={styles.badges}>
            {item.is_vegetarian && (
              <View style={styles.badge}>
                <Leaf size={12} color={colors.success} />
              </View>
            )}
            {item.is_vegan && (
              <View style={[styles.badge, { backgroundColor: colors.success + '20' }]}>
                <Text style={{ fontSize: 10, color: colors.success }}>V</Text>
              </View>
            )}
          </View>
        </View>

        <Text style={styles.itemCategory}>{item.category}</Text>
        <Text style={styles.itemDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.itemFooter}>
          <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
          <Text style={styles.itemStock}>Stock: {item.stock_quantity}</Text>
          
          <Switch
            value={item.is_available}
            onValueChange={() => toggleAvailability(item)}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      <View style={styles.itemActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleOpenModal(item)}
        >
          <Edit3 size={18} color={colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.error + '15' }]}
          onPress={() => handleDelete(item)}
        >
          <Trash2 size={18} color={colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderModal = () => (
    <Modal
      visible={modalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleCloseModal}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingItem ? 'Edit Item' : 'Add New Item'}
            </Text>
            <TouchableOpacity onPress={handleCloseModal}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Image Picker */}
            <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage}>
              {formData.image_url ? (
                <Image source={{ uri: formData.image_url }} style={styles.pickedImage} />
              ) : (
                <View style={styles.imagePickerPlaceholder}>
                  <ImageIcon size={32} color={colors.textLight} />
                  <Text style={styles.imagePickerText}>Add Photo</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Form Fields */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Item Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="e.g., Margherita Pizza"
                placeholderTextColor={colors.textLight}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                placeholder="Brief description..."
                placeholderTextColor={colors.textLight}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.label}>Category *</Text>
                <View style={styles.categoryButtons}>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryButton,
                        formData.category === cat && styles.categoryButtonActive,
                      ]}
                      onPress={() => setFormData({ ...formData, category: cat })}
                    >
                      <Text
                        style={[
                          styles.categoryButtonText,
                          formData.category === cat && styles.categoryButtonTextActive,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Price ($) *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.price}
                  onChangeText={(text) => setFormData({ ...formData, price: text })}
                  placeholder="0.00"
                  placeholderTextColor={colors.textLight}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Stock Qty</Text>
                <TextInput
                  style={styles.input}
                  value={formData.stock_quantity}
                  onChangeText={(text) => setFormData({ ...formData, stock_quantity: text })}
                  placeholder="0"
                  placeholderTextColor={colors.textLight}
                  keyboardType="number-pad"
                />
              </View>
            </View>

            {/* Toggles */}
            <View style={styles.toggleRow}>
              <Text style={styles.label}>Available</Text>
              <Switch
                value={formData.is_available}
                onValueChange={(value) => setFormData({ ...formData, is_available: value })}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.toggleRow}>
              <Text style={styles.label}>Vegetarian</Text>
              <Switch
                value={formData.is_vegetarian}
                onValueChange={(value) => setFormData({ ...formData, is_vegetarian: value })}
                trackColor={{ false: colors.border, true: colors.success }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.toggleRow}>
              <Text style={styles.label}>Vegan</Text>
              <Switch
                value={formData.is_vegan}
                onValueChange={(value) => setFormData({ ...formData, is_vegan: value })}
                trackColor={{ false: colors.border, true: colors.success }}
                thumbColor="#FFFFFF"
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={handleCloseModal}
            >
              <Text style={styles.buttonSecondaryText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary]}
              onPress={handleSave}
            >
              <LinearGradient
                colors={[colors.gradient.start, colors.gradient.end]}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.buttonPrimaryText}>Save Item</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={[colors.secondary, colors.secondary + 'CC']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Menu Inventory</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => handleOpenModal()}
        >
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Stats */}
      {renderStats()}

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {['All', ...categories].map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryChip,
              selectedCategory === cat && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text
              style={[
                styles.categoryChipText,
                selectedCategory === cat && styles.categoryChipTextActive,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Menu Items List */}
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {filteredItems.map(renderMenuItem)}
        <View style={{ height: 100 }} />
      </ScrollView>

      {renderModal()}
    </View>
  );
}

const createStyles = (colors: any, isDark: boolean) => {
  const themedStyles = getThemedStyles(isDark);

  return StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 60,
      paddingBottom: 20,
      paddingHorizontal: 20,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    addButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    statsContainer: {
      flexDirection: 'row',
      padding: 20,
      gap: 12,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 12,
      alignItems: 'center',
      ...themedStyles.shadow,
    },
    statValue: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginTop: 8,
    },
    statLabel: {
      fontSize: 11,
      color: colors.textLight,
      marginTop: 4,
    },
    categoriesContainer: {
      paddingHorizontal: 20,
      gap: 12,
      marginBottom: 16,
    },
    categoryChip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    categoryChipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    categoryChipText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    categoryChipTextActive: {
      color: '#FFFFFF',
    },
    list: {
      flex: 1,
      paddingHorizontal: 20,
    },
    menuItem: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 12,
      marginBottom: 12,
      ...themedStyles.shadow,
    },
    itemImage: {
      width: 80,
      height: 80,
      borderRadius: 12,
    },
    itemInfo: {
      flex: 1,
      marginLeft: 12,
    },
    itemHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    itemName: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      flex: 1,
    },
    badges: {
      flexDirection: 'row',
      gap: 4,
    },
    badge: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: colors.success + '20',
      justifyContent: 'center',
      alignItems: 'center',
    },
    itemCategory: {
      fontSize: 12,
      color: colors.textLight,
      marginTop: 2,
    },
    itemDescription: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 4,
    },
    itemFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
      gap: 12,
    },
    itemPrice: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.primary,
    },
    itemStock: {
      fontSize: 12,
      color: colors.textLight,
    },
    itemActions: {
      justifyContent: 'space-between',
      marginLeft: 8,
    },
    actionButton: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: colors.primary + '15',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: '90%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
    },
    modalBody: {
      padding: 20,
    },
    imagePicker: {
      width: '100%',
      height: 200,
      borderRadius: 16,
      backgroundColor: colors.surfaceAlt,
      marginBottom: 20,
      overflow: 'hidden',
    },
    pickedImage: {
      width: '100%',
      height: '100%',
    },
    imagePickerPlaceholder: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    imagePickerText: {
      fontSize: 14,
      color: colors.textLight,
      marginTop: 8,
    },
    formGroup: {
      marginBottom: 16,
    },
    formRow: {
      flexDirection: 'row',
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    input: {
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: 14,
      fontSize: 15,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
    },
    textArea: {
      height: 80,
      textAlignVertical: 'top',
    },
    categoryButtons: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    categoryButton: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    categoryButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    categoryButtonText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
    },
    categoryButtonTextActive: {
      color: '#FFFFFF',
    },
    toggleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    modalFooter: {
      flexDirection: 'row',
      padding: 20,
      gap: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    button: {
      flex: 1,
      height: 50,
      borderRadius: 12,
      overflow: 'hidden',
    },
    buttonSecondary: {
      backgroundColor: colors.surfaceAlt,
      justifyContent: 'center',
      alignItems: 'center',
    },
    buttonSecondaryText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    buttonPrimary: {},
    buttonGradient: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    buttonPrimaryText: {
      fontSize: 16,
      fontWeight: '700',
      color: '#FFFFFF',
    },
  });
};