import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '../../../theme/palette';
import { textStyles } from '../../../theme/typography';
import { spacing } from '../../../theme/tokens';

export default function PrivacyScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.darkBg }}>
      <ScrollView>
        <View style={{ padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="arrow-back" size={24} color={palette.lightText} />
          </Pressable>
          <Text style={[textStyles.h3, { color: palette.lightText, flex: 1 }]}>Privacy Policy</Text>
        </View>

        <View style={{ padding: spacing.xl }}>
          <Text style={[textStyles.caption, { color: palette.textSecondary, marginBottom: spacing.xl }]}>
            Last updated: January 1, 2025
          </Text>

          <Text style={[textStyles.h4, { color: palette.lightText, marginBottom: spacing.md }]}>1. Information We Collect</Text>
          <Text style={[textStyles.body, { color: palette.textSecondary, marginBottom: spacing.xl, lineHeight: 24 }]}>
            We collect information you provide directly: name, email, phone, vehicle information, and payment details.
          </Text>

          <Text style={[textStyles.h4, { color: palette.lightText, marginBottom: spacing.md }]}>2. How We Use Your Data</Text>
          <Text style={[textStyles.body, { color: palette.textSecondary, marginBottom: spacing.xl, lineHeight: 24 }]}>
            Your data is used to provide services, process transactions, send notifications, and improve our platform.
          </Text>

          <Text style={[textStyles.h4, { color: palette.lightText, marginBottom: spacing.md }]}>3. Data Protection</Text>
          <Text style={[textStyles.body, { color: palette.textSecondary, marginBottom: spacing.xl, lineHeight: 24 }]}>
            We implement industry-standard security measures to protect your personal information and comply with UAE data protection laws.
          </Text>

          <Text style={[textStyles.h4, { color: palette.lightText, marginBottom: spacing.md }]}>4. Third-Party Sharing</Text>
          <Text style={[textStyles.body, { color: palette.textSecondary, marginBottom: spacing.xl, lineHeight: 24 }]}>
            We do not sell your data. We may share information with service providers and garages as necessary to provide services.
          </Text>

          <Text style={[textStyles.h4, { color: palette.lightText, marginBottom: spacing.md }]}>5. Your Rights</Text>
          <Text style={[textStyles.body, { color: palette.textSecondary, lineHeight: 24 }]}>
            You have the right to access, correct, delete, or export your personal data. Contact privacy@sublimesdrive.com
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
