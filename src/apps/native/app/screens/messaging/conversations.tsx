import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '../../../theme/palette';
import { textStyles } from '../../../theme/typography';
import { spacing, radii } from '../../../theme/tokens';

export default function ConversationsScreen() {
  const conversations = [
    {
      id: '1',
      name: 'Ahmed Al Mansouri',
      lastMessage: 'Is the car still available?',
      time: '2m ago',
      unread: 2,
      online: true,
    },
    {
      id: '2',
      name: 'Premium Auto Care',
      lastMessage: 'Your service is scheduled for tomorrow',
      time: '1h ago',
      unread: 0,
      online: false,
    },
    {
      id: '3',
      name: 'Sara Khan',
      lastMessage: 'Thanks for the info!',
      time: '3h ago',
      unread: 0,
      online: true,
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.darkBg }}>
      {/* Header */}
      <View style={{ padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={palette.lightText} />
        </Pressable>
        <Text style={[textStyles.h3, { color: palette.lightText, flex: 1 }]}>Messages</Text>
        <Pressable>
          <Ionicons name="create-outline" size={24} color={palette.gold} />
        </Pressable>
      </View>

      <ScrollView>
        <View style={{ padding: spacing.lg }}>
          {conversations.map((conv) => (
            <Pressable
              key={conv.id}
              onPress={() => router.push('/screens/messaging/chat')}
              style={{
                backgroundColor: palette.cardBg,
                borderRadius: radii.lg,
                padding: spacing.lg,
                marginBottom: spacing.md,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <View style={{ position: 'relative', marginRight: spacing.md }}>
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    backgroundColor: palette.darkBg,
                  }}
                />
                {conv.online && (
                  <View
                    style={{
                      position: 'absolute',
                      bottom: 2,
                      right: 2,
                      width: 14,
                      height: 14,
                      borderRadius: 7,
                      backgroundColor: palette.success,
                      borderWidth: 2,
                      borderColor: palette.cardBg,
                    }}
                  />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs }}>
                  <Text style={[textStyles.body, { color: palette.lightText }]}>{conv.name}</Text>
                  <Text style={[textStyles.caption, { color: palette.textSecondary }]}>{conv.time}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text
                    style={[textStyles.bodySmall, { color: conv.unread > 0 ? palette.lightText : palette.textSecondary, flex: 1 }]}
                    numberOfLines={1}
                  >
                    {conv.lastMessage}
                  </Text>
                  {conv.unread > 0 && (
                    <View
                      style={{
                        backgroundColor: palette.gold,
                        borderRadius: radii.pill,
                        paddingHorizontal: spacing.sm,
                        paddingVertical: 2,
                        marginLeft: spacing.sm,
                      }}
                    >
                      <Text style={[textStyles.caption, { color: palette.darkBg }]}>{conv.unread}</Text>
                    </View>
                  )}
                </View>
              </View>
            </Pressable>
          ))}

          {/* Empty State */}
          {conversations.length === 0 && (
            <View style={{ alignItems: 'center', paddingVertical: spacing['4xl'] }}>
              <Ionicons name="chatbubbles-outline" size={64} color={palette.textSecondary} />
              <Text style={[textStyles.h3, { color: palette.lightText, marginTop: spacing.lg }]}>No Messages</Text>
              <Text style={[textStyles.body, { color: palette.textSecondary, marginTop: spacing.sm }]}>
                Start a conversation
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
