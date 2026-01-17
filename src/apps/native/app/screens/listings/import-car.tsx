import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '../../../theme/palette';
import { textStyles } from '../../../theme/typography';
import { spacing, radii } from '../../../theme/tokens';

export default function ImportCarScreen() {
  const [carModel, setCarModel] = useState('');
  const [year, setYear] = useState('');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.darkBg }}>
      <ScrollView>
        <View style={{ padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="arrow-back" size={24} color={palette.lightText} />
          </Pressable>
          <Text style={[textStyles.h3, { color: palette.lightText, flex: 1 }]}>Import Your Car</Text>
        </View>

        <View style={{ padding: spacing.lg }}>
          <Text style={[textStyles.body, { color: palette.textSecondary, marginBottom: spacing.xl }]}>
            Get expert assistance importing your dream car to the UAE
          </Text>

          <Text style={[textStyles.h4, { color: palette.lightText, marginBottom: spacing.sm }]}>Car Model</Text>
          <TextInput
            value={carModel}
            onChangeText={setCarModel}
            placeholder="e.g., Porsche 911 GT3"
            placeholderTextColor={palette.textSecondary}
            style={{
              backgroundColor: palette.cardBg,
              borderWidth: 1,
              borderColor: palette.border,
              borderRadius: radii.lg,
              padding: spacing.lg,
              ...textStyles.body,
              color: palette.lightText,
              marginBottom: spacing.lg,
            }}
          />

          <Text style={[textStyles.h4, { color: palette.lightText, marginBottom: spacing.sm }]}>Year</Text>
          <TextInput
            value={year}
            onChangeText={setYear}
            placeholder="2024"
            placeholderTextColor={palette.textSecondary}
            keyboardType="number-pad"
            style={{
              backgroundColor: palette.cardBg,
              borderWidth: 1,
              borderColor: palette.border,
              borderRadius: radii.lg,
              padding: spacing.lg,
              ...textStyles.body,
              color: palette.lightText,
              marginBottom: spacing.xl,
            }}
          />

          <Pressable
            style={{ backgroundColor: palette.gold, paddingVertical: spacing.lg, borderRadius: radii.lg, alignItems: 'center' }}
          >
            <Text style={[textStyles.button, { color: palette.darkBg }]}>Get Import Quote</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
