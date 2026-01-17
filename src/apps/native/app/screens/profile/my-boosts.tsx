import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '../../../theme/palette';
import { textStyles } from '../../../theme/typography';
import { spacing, radii } from '../../../theme/tokens';

export default function MyBoostsScreen() {
  const activeBoosts = [
    {
      id: '1',
      listing: '2022 BMW M4 Competition',
      type: '7-Day Boost',
      startDate: '2 days ago',
      endsIn: '5 days',
      views: 1234,
      impressions: 5678,
    },
  ];

  const boostHistory = [
    {
      id: '2',
      listing: '2021 Audi RS6 Avant',
      type: '3-Day Boost',
      date: '2 weeks ago',
      views: 892,
      impressions: 3421,
    },
  ];

  const boostPackages = [
    {
      id: '1',
      name: '3-Day Boost',
      price: 'AED 149',
      features: ['3x visibility', 'Top of search results', 'Featured badge'],
    },
    {
      id: '2',
      name: '7-Day Boost',
      price: 'AED 299',
      features: ['5x visibility', 'Top of search results', 'Featured badge', 'Homepage feature'],
      popular: true,
    },
    {
      id: '3',
      name: '14-Day Boost',
      price: 'AED 499',
      features: ['10x visibility', 'Top of search results', 'Featured badge', 'Homepage feature', 'Social media feature'],
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.darkBg }}>
      {/* Header */}
      <View style={{ padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={palette.lightText} />
        </Pressable>
        <Text style={[textStyles.h3, { color: palette.lightText, flex: 1 }]}>My Boosts</Text>
        <Ionicons name="flash" size={24} color={palette.gold} />
      </View>

      <ScrollView>
        <View style={{ padding: spacing.lg }}>
          {/* Active Boosts */}
          {activeBoosts.length > 0 && (
            <View style={{ marginBottom: spacing.xl }}>
              <Text style={[textStyles.h4, { color: palette.lightText, marginBottom: spacing.md }]}>Active Boosts</Text>
              {activeBoosts.map((boost) => (
                <View
                  key={boost.id}
                  style={{
                    backgroundColor: palette.cardBg,
                    borderRadius: radii.lg,
                    padding: spacing.lg,
                    marginBottom: spacing.md,
                    borderLeftWidth: 4,
                    borderLeftColor: palette.gold,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
                    <Ionicons name="flash" size={20} color={palette.gold} />
                    <Text style={[textStyles.h4, { color: palette.gold, marginLeft: spacing.sm }]}>{boost.type}</Text>
                  </View>
                  <Text style={[textStyles.body, { color: palette.lightText, marginBottom: spacing.md }]}>
                    {boost.listing}
                  </Text>
                  <View style={{ flexDirection: 'row', gap: spacing.xl, marginBottom: spacing.md }}>
                    <View>
                      <Text style={[textStyles.caption, { color: palette.textSecondary }]}>Views</Text>
                      <Text style={[textStyles.h4, { color: palette.lightText }]}>{boost.views}</Text>
                    </View>
                    <View>
                      <Text style={[textStyles.caption, { color: palette.textSecondary }]}>Impressions</Text>
                      <Text style={[textStyles.h4, { color: palette.lightText }]}>{boost.impressions}</Text>
                    </View>
                  </View>
                  <View
                    style={{
                      backgroundColor: palette.darkBg,
                      paddingHorizontal: spacing.md,
                      paddingVertical: spacing.sm,
                      borderRadius: radii.sm,
                      alignSelf: 'flex-start',
                    }}
                  >
                    <Text style={[textStyles.caption, { color: palette.gold }]}>Ends in {boost.endsIn}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Boost History */}
          {boostHistory.length > 0 && (
            <View style={{ marginBottom: spacing.xl }}>
              <Text style={[textStyles.h4, { color: palette.lightText, marginBottom: spacing.md }]}>Boost History</Text>
              {boostHistory.map((boost) => (
                <View
                  key={boost.id}
                  style={{
                    backgroundColor: palette.cardBg,
                    borderRadius: radii.lg,
                    padding: spacing.lg,
                    marginBottom: spacing.md,
                    opacity: 0.8,
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm }}>
                    <View style={{ flex: 1 }}>
                      <Text style={[textStyles.caption, { color: palette.gold, marginBottom: spacing.xs }]}>
                        {boost.type}
                      </Text>
                      <Text style={[textStyles.body, { color: palette.lightText }]}>{boost.listing}</Text>
                    </View>
                    <Text style={[textStyles.caption, { color: palette.textSecondary }]}>{boost.date}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: spacing.xl }}>
                    <View>
                      <Text style={[textStyles.caption, { color: palette.textSecondary }]}>Views</Text>
                      <Text style={[textStyles.bodySmall, { color: palette.textSecondary }]}>{boost.views}</Text>
                    </View>
                    <View>
                      <Text style={[textStyles.caption, { color: palette.textSecondary }]}>Impressions</Text>
                      <Text style={[textStyles.bodySmall, { color: palette.textSecondary }]}>{boost.impressions}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Boost Packages */}
          <Text style={[textStyles.h4, { color: palette.lightText, marginBottom: spacing.md }]}>Boost Packages</Text>
          {boostPackages.map((pkg) => (
            <View
              key={pkg.id}
              style={{
                backgroundColor: palette.cardBg,
                borderRadius: radii.lg,
                padding: spacing.lg,
                marginBottom: spacing.md,
                borderWidth: pkg.popular ? 2 : 0,
                borderColor: palette.gold,
              }}
            >
              {pkg.popular && (
                <View
                  style={{
                    position: 'absolute',
                    top: spacing.md,
                    right: spacing.md,
                    backgroundColor: palette.gold,
                    paddingHorizontal: spacing.sm,
                    paddingVertical: spacing.xs,
                    borderRadius: radii.sm,
                  }}
                >
                  <Text style={[textStyles.caption, { color: palette.darkBg }]}>POPULAR</Text>
                </View>
              )}
              <Text style={[textStyles.h3, { color: palette.lightText, marginBottom: spacing.xs }]}>{pkg.name}</Text>
              <Text style={[textStyles.h2, { color: palette.gold, marginBottom: spacing.lg }]}>{pkg.price}</Text>
              {pkg.features.map((feature, index) => (
                <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
                  <Ionicons name="checkmark-circle" size={16} color={palette.gold} />
                  <Text style={[textStyles.bodySmall, { color: palette.lightText, marginLeft: spacing.sm }]}>
                    {feature}
                  </Text>
                </View>
              ))}
              <Pressable
                style={{
                  backgroundColor: palette.gold,
                  paddingVertical: spacing.md,
                  borderRadius: radii.md,
                  alignItems: 'center',
                  marginTop: spacing.md,
                }}
              >
                <Text style={[textStyles.button, { color: palette.darkBg }]}>Purchase Boost</Text>
              </Pressable>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
