import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '../../../theme/palette';
import { textStyles } from '../../../theme/typography';
import { spacing, radii } from '../../../theme/tokens';

export default function LeaderboardScreen() {
  const leaders = [
    { id: '1', rank: 1, name: 'Ahmed Al Mansouri', xp: 2850, badge: 'gold' },
    { id: '2', rank: 2, name: 'Sara Khan', xp: 2640, badge: 'silver' },
    { id: '3', rank: 3, name: 'Mohammed Ali', xp: 2420, badge: 'bronze' },
    { id: '4', rank: 4, name: 'Fatima Hassan', xp: 2180, badge: null },
  ];

  const getRankColor = (rank: number) => {
    if (rank === 1) return palette.gold;
    if (rank === 2) return '#C0C0C0';
    if (rank === 3) return '#CD7F32';
    return palette.textSecondary;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.darkBg }}>
      <ScrollView>
        <View style={{ padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="arrow-back" size={24} color={palette.lightText} />
          </Pressable>
          <Text style={[textStyles.h3, { color: palette.lightText, flex: 1 }]}>Leaderboard</Text>
        </View>

        <View style={{ padding: spacing.lg }}>
          {leaders.map((leader) => (
            <View
              key={leader.id}
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
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: getRankColor(leader.rank) + '20',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: spacing.md,
                }}
              >
                <Text style={[textStyles.h4, { color: getRankColor(leader.rank) }]}>#{leader.rank}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[textStyles.body, { color: palette.lightText }]}>{leader.name}</Text>
                <Text style={[textStyles.caption, { color: palette.textSecondary }]}>{leader.xp} XP</Text>
              </View>
              {leader.badge && <Ionicons name="trophy" size={24} color={getRankColor(leader.rank)} />}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
