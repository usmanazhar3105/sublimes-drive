import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '../../../theme/palette';
import { textStyles } from '../../../theme/typography';
import { spacing, radii } from '../../../theme/tokens';

export default function AIChatAssistantScreen() {
  const [message, setMessage] = useState('');
  const messages = [
    { id: '1', text: 'Hi! I\'m your AI assistant. How can I help you today?', isUser: false },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.darkBg }}>
      <View style={{ padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderBottomWidth: 1, borderBottomColor: palette.border }}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={palette.lightText} />
        </Pressable>
        <Ionicons name="sparkles" size={20} color={palette.gold} />
        <Text style={[textStyles.h3, { color: palette.lightText, flex: 1 }]}>AI Assistant</Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.lg }}>
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={{
                alignSelf: msg.isUser ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
                backgroundColor: msg.isUser ? palette.gold : palette.cardBg,
                borderRadius: radii.lg,
                padding: spacing.md,
                marginBottom: spacing.md,
              }}
            >
              <Text style={[textStyles.body, { color: msg.isUser ? palette.darkBg : palette.lightText }]}>{msg.text}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={{ padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderTopWidth: 1, borderTopColor: palette.border }}>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Ask me anything..."
            placeholderTextColor={palette.textSecondary}
            style={{
              flex: 1,
              backgroundColor: palette.cardBg,
              borderRadius: radii.pill,
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.sm,
              ...textStyles.body,
              color: palette.lightText,
            }}
          />
          <Pressable>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: palette.gold, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="send" size={18} color={palette.darkBg} />
            </View>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
