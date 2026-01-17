import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '../../../theme/palette';
import { textStyles } from '../../../theme/typography';
import { spacing, radii } from '../../../theme/tokens';

export default function OfferDetailScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.darkBg }}>
      <ScrollView>
        <View style={{ padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="arrow-back" size={24} color={palette.lightText} />
          </Pressable>
          <Text style={[textStyles.h3, { color: palette.lightText, flex: 1 }]}>Offer Details</Text>
        </View>

        <View style={{ padding: spacing.lg }}>
          <View style={{ height: 200, backgroundColor: palette.cardBg, borderRadius: radii.lg, marginBottom: spacing.lg }} />
          <Text style={[textStyles.h2, { color: palette.lightText, marginBottom: spacing.sm }]}>30% Off Full Service</Text>
          <Text style={[textStyles.body, { color: palette.textSecondary, marginBottom: spacing.xl, lineHeight: 24 }]}>
            Get 30% off on full car service at Premium Auto Care. Valid for all vehicles.
          </Text>

          <View style={{ backgroundColor: palette.cardBg, borderRadius: radii.lg, padding: spacing.lg, marginBottom: spacing.lg }}>
            <Text style={[textStyles.bodySmall, { color: palette.textSecondary, marginBottom: spacing.sm }]}>Promo Code</Text>
            <Text style={[textStyles.h3, { color: palette.gold }]}>SUBLIMES30</Text>
          </View>

          <Pressable
            style={{ backgroundColor: palette.gold, paddingVertical: spacing.lg, borderRadius: radii.lg, alignItems: 'center' }}
          >
            <Text style={[textStyles.button, { color: palette.darkBg }]}>Redeem Offer</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
