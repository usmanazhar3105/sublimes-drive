import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '../../../theme/palette';
import { textStyles } from '../../../theme/typography';
import { spacing } from '../../../theme/tokens';

export default function RefundScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.darkBg }}>
      <ScrollView>
        <View style={{ padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="arrow-back" size={24} color={palette.lightText} />
          </Pressable>
          <Text style={[textStyles.h3, { color: palette.lightText, flex: 1 }]}>Refund Policy</Text>
        </View>

        <View style={{ padding: spacing.xl }}>
          <Text style={[textStyles.h4, { color: palette.lightText, marginBottom: spacing.md }]}>Refund Eligibility</Text>
          <Text style={[textStyles.body, { color: palette.textSecondary, marginBottom: spacing.xl, lineHeight: 24 }]}>
            Refunds are available for unused listing packages, boost credits, and canceled services within 7 days of purchase.
          </Text>

          <Text style={[textStyles.h4, { color: palette.lightText, marginBottom: spacing.md }]}>How to Request a Refund</Text>
          <Text style={[textStyles.body, { color: palette.textSecondary, marginBottom: spacing.xl, lineHeight: 24 }]}>
            Contact our support team at refunds@sublimesdrive.com with your order number and reason for refund.
          </Text>

          <Text style={[textStyles.h4, { color: palette.lightText, marginBottom: spacing.md }]}>Processing Time</Text>
          <Text style={[textStyles.body, { color: palette.textSecondary, lineHeight: 24 }]}>
            Refunds are processed within 5-7 business days and will be credited to your original payment method.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
