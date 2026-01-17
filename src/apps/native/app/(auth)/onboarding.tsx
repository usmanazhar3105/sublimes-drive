import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '../../theme/palette';
import { textStyles } from '../../theme/typography';
import { spacing, radii } from '../../theme/tokens';

const { width } = Dimensions.get('window');

const slides = [
  {
    icon: 'people',
    title: 'Join the Community',
    description: 'Connect with car enthusiasts across the UAE. Share your passion, join meetups, and make lasting friendships.',
  },
  {
    icon: 'car-sport',
    title: 'Buy & Sell Cars',
    description: 'Browse verified listings, sell your car with ease, and discover your dream ride in our marketplace.',
  },
  {
    icon: 'construct',
    title: 'Find Trusted Garages',
    description: 'Get competitive bids from verified garages. Compare prices, read reviews, and book services.',
  },
  {
    icon: 'gift',
    title: 'Exclusive Offers',
    description: 'Access member-only deals on parts, services, and events. Save money while enjoying your passion.',
  },
];

export default function OnboardingScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleSkip = () => {
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.darkBg }}>
      <View style={{ flex: 1 }}>
        {/* Skip Button */}
        <View style={{ padding: spacing.lg, alignItems: 'flex-end' }}>
          <Pressable onPress={handleSkip} hitSlop={8}>
            <Text style={[textStyles.body, { color: palette.gold }]}>Skip</Text>
          </Pressable>
        </View>

        {/* Slides */}
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEnabled={false}
          style={{ flex: 1 }}
        >
          {slides.map((slide, index) => (
            <View
              key={index}
              style={{
                width,
                paddingHorizontal: spacing['3xl'],
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {/* Icon */}
              <View
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  backgroundColor: palette.cardBg,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: spacing['3xl'],
                }}
              >
                <Ionicons name={slide.icon as any} size={60} color={palette.gold} />
              </View>

              {/* Title */}
              <Text style={[textStyles.h1, { color: palette.lightText, textAlign: 'center', marginBottom: spacing.lg }]}>
                {slide.title}
              </Text>

              {/* Description */}
              <Text style={[textStyles.body, { color: palette.textSecondary, textAlign: 'center', lineHeight: 24 }]}>
                {slide.description}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* Pagination Dots */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', paddingVertical: spacing['2xl'], gap: spacing.sm }}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={{
                width: currentSlide === index ? 24 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: currentSlide === index ? palette.gold : palette.border,
              }}
            />
          ))}
        </View>

        {/* Next/Get Started Button */}
        <View style={{ padding: spacing.xl }}>
          <Pressable
            onPress={handleNext}
            style={{
              backgroundColor: palette.gold,
              paddingVertical: spacing.lg,
              borderRadius: radii.lg,
              alignItems: 'center',
            }}
          >
            <Text style={[textStyles.button, { color: palette.darkBg }]}>
              {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
