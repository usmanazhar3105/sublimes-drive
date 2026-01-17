import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '../../../theme/palette';
import { textStyles } from '../../../theme/typography';
import { spacing, radii } from '../../../theme/tokens';

export default function MyPackagesScreen() {
  const activePackages = [
    {
      id: '1',
      name: 'Premium Listing Package',
      features: ['5 Featured Listings', 'Priority Support', 'Analytics Dashboard'],
      expiresIn: '23 days',
      type: 'active',
    },
  ];

  const availablePackages = [
    {
      id: '2',
      name: 'Starter Package',
      price: 'AED 299/month',
      features: ['3 Listings', 'Basic Support', '1 Boost Credit'],
    },
    {
      id: '3',
      name: 'Professional Package',
      price: 'AED 599/month',
      features: ['10 Listings', 'Priority Support', '5 Boost Credits', 'Analytics'],
    },
    {
      id: '4',
      name: 'Business Package',
      price: 'AED 999/month',
      features: ['Unlimited Listings', '24/7 Support', '20 Boost Credits', 'Advanced Analytics', 'Dedicated Manager'],
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.darkBg }}>
      {/* Header */}
      <View style={{ padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={palette.lightText} />
        </Pressable>
        <Text style={[textStyles.h3, { color: palette.lightText, flex: 1 }]}>My Packages</Text>
      </View>

      <ScrollView>
        <View style={{ padding: spacing.lg }}>
          {/* Active Package */}
          {activePackages.length > 0 && (
            <View style={{ marginBottom: spacing.xl }}>
              <Text style={[textStyles.h4, { color: palette.lightText, marginBottom: spacing.md }]}>Active Package</Text>
              {activePackages.map((pkg) => (
                <View
                  key={pkg.id}
                  style={{
                    backgroundColor: palette.cardBg,
                    borderRadius: radii.lg,
                    padding: spacing.lg,
                    borderWidth: 2,
                    borderColor: palette.gold,
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
                    <Text style={[textStyles.h3, { color: palette.gold }]}>{pkg.name}</Text>
                    <View
                      style={{
                        backgroundColor: palette.gold + '20',
                        paddingHorizontal: spacing.sm,
                        paddingVertical: spacing.xs,
                        borderRadius: radii.sm,
                      }}
                    >
                      <Text style={[textStyles.caption, { color: palette.gold }]}>ACTIVE</Text>
                    </View>
                  </View>
                  {pkg.features.map((feature, index) => (
                    <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
                      <Ionicons name="checkmark-circle" size={16} color={palette.gold} />
                      <Text style={[textStyles.bodySmall, { color: palette.lightText, marginLeft: spacing.sm }]}>
                        {feature}
                      </Text>
                    </View>
                  ))}
                  <View
                    style={{
                      marginTop: spacing.md,
                      paddingTop: spacing.md,
                      borderTopWidth: 1,
                      borderTopColor: palette.border,
                    }}
                  >
                    <Text style={[textStyles.caption, { color: palette.textSecondary }]}>
                      Expires in {pkg.expiresIn}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Available Packages */}
          <Text style={[textStyles.h4, { color: palette.lightText, marginBottom: spacing.md }]}>
            {activePackages.length > 0 ? 'Upgrade Package' : 'Available Packages'}
          </Text>
          {availablePackages.map((pkg) => (
            <Pressable
              key={pkg.id}
              style={{
                backgroundColor: palette.cardBg,
                borderRadius: radii.lg,
                padding: spacing.lg,
                marginBottom: spacing.md,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
                <Text style={[textStyles.h4, { color: palette.lightText }]}>{pkg.name}</Text>
                <Text style={[textStyles.h4, { color: palette.gold }]}>{pkg.price}</Text>
              </View>
              {pkg.features.map((feature, index) => (
                <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
                  <Ionicons name="checkmark" size={16} color={palette.textSecondary} />
                  <Text style={[textStyles.bodySmall, { color: palette.textSecondary, marginLeft: spacing.sm }]}>
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
                <Text style={[textStyles.button, { color: palette.darkBg }]}>Subscribe</Text>
              </Pressable>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
