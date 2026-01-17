import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '../../../theme/palette';
import { textStyles } from '../../../theme/typography';
import { spacing, radii } from '../../../theme/tokens';

export default function LegalHubScreen() {
  const legalItems = [
    { id: '1', title: 'Terms of Service', icon: 'document-text', route: '/screens/legal/terms' },
    { id: '2', title: 'Privacy Policy', icon: 'shield-checkmark', route: '/screens/legal/privacy' },
    { id: '3', title: 'Refund Policy', icon: 'cash', route: '/screens/legal/refund' },
    { id: '4', title: 'About Us', icon: 'information-circle', route: '/screens/legal/about' },
    { id: '5', title: 'FAQ & Knowledge Base', icon: 'help-circle', route: '/screens/legal/faq' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.darkBg }}>
      <ScrollView>
        {/* Header */}
        <View style={{ padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="arrow-back" size={24} color={palette.lightText} />
          </Pressable>
          <Text style={[textStyles.h3, { color: palette.lightText, flex: 1 }]}>Legal & Help</Text>
        </View>

        <View style={{ padding: spacing.lg }}>
          {legalItems.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => router.push(item.route as any)}
              style={{
                backgroundColor: palette.cardBg,
                borderRadius: radii.lg,
                padding: spacing.lg,
                marginBottom: spacing.md,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: radii.md,
                  backgroundColor: palette.darkBg,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: spacing.md,
                }}
              >
                <Ionicons name={item.icon as any} size={24} color={palette.gold} />
              </View>
              <Text style={[textStyles.body, { color: palette.lightText, flex: 1 }]}>{item.title}</Text>
              <Ionicons name="chevron-forward" size={20} color={palette.textSecondary} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
