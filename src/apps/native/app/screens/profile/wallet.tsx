import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '../../../theme/palette';
import { textStyles } from '../../../theme/typography';
import { spacing, radii } from '../../../theme/tokens';

export default function WalletScreen() {
  const [balance] = useState(450);

  const transactions = [
    { id: '1', type: 'top-up', amount: 500, date: '2 days ago', status: 'completed' },
    { id: '2', type: 'bid', amount: -50, date: '3 days ago', status: 'completed', item: 'Repair Bid Credit' },
    { id: '3', type: 'refund', amount: 25, date: '1 week ago', status: 'completed' },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'top-up':
        return 'add-circle';
      case 'bid':
        return 'flash';
      case 'refund':
        return 'return-up-back';
      default:
        return 'swap-horizontal';
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.darkBg }}>
      <ScrollView>
        {/* Header */}
        <View style={{ padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="arrow-back" size={24} color={palette.lightText} />
          </Pressable>
          <Text style={[textStyles.h3, { color: palette.lightText, flex: 1 }]}>Wallet</Text>
        </View>

        <View style={{ padding: spacing.lg }}>
          {/* Balance Card */}
          <View
            style={{
              backgroundColor: `linear-gradient(135deg, ${palette.blueGradientStart}, ${palette.blueGradientEnd})`,
              borderRadius: radii.xl,
              padding: spacing.xl,
              marginBottom: spacing.xl,
            }}
          >
            <Text style={[textStyles.bodySmall, { color: palette.lightText, opacity: 0.8, marginBottom: spacing.sm }]}>
              Available Balance
            </Text>
            <Text style={[textStyles.h1, { color: palette.lightText, fontSize: 36, marginBottom: spacing.lg }]}>
              AED {balance}
            </Text>
            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              <Pressable
                style={{
                  flex: 1,
                  backgroundColor: palette.gold,
                  paddingVertical: spacing.md,
                  borderRadius: radii.md,
                  alignItems: 'center',
                }}
              >
                <Text style={[textStyles.button, { color: palette.darkBg }]}>Top Up</Text>
              </Pressable>
              <Pressable
                style={{
                  flex: 1,
                  backgroundColor: palette.lightText + '20',
                  paddingVertical: spacing.md,
                  borderRadius: radii.md,
                  alignItems: 'center',
                }}
              >
                <Text style={[textStyles.button, { color: palette.lightText }]}>Withdraw</Text>
              </Pressable>
            </View>
          </View>

          {/* Transactions */}
          <Text style={[textStyles.h4, { color: palette.lightText, marginBottom: spacing.md }]}>Recent Transactions</Text>
          {transactions.map((txn) => (
            <View
              key={txn.id}
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
                  backgroundColor: txn.amount > 0 ? palette.success + '20' : palette.error + '20',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: spacing.md,
                }}
              >
                <Ionicons
                  name={getIcon(txn.type) as any}
                  size={20}
                  color={txn.amount > 0 ? palette.success : palette.error}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[textStyles.body, { color: palette.lightText, textTransform: 'capitalize' }]}>
                  {txn.type.replace('-', ' ')}
                </Text>
                <Text style={[textStyles.caption, { color: palette.textSecondary }]}>{txn.date}</Text>
              </View>
              <Text style={[textStyles.h4, { color: txn.amount > 0 ? palette.success : palette.error }]}>
                {txn.amount > 0 ? '+' : ''}AED {Math.abs(txn.amount)}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
