import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Animated,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Keyboard,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { todoAPI } from '../config/database';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');

// Cross-platform confirm dialog
const showConfirm = (title, message, onConfirm) => {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) {
      onConfirm();
    }
  } else {
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Confirm', style: 'destructive', onPress: onConfirm },
    ]);
  }
};

// Individual Todo Item Component
const TodoItem = ({ item, onToggle, onDelete, index }) => {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleDelete = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -width,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => onDelete(item.id));
  };

  return (
    <Animated.View
      style={[
        styles.todoItem,
        {
          transform: [
            { translateX: slideAnim },
            { scale: scaleAnim },
          ],
          opacity: opacityAnim,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.todoCheckbox}
        onPress={() => onToggle(item.id, item.completed)}
        activeOpacity={0.7}
      >
        <View style={[
          styles.checkbox,
          item.completed && styles.checkboxChecked,
        ]}>
          {item.completed && (
            <Ionicons name="checkmark" size={16} color="#fff" />
          )}
        </View>
      </TouchableOpacity>

      <View style={styles.todoContent}>
        <Text style={[
          styles.todoTitle,
          item.completed && styles.todoTitleCompleted,
        ]} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.todoTime}>
          {new Date(item.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => showConfirm('Delete Todo', 'Are you sure you want to delete this task?', handleDelete)}
        activeOpacity={0.7}
      >
        <Ionicons name="trash-outline" size={18} color={colors.danger} />
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function HomeScreen() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [filter, setFilter] = useState('all'); // all, active, completed

  const { user, logout, getToken } = useAuth();
  const inputRef = useRef(null);
  const headerAnim = useRef(new Animated.Value(0)).current;
  const fabAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(headerAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.spring(fabAnim, {
        toValue: 1,
        friction: 4,
        delay: 500,
        useNativeDriver: true,
      }),
    ]).start();
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const token = await getToken();
      const data = await todoAPI.getTodos(user.uid, token);
      setTodos(data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    } catch (error) {
      console.log('Fetch error:', error.message);
      // If API is not available, use local state
      console.log('Using local state mode');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const addTodo = async () => {
    const title = newTodo.trim();
    if (!title) return;

    setAdding(true);
    Keyboard.dismiss();

    try {
      const token = await getToken();
      const newItem = await todoAPI.createTodo(user.uid, title, token);
      setTodos(prev => [newItem, ...prev]);
    } catch (error) {
      // Fallback: create local todo
      const localTodo = {
        id: Date.now().toString(),
        title,
        completed: false,
        user_id: user.uid,
        created_at: new Date().toISOString(),
      };
      setTodos(prev => [localTodo, ...prev]);
    }

    setNewTodo('');
    setAdding(false);
  };

  const toggleTodo = async (todoId, currentStatus) => {
    // Optimistic update
    setTodos(prev =>
      prev.map(t => t.id === todoId ? { ...t, completed: !currentStatus } : t)
    );

    try {
      const token = await getToken();
      await todoAPI.toggleTodo(todoId, !currentStatus, token);
    } catch (error) {
      // Already updated locally, no rollback needed for demo
    }
  };

  const deleteTodo = async (todoId) => {
    setTodos(prev => prev.filter(t => t.id !== todoId));

    try {
      const token = await getToken();
      await todoAPI.deleteTodo(todoId, token);
    } catch (error) {
      // Already removed locally
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTodos();
  }, []);

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const completedCount = todos.filter(t => t.completed).length;
  const totalCount = todos.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const handleLogout = () => {
    showConfirm('Sign Out', 'Are you sure you want to sign out?', logout);
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="clipboard-outline" size={64} color={colors.textMuted} />
      </View>
      <Text style={styles.emptyTitle}>
        {filter === 'all' ? 'No tasks yet' : filter === 'active' ? 'No active tasks' : 'No completed tasks'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {filter === 'all' ? 'Add your first task to get started!' : 'Keep going! 🚀'}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading your tasks...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bgDark} />

      {/* Header */}
      <Animated.View style={[
        styles.header,
        {
          opacity: headerAnim,
          transform: [{
            translateY: headerAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [-30, 0],
            }),
          }],
        },
      ]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>
              Hello, {user?.displayName || 'there'} 👋
            </Text>
            <Text style={styles.headerDate}>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Stats Card */}
        <View style={styles.statsCard}>
          <View style={styles.statsLeft}>
            <Text style={styles.statsTitle}>Daily Progress</Text>
            <Text style={styles.statsCount}>
              <Text style={styles.statsHighlight}>{completedCount}</Text>
              {' / '}{totalCount} tasks done
            </Text>
          </View>
          <View style={styles.progressCircle}>
            <Text style={styles.progressText}>
              {totalCount > 0 ? Math.round(progressPercent) : 0}%
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
        </View>
      </Animated.View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {['all', 'active', 'completed'].map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f)}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Todo List */}
      <FlatList
        data={filteredTodos}
        keyExtractor={(item) => item.id?.toString()}
        renderItem={({ item, index }) => (
          <TodoItem
            item={item}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
            index={index}
          />
        )}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      />

      {/* Input Bar */}
      <View style={styles.inputBar}>
        <View style={styles.addInputContainer}>
          <Ionicons name="add-circle-outline" size={22} color={colors.textMuted} style={{ marginRight: 10 }} />
          <TextInput
            ref={inputRef}
            style={styles.addInput}
            placeholder="Add a new task..."
            placeholderTextColor={colors.textPlaceholder}
            value={newTodo}
            onChangeText={setNewTodo}
            onSubmitEditing={addTodo}
            returnKeyType="done"
            blurOnSubmit={false}
          />
          <TouchableOpacity
            style={[styles.addButton, (!newTodo.trim() || adding) && styles.addButtonDisabled]}
            onPress={addTodo}
            disabled={!newTodo.trim() || adding}
            activeOpacity={0.7}
          >
            {adding ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="arrow-up" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgDark,
    minHeight: '100%',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: colors.textSecondary,
  },

  // Header
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : Platform.OS === 'web' ? 24 : (StatusBar.currentHeight || 24) + 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: colors.bgCard,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    borderBottomWidth: 1,
    borderColor: colors.borderLight,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  headerDate: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.bgInput,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },

  // Stats
  statsCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsLeft: {},
  statsTitle: {
    fontSize: 13,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
  },
  statsCount: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
  },
  statsHighlight: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
  },
  progressCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.bgInput,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.primary,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: colors.bgInput,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },

  // Filters
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 10,
  },
  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  filterTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: '#fff',
  },

  // List
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    flexGrow: 1,
  },

  // Todo Item
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  todoCheckbox: {
    marginRight: 14,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  todoContent: {
    flex: 1,
  },
  todoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 22,
  },
  todoTitleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  todoTime: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 71, 87, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },

  // Input Bar
  inputBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    backgroundColor: colors.bgCard,
    borderTopWidth: 1,
    borderColor: colors.borderLight,
  },
  addInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgInput,
    borderRadius: 16,
    paddingLeft: 16,
    paddingRight: 6,
    height: 54,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  addInput: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
  },
  addButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: colors.bgCardLight,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 40,
    backgroundColor: colors.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: colors.textMuted,
  },
});
