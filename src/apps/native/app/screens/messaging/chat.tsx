import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '../../../theme/palette';
import { textStyles } from '../../../theme/typography';
import { spacing, radii } from '../../../theme/tokens';

export default function ChatScreen() {
  const [message, setMessage] = useState('');

  const messages = [
    { id: '1', text: 'Hi, is your BMW still available?', sent: false, time: '10:30 AM' },
    { id: '2', text: 'Yes, it is! Would you like to schedule a viewing?', sent: true, time: '10:32 AM' },
    { id: '3', text: 'That would be great. Are you free this weekend?', sent: false, time: '10:35 AM' },
    { id: '4', text: 'Saturday works for me. How about 2 PM?', sent: true, time: '10:37 AM' },
  ];

  const handleSend = () => {
    if (message.trim()) {
      setMessage('');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.darkBg }}>
      {/* Header */}
      <View
        style={{
          padding: spacing.lg,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: palette.border,
        }}
      >
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={palette.lightText} />
        </Pressable>
        <View style={{ position: 'relative', marginRight: spacing.sm }}>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: palette.cardBg }} />
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: palette.success,
              borderWidth: 2,
              borderColor: palette.darkBg,
            }}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[textStyles.body, { color: palette.lightText }]}>Ahmed Al Mansouri</Text>
          <Text style={[textStyles.caption, { color: palette.success }]}>Online</Text>
        </View>
        <Pressable hitSlop={8}>
          <Ionicons name="ellipsis-vertical" size={20} color={palette.textSecondary} />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        {/* Messages */}
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.lg }}>
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={{
                alignSelf: msg.sent ? 'flex-end' : 'flex-start',
                maxWidth: '75%',
                marginBottom: spacing.md,
              }}
            >
              <View
                style={{
                  backgroundColor: msg.sent ? palette.gold : palette.cardBg,
                  borderRadius: radii.lg,
                  padding: spacing.md,
                  borderBottomRightRadius: msg.sent ? 4 : radii.lg,
                  borderBottomLeftRadius: msg.sent ? radii.lg : 4,
                }}
              >
                <Text style={[textStyles.body, { color: msg.sent ? palette.darkBg : palette.lightText }]}>
                  {msg.text}
                </Text>
              </View>
              <Text
                style={[
                  textStyles.caption,
                  { color: palette.textSecondary, marginTop: spacing.xs, textAlign: msg.sent ? 'right' : 'left' },
                ]}
              >
                {msg.time}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* Input */}
        <View
          style={{
            padding: spacing.lg,
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.md,
            borderTopWidth: 1,
            borderTopColor: palette.border,
            backgroundColor: palette.darkBg,
          }}
        >
          <Pressable hitSlop={8}>
            <Ionicons name="add-circle-outline" size={28} color={palette.textSecondary} />
          </Pressable>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message..."
            placeholderTextColor={palette.textSecondary}
            multiline
            style={{
              flex: 1,
              backgroundColor: palette.cardBg,
              borderRadius: radii.pill,
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.sm,
              ...textStyles.body,
              color: palette.lightText,
              maxHeight: 100,
            }}
          />
          <Pressable onPress={handleSend} hitSlop={8}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: message.trim() ? palette.gold : palette.border,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="send" size={18} color={message.trim() ? palette.darkBg : palette.textSecondary} />
            </View>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
