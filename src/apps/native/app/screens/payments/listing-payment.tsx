import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '../../../theme/palette';
import { textStyles } from '../../../theme/typography';
import { spacing, radii } from '../../../theme/tokens';

export default function ListingPaymentScreen() {
  const [selectedPackage, setSelectedPackage] = useState('basic');

  const packages = [
    { id: 'basic', name: 'Basic Listing', price: 0, features: ['30-day listing', 'Standard visibility'] },
    { id: 'featured', name: 'Featured Listing', price: 199, features: ['60-day listing', '3x visibility', 'Featured badge'] },
    { id: 'premium', name: 'Premium Listing', price: 399, features: ['90-day listing', '10x visibility', 'Featured badge', 'Homepage spot'] },
  ];

  const handleProceed = () => {
    if (selectedPackage === 'basic') {
      router.push('/screens/payments/payment-success');
    } else {
      router.push('/screens/payments/stripe-payment');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.darkBg }}>
      <ScrollView>
        <View style={{ padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="arrow-back" size={24} color={palette.lightText} />
          </Pressable>
          <Text style={[textStyles.h3, { color: palette.lightText, flex: 1 }]}>Select Package</Text>
        </View>

        <View style={{ padding: spacing.lg }}>
          {packages.map((pkg) => (
            <Pressable
              key={pkg.id}
              onPress={() => setSelectedPackage(pkg.id)}
              style={{
                backgroundColor: palette.cardBg,
                borderWidth: 2,
                borderColor: selectedPackage === pkg.id ? palette.gold : palette.border,
                borderRadius: radii.lg,
                padding: spacing.lg,
                marginBottom: spacing.md,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md }}>
                <Text style={[textStyles.h4, { color: palette.lightText }]}>{pkg.name}</Text>
                <Text style={[textStyles.h3, { color: palette.gold }]}>
                  {pkg.price === 0 ? 'FREE' : `AED ${pkg.price}`}
                </Text>
              </View>
              {pkg.features.map((feature, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
                  <Ionicons name="checkmark" size={16} color={palette.gold} />
                  <Text style={[textStyles.bodySmall, { color: palette.textSecondary, marginLeft: spacing.sm }]}>
                    {feature}
                  </Text>
                </View>
              ))}
            </Pressable>
          ))}

          <Pressable
            onPress={handleProceed}
            style={{
              backgroundColor: palette.gold,
              paddingVertical: spacing.lg,
              borderRadius: radii.lg,
              alignItems: 'center',
              marginTop: spacing.lg,
            }}
          >
            <Text style={[textStyles.button, { color: palette.darkBg }]}>
              {selectedPackage === 'basic' ? 'Publish Listing' : 'Proceed to Payment'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
