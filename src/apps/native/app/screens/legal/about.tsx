import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '../../../theme/palette';
import { textStyles } from '../../../theme/typography';
import { spacing, radii } from '../../../theme/tokens';

export default function AboutScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.darkBg }}>
      <ScrollView>
        <View style={{ padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="arrow-back" size={24} color={palette.lightText} />
          </Pressable>
          <Text style={[textStyles.h3, { color: palette.lightText, flex: 1 }]}>About Us</Text>
        </View>

        <View style={{ padding: spacing.xl }}>
          <View style={{ alignItems: 'center', marginBottom: spacing['3xl'] }}>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: palette.gold,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: spacing.md,
              }}
            >
              <Ionicons name="car-sport" size={40} color={palette.darkBg} />
            </View>
            <Text style={[textStyles.h2, { color: palette.gold }]}>Sublimes Drive</Text>
            <Text style={[textStyles.caption, { color: palette.textSecondary }]}>Version 1.0.0</Text>
          </View>

          <Text style={[textStyles.h4, { color: palette.lightText, marginBottom: spacing.md }]}>Our Mission</Text>
          <Text style={[textStyles.body, { color: palette.textSecondary, marginBottom: spacing.xl, lineHeight: 24 }]}>
            To build the UAE's most vibrant automotive community, connecting car enthusiasts, buyers, sellers, and service professionals in one platform.
          </Text>

          <Text style={[textStyles.h4, { color: palette.lightText, marginBottom: spacing.md }]}>Our Story</Text>
          <Text style={[textStyles.body, { color: palette.textSecondary, marginBottom: spacing.xl, lineHeight: 24 }]}>
            Founded by passionate car enthusiasts, Sublimes Drive was created to bridge the gap between car lovers and trusted automotive services across the UAE.
          </Text>

          <Text style={[textStyles.h4, { color: palette.lightText, marginBottom: spacing.md }]}>Contact Us</Text>
          <View style={{ backgroundColor: palette.cardBg, borderRadius: radii.lg, padding: spacing.lg }}>
            <Text style={[textStyles.body, { color: palette.lightText, marginBottom: spacing.sm }]}>Email: support@sublimesdrive.com</Text>
            <Text style={[textStyles.body, { color: palette.lightText, marginBottom: spacing.sm }]}>Phone: +971 4 XXX XXXX</Text>
            <Text style={[textStyles.body, { color: palette.lightText }]}>Address: Dubai, UAE</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
