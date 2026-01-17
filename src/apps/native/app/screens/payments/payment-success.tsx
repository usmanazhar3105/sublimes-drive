import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '../../../theme/palette';
import { textStyles } from '../../../theme/typography';
import { spacing, radii } from '../../../theme/tokens';

export default function PaymentSuccessScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.darkBg }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl }}>
        <View
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: palette.success + '20',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: spacing['2xl'],
          }}
        >
          <Ionicons name="checkmark-circle" size={64} color={palette.success} />
        </View>

        <Text style={[textStyles.h1, { color: palette.lightText, marginBottom: spacing.md, textAlign: 'center' }]}>
          Payment Successful!
        </Text>
        <Text style={[textStyles.body, { color: palette.textSecondary, textAlign: 'center', marginBottom: spacing['3xl'] }]}>
          Your listing has been published and is now live on the marketplace.
        </Text>

        <View style={{ backgroundColor: palette.cardBg, borderRadius: radii.lg, padding: spacing.lg, marginBottom: spacing['2xl'], width: '100%' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm }}>
            <Text style={[textStyles.body, { color: palette.textSecondary }]}>Order ID</Text>
            <Text style={[textStyles.body, { color: palette.lightText }]}>#SUB12345</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm }}>
            <Text style={[textStyles.body, { color: palette.textSecondary }]}>Amount Paid</Text>
            <Text style={[textStyles.body, { color: palette.lightText }]}>AED 199</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={[textStyles.body, { color: palette.textSecondary }]}>Status</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: palette.success, marginRight: spacing.xs }} />
              <Text style={[textStyles.body, { color: palette.success }]}>Completed</Text>
            </View>
          </View>
        </View>

        <Pressable
          onPress={() => router.push('/(tabs)')}
          style={{
            backgroundColor: palette.gold,
            paddingVertical: spacing.lg,
            paddingHorizontal: spacing['3xl'],
            borderRadius: radii.lg,
            marginBottom: spacing.md,
            width: '100%',
            alignItems: 'center',
          }}
        >
          <Text style={[textStyles.button, { color: palette.darkBg }]}>Go to Home</Text>
        </Pressable>

        <Pressable onPress={() => router.push('/screens/profile/my-listings')}>
          <Text style={[textStyles.body, { color: palette.gold }]}>View My Listings</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
