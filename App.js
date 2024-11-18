// App.js

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
  Animated,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [isEditClicked, setIsEditClicked] = useState(false);
  const [editTask, setEditTask] = useState();

  // Load tasks from AsyncStorage 
  useEffect(() => {
    loadTasks();
  }, []);

  // Save tasks to AsyncStorage whenever new change is applied
  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  // Save tasks
  const saveTasks = async (tasksToSave) => {
    try {
      const jsonValue = JSON.stringify(tasksToSave);
      await AsyncStorage.setItem('@sampleToDoTasks', jsonValue);
    } catch (e) {
      console.error('Error saving tasks to AsyncStorage:', e);
    }
  };

  // Load from AsyncStorage
  const loadTasks = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('@sampleToDoTasks');
      if (jsonValue != null) {
        setTasks(JSON.parse(jsonValue));
      }
    } catch (e) {
      console.error('Error loading tasks from AsyncStorage:', e);
    }
  };

  // Create a new task with animation
  const addTask = () => {
    if (task.trim()) {
      const animationValue = new Animated.Value(0); 
      const newTask = {
        id: Date.now().toString(),
        text: task,
        status: false,
        animationValue, 
      };
      setTasks([...tasks, newTask]);
      Animated.timing(animationValue, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
      setTask('');
    }
  };

  // Delete task
  const deleteTask = (taskId) => {
    setTasks((prevTasks) => prevTasks.filter((item) => item.id !== taskId));
  };

  // Mark task as completed
  const markAsCompleted = (taskId) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, status: true } : task
      )
    );
  };

  // Edit task
  const editTaskFun = (taskId) => {
    const tempTask = tasks.find((item) => item.id === taskId);
    if (tempTask) {
      setEditTask(tempTask);
      setTask(tempTask.text);
      setIsEditClicked(true);
    } else {
      Alert.alert(`Task doesn't exist`);
    }
  };

  // Save edited task
  const editDone = () => {
    if (editTask) {
      if (task.trim()) {
        setTasks((prevTasks) =>
          prevTasks.map((tsk) =>
            tsk.id === editTask.id ? { ...tsk, text: task } : tsk
          )
        );
        setTask('');
      }
    } else {
      Alert.alert(`Task doesn't exist`);
    }
    setIsEditClicked(false);
  };

  // Clear completed tasks
  const clearCompletedTasks = () => {
    setTasks((prevTasks) => prevTasks.filter((task) => !task.status));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>To-Do List</Text>
      {isEditClicked ? (
        <>
          <Text style={styles.editTitle}>Edit your task</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Edit task"
              value={task}
              onChangeText={(text) => setTask(text)}
            />
            <TouchableOpacity style={styles.doneButton} onPress={editDone}>
              <Text style={styles.done}>Done</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Add a new task"
              value={task}
              onChangeText={(text) => setTask(text)}
            />
            <TouchableOpacity style={styles.addButton} onPress={addTask}>
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={tasks}
            renderItem={({ item }) => (
              <Animated.View
                style={[
                  styles.taskContainer,
                  { opacity: item.animationValue || 1 },
                  item.status && styles.completedTaskContainer,
                ]}
              >
                <TouchableOpacity
                  style={styles.taskTextContainer}
                  onPress={() => editTaskFun(item.id)}
                >
                  <Text
                    style={[
                      styles.taskText,
                      item.status && styles.completedTaskText,
                    ]}
                  >
                    {item.text}
                  </Text>
                </TouchableOpacity>
                {!item.status ? (
                  <View style={styles.tools}>
                    <TouchableOpacity
                      style={styles.completeButton}
                      onPress={() => markAsCompleted(item.id)}
                    >
                      <Text style={styles.completeButtonText}>✓</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => deleteTask(item.id)}
                    >
                      <Text style={styles.deleteButtonText}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <Text style={styles.checkmark}>✔️</Text>
                )}
              </Animated.View>
            )}
            keyExtractor={(item) => item.id}
          />
          {tasks.some((task) => task.status) && (
            <TouchableOpacity
              style={styles.clearCompletedButton}
              onPress={clearCompletedTasks}
            >
              <Text style={styles.clearCompletedButtonText}>
                Clear Completed
              </Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
}
//CSS styling for the whole application
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0e6ff', 
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#663399', 
    marginBottom: 20,
    textAlign: 'center',
  },
  editTitle: {
    fontSize: 20,
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    paddingHorizontal: 15,
    borderRadius: 25,
    backgroundColor: '#fff',
    fontSize: 16,
    shadowColor: '#663399',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  addButton: {
    backgroundColor: '#ffcc00',
    height: 50,
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10, // Slightly rounded corners
    marginLeft: 10,
    shadowColor: '#ffcc00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 5,
  },
  addButtonText: {
    color: '#333',
    fontSize: 20,
    fontWeight: 'bold',
  },
  doneButton: {
    backgroundColor: '#663399',
    height: 50,
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    marginLeft: 10,
    shadowColor: '#663399',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  done: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  taskContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    shadowColor: '#663399',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  completedTaskContainer: {
    backgroundColor: '#e0ffe0',
  },
  taskTextContainer: {
    flex: 1,
  },
  taskText: {
    fontSize: 18,
  },
  completedTaskText: {
    color: '#888', 
  },
  tools: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completeButton: {
    marginRight: 15,
  },
  completeButtonText: {
    fontSize: 24,
    color: 'green',
  },
  deleteButton: {},
  deleteButtonText: {
    fontSize: 24,
    color: '#FF5C5C',
  },
  checkmark: {
    fontSize: 24,
    color: 'green',
  },
  clearCompletedButton: {
    backgroundColor: '#ffcc00',
    height: 50,
    width: '60%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    margin: 20,
    alignSelf: 'center',
    shadowColor: '#FF5C5C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  clearCompletedButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
