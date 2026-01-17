import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '../../../theme/palette';
import { textStyles } from '../../../theme/typography';
import { spacing, radii } from '../../../theme/tokens';

export default function RepairBidsScreen() {
  const bids = [
    { id: '1', garage: 'Premium Auto Care', price: 850, rating: 4.8, responseTime: '2 hours' },
    { id: '2', garage: 'Elite Motors', price: 920, rating: 4.9, responseTime: '1 hour' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.darkBg }}>
      <ScrollView>
        <View style={{ padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="arrow-back" size={24} color={palette.lightText} />
          </Pressable>
          <Text style={[textStyles.h3, { color: palette.lightText, flex: 1 }]}>Quotes Received</Text>
        </View>

        <View style={{ padding: spacing.lg }}>
          {bids.map((bid) => (
            <Pressable
              key={bid.id}
              style={{ backgroundColor: palette.cardBg, borderRadius: radii.lg, padding: spacing.lg, marginBottom: spacing.md }}
            >
              <Text style={[textStyles.h4, { color: palette.lightText, marginBottom: spacing.sm }]}>{bid.garage}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
                <Ionicons name="star" size={14} color={palette.gold} />
                <Text style={[textStyles.caption, { color: palette.textSecondary, marginLeft: spacing.xs }]}>{bid.rating}</Text>
              </View>
              <Text style={[textStyles.h2, { color: palette.gold, marginBottom: spacing.md }]}>AED {bid.price}</Text>
              <Pressable style={{ backgroundColor: palette.gold, paddingVertical: spacing.md, borderRadius: radii.md, alignItems: 'center' }}>
                <Text style={[textStyles.button, { color: palette.darkBg }]}>Accept Quote</Text>
              </Pressable>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
