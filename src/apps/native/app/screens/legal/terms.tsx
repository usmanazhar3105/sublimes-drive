import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '../../../theme/palette';
import { textStyles } from '../../../theme/typography';
import { spacing, radii } from '../../../theme/tokens';

export default function TermsScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.darkBg }}>
      <ScrollView>
        {/* Header */}
        <View style={{ padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="arrow-back" size={24} color={palette.lightText} />
          </Pressable>
          <Text style={[textStyles.h3, { color: palette.lightText, flex: 1 }]}>Terms of Service</Text>
        </View>

        <View style={{ padding: spacing.xl }}>
          <Text style={[textStyles.caption, { color: palette.textSecondary, marginBottom: spacing.xl }]}>
            Last updated: January 1, 2025
          </Text>

          <Text style={[textStyles.h4, { color: palette.lightText, marginBottom: spacing.md }]}>1. Acceptance of Terms</Text>
          <Text style={[textStyles.body, { color: palette.textSecondary, marginBottom: spacing.xl, lineHeight: 24 }]}>
            By accessing and using Sublimes Drive, you accept and agree to be bound by the terms and provision of this agreement.
          </Text>

          <Text style={[textStyles.h4, { color: palette.lightText, marginBottom: spacing.md }]}>2. Use License</Text>
          <Text style={[textStyles.body, { color: palette.textSecondary, marginBottom: spacing.xl, lineHeight: 24 }]}>
            Permission is granted to temporarily use Sublimes Drive for personal, non-commercial transitory viewing only.
          </Text>

          <Text style={[textStyles.h4, { color: palette.lightText, marginBottom: spacing.md }]}>3. User Responsibilities</Text>
          <Text style={[textStyles.body, { color: palette.textSecondary, marginBottom: spacing.md, lineHeight: 24 }]}>
            Users must:
          </Text>
          <Text style={[textStyles.body, { color: palette.textSecondary, marginBottom: spacing.sm, lineHeight: 24 }]}>
            • Provide accurate information
          </Text>
          <Text style={[textStyles.body, { color: palette.textSecondary, marginBottom: spacing.sm, lineHeight: 24 }]}>
            • Maintain account security
          </Text>
          <Text style={[textStyles.body, { color: palette.textSecondary, marginBottom: spacing.xl, lineHeight: 24 }]}>
            • Comply with UAE laws
          </Text>

          <Text style={[textStyles.h4, { color: palette.lightText, marginBottom: spacing.md }]}>4. Prohibited Activities</Text>
          <Text style={[textStyles.body, { color: palette.textSecondary, marginBottom: spacing.xl, lineHeight: 24 }]}>
            You may not use the platform for any illegal purposes or engage in fraudulent activities.
          </Text>

          <Text style={[textStyles.h4, { color: palette.lightText, marginBottom: spacing.md }]}>5. Contact Us</Text>
          <Text style={[textStyles.body, { color: palette.textSecondary, lineHeight: 24 }]}>
            For questions about these Terms, contact us at legal@sublimesdrive.com
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
