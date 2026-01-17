import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '../../../theme/palette';
import { textStyles } from '../../../theme/typography';
import { spacing, radii } from '../../../theme/tokens';

export default function PlaceAdScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.darkBg }}>
      <ScrollView>
        <View style={{ padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="arrow-back" size={24} color={palette.lightText} />
          </Pressable>
          <Text style={[textStyles.h3, { color: palette.lightText, flex: 1 }]}>Place Your Ad</Text>
        </View>

        <View style={{ padding: spacing.lg }}>
          <Text style={[textStyles.h4, { color: palette.lightText, marginBottom: spacing.sm }]}>Title</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Ad title"
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

          <Text style={[textStyles.h4, { color: palette.lightText, marginBottom: spacing.sm }]}>Description</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Ad description"
            placeholderTextColor={palette.textSecondary}
            multiline
            numberOfLines={4}
            style={{
              backgroundColor: palette.cardBg,
              borderWidth: 1,
              borderColor: palette.border,
              borderRadius: radii.lg,
              padding: spacing.lg,
              ...textStyles.body,
              color: palette.lightText,
              minHeight: 100,
              textAlignVertical: 'top',
              marginBottom: spacing.xl,
            }}
          />

          <Pressable
            onPress={() => router.push('/screens/payments/listing-payment')}
            style={{ backgroundColor: palette.gold, paddingVertical: spacing.lg, borderRadius: radii.lg, alignItems: 'center' }}
          >
            <Text style={[textStyles.button, { color: palette.darkBg }]}>Continue</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
