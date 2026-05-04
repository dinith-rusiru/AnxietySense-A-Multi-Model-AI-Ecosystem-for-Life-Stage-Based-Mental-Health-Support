

import React, { useState, useRef } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  FlatList, KeyboardAvoidingView, Platform, SafeAreaView,
  StatusBar
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons'; // Added for back button

const API_URL = 'http://127.0.0.1:8002'; // For Android emulator use http://10.0.2.2:8000

export default function Chatbot() {
  const navigation = useNavigation();

  const [messages, setMessages] = useState([
    { id: '1', role: 'chatbot', text: 'Hello! I am your AI Emotional Support Chatbot. How are you feeling today?' }
  ]);
  const [inputText, setInputText] = useState('');
  const [facialEmotion, setFacialEmotion] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef(null);

  const predefinedMoods = ['Happy', 'Neutral', 'Stressed', 'Sad'];
  const suggestedReplies = [
    "I'm feeling anxious.",
    "Can we do a breathing exercise?",
    "I just need someone to talk to.",
    "I'm feeling really happy today!",
    "I feel overwhelmed with work.",
    "What grounding techniques do you know?"
  ];

  const handleSend = async (text = inputText, facial = facialEmotion) => {
    if (!text.trim()) return;

    const userMessage = { id: Date.now().toString(), role: 'user', text: text.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_message: text.trim(),
          facial_emotion: facial || null,
          history: messages.map(m => ({ role: m.role, content: m.text }))
        }),
      });

      const data = await response.json();
      
      const botMessage = { 
        id: (Date.now() + 1).toString(), 
        role: 'chatbot', 
        text: data.chatbot_response || "I'm here for you.",
        emotion: data.detected_emotion
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage = { 
        id: (Date.now() + 1).toString(), 
        role: 'chatbot', 
        text: "Sorry, I'm having trouble connecting to the server. Please ensure the backend is running." 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.messageContainer, isUser ? styles.userMessageContainer : styles.botMessageContainer]}>
        {!isUser && (
          <View style={styles.botAvatar}>
            <Text style={styles.botAvatarText}>AI</Text>
          </View>
        )}
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.botBubble]}>
          <Text style={[styles.messageText, isUser ? styles.userText : styles.botText]}>
            {item.text}
          </Text>
          {item.emotion && (
            <Text style={styles.emotionText}>Detected Emotion: {item.emotion}</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
        </TouchableOpacity>

        <View style={{ alignItems: 'center' }}>
          <Text style={styles.headerTitle}>Mood-Aware Support</Text>
          <Text style={styles.headerSubtitle}>AI Mental Health Chatbot</Text>
        </View>
      </View>

      {/* Daily Mood Check-in */}
      {messages.length === 1 && (
        <View style={styles.moodCheckin}>
          <Text style={styles.moodTitle}>Daily Mood Check-In</Text>
          <View style={styles.moodButtonsContainer}>
            {predefinedMoods.map(mood => (
              <TouchableOpacity 
                key={mood} 
                style={styles.moodButton}
                onPress={() => handleSend(`I feel ${mood.toLowerCase()}`, mood)}
              >
                <Text style={styles.moodButtonText}>{mood}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Chat Area */}
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.chatList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {isTyping && (
          <View style={styles.typingIndicator}>
            <Text style={styles.typingText}>AI is typing...</Text>
          </View>
        )}

        {/* Suggested Replies */}
        {messages.length > 1 && !isTyping && (
          <View>
            <FlatList
              data={suggestedReplies}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, index) => index.toString()}
              contentContainerStyle={styles.suggestionsContainer}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.suggestionBadge}
                  onPress={() => handleSend(item)}
                >
                  <Text style={styles.suggestionText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type your message here..."
            placeholderTextColor="#888"
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={() => handleSend()}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: {
    padding: 20,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    top: 20, 
    zIndex: 10,
    padding: 4,
  },
  headerTitle: { color: '#F8FAFC', fontSize: 20, fontWeight: 'bold' },
  headerSubtitle: { color: '#94A3B8', fontSize: 14, marginTop: 4 },
  moodCheckin: {
    margin: 16,
    padding: 16,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  moodTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: '600', marginBottom: 12, textAlign: 'center' },
  moodButtonsContainer: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' },
  moodButton: { backgroundColor: '#3B82F6', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, marginBottom: 8, minWidth: '48%', alignItems: 'center' },
  moodButtonText: { color: '#FFFFFF', fontWeight: '600' },
  keyboardAvoid: { flex: 1 },
  chatList: { padding: 16, paddingBottom: 20 },
  messageContainer: { flexDirection: 'row', marginBottom: 16, alignItems: 'flex-end' },
  userMessageContainer: { justifyContent: 'flex-end' },
  botMessageContainer: { justifyContent: 'flex-start' },
  botAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#3B82F6', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  botAvatarText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  messageBubble: { maxWidth: '80%', padding: 14, borderRadius: 20 },
  userBubble: { backgroundColor: '#3B82F6', borderBottomRightRadius: 4 },
  botBubble: { backgroundColor: '#1E293B', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#334155' },
  userText: { color: '#FFFFFF', fontSize: 16 },
  botText: { color: '#F8FAFC', fontSize: 16, lineHeight: 24 },
  emotionText: { color: '#94A3B8', fontSize: 12, marginTop: 8, fontStyle: 'italic' },
  typingIndicator: { paddingLeft: 56, paddingBottom: 16 },
  typingText: { color: '#94A3B8', fontSize: 14, fontStyle: 'italic' },
  suggestionsContainer: { paddingHorizontal: 16, paddingBottom: 12 },
  suggestionBadge: { backgroundColor: '#334155', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: '#475569' },
  suggestionText: { color: '#E2E8F0', fontSize: 14 },
  inputContainer: { flexDirection: 'row', padding: 16, backgroundColor: '#1E293B', borderTopWidth: 1, borderTopColor: '#334155', alignItems: 'center' },
  input: { flex: 1, backgroundColor: '#0F172A', color: '#F8FAFC', borderRadius: 24, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12, maxHeight: 100, borderWidth: 1, borderColor: '#334155' },
  sendButton: { marginLeft: 12, backgroundColor: '#3B82F6', borderRadius: 24, paddingVertical: 12, paddingHorizontal: 20, justifyContent: 'center' },
  sendButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
});