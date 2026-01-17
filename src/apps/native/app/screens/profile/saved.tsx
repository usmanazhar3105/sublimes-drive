import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '../../../theme/palette';
import { textStyles } from '../../../theme/typography';
import { spacing, radii } from '../../../theme/tokens';

type Tab = 'posts' | 'listings' | 'garages';

export default function SavedScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('posts');

  const savedPosts = [
    { id: '1', author: 'Ahmed Al Mansouri', content: 'Just got my G63 AMG wrapped in matte black...', likes: 234 },
    { id: '2', author: 'Sara Khan', content: 'Best driving roads in UAE for weekend trips?', likes: 127 },
  ];

  const savedListings = [
    { id: '1', title: '2023 Porsche 911 Turbo S', price: 'AED 850,000', image: null },
    { id: '2', title: '2022 Mercedes G63 AMG', price: 'AED 720,000', image: null },
  ];

  const savedGarages = [
    { id: '1', name: 'Premium Auto Care', rating: 4.8, location: 'Dubai' },
    { id: '2', name: 'Elite Motors Workshop', rating: 4.9, location: 'Abu Dhabi' },
  ];

  const TabButton = ({ tab, label }: { tab: Tab; label: string }) => (
    <Pressable
      onPress={() => setActiveTab(tab)}
      style={{
        flex: 1,
        paddingVertical: spacing.md,
        borderBottomWidth: 2,
        borderBottomColor: activeTab === tab ? palette.gold : 'transparent',
        alignItems: 'center',
      }}
    >
      <Text style={[textStyles.body, { color: activeTab === tab ? palette.gold : palette.textSecondary }]}>{label}</Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.darkBg }}>
      {/* Header */}
      <View style={{ padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={palette.lightText} />
        </Pressable>
        <Text style={[textStyles.h3, { color: palette.lightText, flex: 1 }]}>Saved</Text>
      </View>

      {/* Tabs */}
      <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: palette.border }}>
        <TabButton tab="posts" label="Posts" />
        <TabButton tab="listings" label="Listings" />
        <TabButton tab="garages" label="Garages" />
      </View>

      <ScrollView>
        <View style={{ padding: spacing.lg }}>
          {/* Posts Tab */}
          {activeTab === 'posts' &&
            savedPosts.map((post) => (
              <Pressable
                key={post.id}
                style={{
                  backgroundColor: palette.cardBg,
                  borderRadius: radii.lg,
                  padding: spacing.lg,
                  marginBottom: spacing.md,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: palette.darkBg,
                      marginRight: spacing.md,
                    }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={[textStyles.body, { color: palette.lightText }]}>{post.author}</Text>
                    <Text style={[textStyles.caption, { color: palette.textSecondary }]}>2h ago</Text>
                  </View>
                  <Ionicons name="bookmark" size={20} color={palette.gold} />
                </View>
                <Text style={[textStyles.body, { color: palette.textSecondary }]}>{post.content}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.md }}>
                  <Ionicons name="heart-outline" size={18} color={palette.textSecondary} />
                  <Text style={[textStyles.caption, { color: palette.textSecondary, marginLeft: spacing.xs }]}>
                    {post.likes}
                  </Text>
                </View>
              </Pressable>
            ))}

          {/* Listings Tab */}
          {activeTab === 'listings' &&
            savedListings.map((listing) => (
              <Pressable
                key={listing.id}
                style={{
                  backgroundColor: palette.cardBg,
                  borderRadius: radii.lg,
                  overflow: 'hidden',
                  marginBottom: spacing.md,
                }}
              >
                <View style={{ height: 140, backgroundColor: palette.darkBg }}>
                  <View style={{ position: 'absolute', top: spacing.sm, right: spacing.sm, zIndex: 1 }}>
                    <View
                      style={{
                        backgroundColor: palette.darkBg + 'CC',
                        borderRadius: radii.pill,
                        padding: spacing.sm,
                      }}
                    >
                      <Ionicons name="bookmark" size={18} color={palette.gold} />
                    </View>
                  </View>
                </View>
                <View style={{ padding: spacing.lg }}>
                  <Text style={[textStyles.h4, { color: palette.lightText, marginBottom: spacing.xs }]}>
                    {listing.title}
                  </Text>
                  <Text style={[textStyles.h3, { color: palette.gold }]}>{listing.price}</Text>
                </View>
              </Pressable>
            ))}

          {/* Garages Tab */}
          {activeTab === 'garages' &&
            savedGarages.map((garage) => (
              <Pressable
                key={garage.id}
                style={{
                  backgroundColor: palette.cardBg,
                  borderRadius: radii.lg,
                  padding: spacing.lg,
                  marginBottom: spacing.md,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <View
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: radii.md,
                    backgroundColor: palette.darkBg,
                    marginRight: spacing.md,
                  }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={[textStyles.body, { color: palette.lightText, marginBottom: spacing.xs }]}>
                    {garage.name}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="star" size={14} color={palette.gold} />
                      <Text style={[textStyles.caption, { color: palette.textSecondary, marginLeft: spacing.xs }]}>
                        {garage.rating}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="location" size={14} color={palette.textSecondary} />
                      <Text style={[textStyles.caption, { color: palette.textSecondary, marginLeft: spacing.xs }]}>
                        {garage.location}
                      </Text>
                    </View>
                  </View>
                </View>
                <Ionicons name="bookmark" size={20} color={palette.gold} />
              </Pressable>
            ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
