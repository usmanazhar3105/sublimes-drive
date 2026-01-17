import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '../../../theme/palette';
import { textStyles } from '../../../theme/typography';
import { spacing, radii } from '../../../theme/tokens';

export default function EventDetailScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.darkBg }}>
      <ScrollView>
        <View style={{ padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="arrow-back" size={24} color={palette.lightText} />
          </Pressable>
          <Text style={[textStyles.h3, { color: palette.lightText, flex: 1 }]}>Event Details</Text>
        </View>

        <View style={{ padding: spacing.lg }}>
          <View style={{ height: 200, backgroundColor: palette.cardBg, borderRadius: radii.lg, marginBottom: spacing.lg }} />
          <Text style={[textStyles.h2, { color: palette.lightText, marginBottom: spacing.md }]}>Desert Cruise 2025</Text>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, gap: spacing.sm }}>
            <Ionicons name="calendar" size={16} color={palette.gold} />
            <Text style={[textStyles.body, { color: palette.textSecondary }]}>Saturday, Feb 15, 2025</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, gap: spacing.sm }}>
            <Ionicons name="time" size={16} color={palette.gold} />
            <Text style={[textStyles.body, { color: palette.textSecondary }]}>5:00 PM - 10:00 PM</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xl, gap: spacing.sm }}>
            <Ionicons name="location" size={16} color={palette.gold} />
            <Text style={[textStyles.body, { color: palette.textSecondary }]}>Al Qudra Desert, Dubai</Text>
          </View>

          <Text style={[textStyles.body, { color: palette.textSecondary, marginBottom: spacing.xl, lineHeight: 24 }]}>
            Join us for an epic desert cruise. Bring your ride and meet fellow car enthusiasts.
          </Text>

          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <Pressable style={{ flex: 1, backgroundColor: palette.cardBg, paddingVertical: spacing.md, borderRadius: radii.md, alignItems: 'center' }}>
              <Text style={[textStyles.button, { color: palette.lightText }]}>Share</Text>
            </Pressable>
            <Pressable style={{ flex: 1, backgroundColor: palette.gold, paddingVertical: spacing.md, borderRadius: radii.md, alignItems: 'center' }}>
              <Text style={[textStyles.button, { color: palette.darkBg }]}>Join Event</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
