import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '../../../theme/palette';
import { textStyles } from '../../../theme/typography';
import { spacing, radii } from '../../../theme/tokens';

export default function FAQScreen() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const faqs = [
    {
      id: '1',
      question: 'How do I list my car for sale?',
      answer: 'Go to Marketplace > Create Listing, fill in your car details, upload photos, and submit for review.',
    },
    {
      id: '2',
      question: 'How long does listing approval take?',
      answer: 'Most listings are approved within 24 hours. Premium members get faster approval.',
    },
    {
      id: '3',
      question: 'What payment methods do you accept?',
      answer: 'We accept credit/debit cards, Apple Pay, and bank transfers for premium services.',
    },
    {
      id: '4',
      question: 'How do I boost my listing?',
      answer: 'Open your listing and tap the Boost button. Choose a boost package and complete payment.',
    },
    {
      id: '5',
      question: 'How do repair bids work?',
      answer: 'Post your repair request, verified garages send bids, compare prices and reviews, then book your preferred garage.',
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.darkBg }}>
      <ScrollView>
        <View style={{ padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="arrow-back" size={24} color={palette.lightText} />
          </Pressable>
          <Text style={[textStyles.h3, { color: palette.lightText, flex: 1 }]}>FAQ</Text>
        </View>

        <View style={{ padding: spacing.lg }}>
          {faqs.map((faq) => (
            <Pressable
              key={faq.id}
              onPress={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
              style={{
                backgroundColor: palette.cardBg,
                borderRadius: radii.lg,
                padding: spacing.lg,
                marginBottom: spacing.md,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={[textStyles.body, { color: palette.lightText, flex: 1, marginRight: spacing.md }]}>
                  {faq.question}
                </Text>
                <Ionicons
                  name={expandedId === faq.id ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={palette.textSecondary}
                />
              </View>
              {expandedId === faq.id && (
                <Text style={[textStyles.bodySmall, { color: palette.textSecondary, marginTop: spacing.md, lineHeight: 20 }]}>
                  {faq.answer}
                </Text>
              )}
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
