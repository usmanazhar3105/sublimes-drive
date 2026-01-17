import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '../../../theme/palette';
import { textStyles } from '../../../theme/typography';
import { spacing, radii } from '../../../theme/tokens';

export default function GarageDetailScreen() {
  const services = ['Full Service', 'Oil Change', 'Brake Service', 'AC Repair', 'Paint & Body', 'Engine Diagnostics'];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.darkBg }}>
      <ScrollView>
        <View style={{ padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="arrow-back" size={24} color={palette.lightText} />
          </Pressable>
          <Text style={[textStyles.h3, { color: palette.lightText, flex: 1 }]}>Garage Details</Text>
          <Ionicons name="share-outline" size={24} color={palette.gold} />
        </View>

        <View style={{ padding: spacing.lg }}>
          {/* Header Image */}
          <View style={{ height: 200, backgroundColor: palette.cardBg, borderRadius: radii.lg, marginBottom: spacing.lg }} />

          {/* Info */}
          <Text style={[textStyles.h2, { color: palette.lightText, marginBottom: spacing.sm }]}>Premium Auto Care</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md, gap: spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="star" size={18} color={palette.gold} />
              <Text style={[textStyles.body, { color: palette.lightText, marginLeft: spacing.xs }]}>4.8 (156 reviews)</Text>
            </View>
            <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: palette.textSecondary }} />
            <Text style={[textStyles.body, { color: palette.textSecondary }]}>Dubai</Text>
          </View>

          {/* Services */}
          <Text style={[textStyles.h4, { color: palette.lightText, marginTop: spacing.lg, marginBottom: spacing.md }]}>Services</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.xl }}>
            {services.map((service, i) => (
              <View key={i} style={{ backgroundColor: palette.cardBg, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radii.md }}>
                <Text style={[textStyles.bodySmall, { color: palette.lightText }]}>{service}</Text>
              </View>
            ))}
          </View>

          {/* CTA */}
          <Pressable
            onPress={() => router.push('/screens/garage/request-repair')}
            style={{ backgroundColor: palette.gold, paddingVertical: spacing.lg, borderRadius: radii.lg, alignItems: 'center' }}
          >
            <Text style={[textStyles.button, { color: palette.darkBg }]}>Request Quote</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
