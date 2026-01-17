import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '../../../theme/palette';
import { textStyles } from '../../../theme/typography';
import { spacing, radii } from '../../../theme/tokens';

type Tab = 'active' | 'pending' | 'sold';

export default function MyListingsScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('active');

  const listings = {
    active: [
      { id: '1', title: '2022 BMW M4 Competition', price: 'AED 450,000', views: 1234, boosted: true },
      { id: '2', title: '2021 Audi RS6 Avant', price: 'AED 380,000', views: 892, boosted: false },
    ],
    pending: [
      { id: '3', title: '2023 Mercedes C63 AMG', price: 'AED 520,000', status: 'Under Review' },
    ],
    sold: [
      { id: '4', title: '2020 Porsche 911', price: 'AED 620,000', soldDate: '2 weeks ago' },
    ],
  };

  const TabButton = ({ tab, label, count }: { tab: Tab; label: string; count: number }) => (
    <Pressable
      onPress={() => setActiveTab(tab)}
      style={{
        flex: 1,
        paddingVertical: spacing.md,
        borderBottomWidth: 2,
        borderBottomColor: activeTab === tab ? palette.gold : 'transparent',
        alignItems: 'center',
      }}
    >
      <Text style={[textStyles.body, { color: activeTab === tab ? palette.gold : palette.textSecondary }]}>
        {label} ({count})
      </Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.darkBg }}>
      {/* Header */}
      <View style={{ padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={palette.lightText} />
        </Pressable>
        <Text style={[textStyles.h3, { color: palette.lightText, flex: 1 }]}>My Listings</Text>
        <Pressable onPress={() => router.push('/screens/listings/create-listing')}>
          <Ionicons name="add-circle" size={28} color={palette.gold} />
        </Pressable>
      </View>

      {/* Tabs */}
      <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: palette.border }}>
        <TabButton tab="active" label="Active" count={listings.active.length} />
        <TabButton tab="pending" label="Pending" count={listings.pending.length} />
        <TabButton tab="sold" label="Sold" count={listings.sold.length} />
      </View>

      <ScrollView>
        <View style={{ padding: spacing.lg }}>
          {/* Active Listings */}
          {activeTab === 'active' &&
            listings.active.map((listing) => (
              <Pressable
                key={listing.id}
                style={{
                  backgroundColor: palette.cardBg,
                  borderRadius: radii.lg,
                  overflow: 'hidden',
                  marginBottom: spacing.md,
                }}
              >
                <View style={{ height: 140, backgroundColor: palette.darkBg, position: 'relative' }}>
                  {listing.boosted && (
                    <View
                      style={{
                        position: 'absolute',
                        top: spacing.sm,
                        left: spacing.sm,
                        backgroundColor: palette.gold,
                        paddingHorizontal: spacing.sm,
                        paddingVertical: spacing.xs,
                        borderRadius: radii.sm,
                      }}
                    >
                      <Text style={[textStyles.caption, { color: palette.darkBg }]}>BOOSTED</Text>
                    </View>
                  )}
                </View>
                <View style={{ padding: spacing.lg }}>
                  <Text style={[textStyles.h4, { color: palette.lightText, marginBottom: spacing.xs }]}>
                    {listing.title}
                  </Text>
                  <Text style={[textStyles.h3, { color: palette.gold, marginBottom: spacing.md }]}>{listing.price}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="eye-outline" size={16} color={palette.textSecondary} />
                      <Text style={[textStyles.caption, { color: palette.textSecondary, marginLeft: spacing.xs }]}>
                        {listing.views} views
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                      <Pressable
                        style={{
                          backgroundColor: palette.darkBg,
                          padding: spacing.sm,
                          borderRadius: radii.md,
                        }}
                      >
                        <Ionicons name="create-outline" size={18} color={palette.lightText} />
                      </Pressable>
                      <Pressable
                        style={{
                          backgroundColor: palette.darkBg,
                          padding: spacing.sm,
                          borderRadius: radii.md,
                        }}
                      >
                        <Ionicons name="trash-outline" size={18} color={palette.error} />
                      </Pressable>
                    </View>
                  </View>
                </View>
              </Pressable>
            ))}

          {/* Pending Listings */}
          {activeTab === 'pending' &&
            listings.pending.map((listing) => (
              <View
                key={listing.id}
                style={{
                  backgroundColor: palette.cardBg,
                  borderRadius: radii.lg,
                  padding: spacing.lg,
                  marginBottom: spacing.md,
                  borderLeftWidth: 4,
                  borderLeftColor: palette.gold,
                }}
              >
                <Text style={[textStyles.h4, { color: palette.lightText, marginBottom: spacing.xs }]}>
                  {listing.title}
                </Text>
                <Text style={[textStyles.body, { color: palette.gold, marginBottom: spacing.md }]}>{listing.price}</Text>
                <View
                  style={{
                    backgroundColor: palette.darkBg,
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.sm,
                    borderRadius: radii.sm,
                    alignSelf: 'flex-start',
                  }}
                >
                  <Text style={[textStyles.caption, { color: palette.gold }]}>{listing.status}</Text>
                </View>
              </View>
            ))}

          {/* Sold Listings */}
          {activeTab === 'sold' &&
            listings.sold.map((listing) => (
              <View
                key={listing.id}
                style={{
                  backgroundColor: palette.cardBg,
                  borderRadius: radii.lg,
                  padding: spacing.lg,
                  marginBottom: spacing.md,
                  opacity: 0.7,
                }}
              >
                <Text style={[textStyles.h4, { color: palette.lightText, marginBottom: spacing.xs }]}>
                  {listing.title}
                </Text>
                <Text style={[textStyles.body, { color: palette.textSecondary, marginBottom: spacing.sm }]}>
                  {listing.price}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="checkmark-circle" size={16} color={palette.success} />
                  <Text style={[textStyles.caption, { color: palette.textSecondary, marginLeft: spacing.xs }]}>
                    Sold {listing.soldDate}
                  </Text>
                </View>
              </View>
            ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
