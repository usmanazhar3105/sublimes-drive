import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '../../../theme/palette';
import { textStyles } from '../../../theme/typography';
import { spacing, radii } from '../../../theme/tokens';

export default function InstantMeetupScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.darkBg }}>
      <ScrollView>
        <View style={{ padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="arrow-back" size={24} color={palette.lightText} />
          </Pressable>
          <Text style={[textStyles.h3, { color: palette.lightText, flex: 1 }]}>Instant Meetup</Text>
        </View>

        <View style={{ padding: spacing.lg }}>
          <Text style={[textStyles.h4, { color: palette.lightText, marginBottom: spacing.md }]}>Create Meetup</Text>
          <Text style={[textStyles.body, { color: palette.textSecondary, marginBottom: spacing.xl }]}>
            Start an instant meetup with nearby car enthusiasts
          </Text>

          <Pressable
            style={{ backgroundColor: palette.gold, paddingVertical: spacing.lg, borderRadius: radii.lg, alignItems: 'center' }}
          >
            <Text style={[textStyles.button, { color: palette.darkBg }]}>Start Meetup</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
