import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '../../../theme/palette';
import { textStyles } from '../../../theme/typography';
import { spacing, radii } from '../../../theme/tokens';

export default function MyOrdersScreen() {
  const orders = [
    {
      id: '1',
      type: 'Listing Boost',
      item: '2022 BMW M4 Competition',
      amount: 'AED 299',
      date: '2 days ago',
      status: 'Active',
    },
    {
      id: '2',
      type: 'Repair Service',
      item: 'Full Car Service - Elite Motors',
      amount: 'AED 850',
      date: '1 week ago',
      status: 'Completed',
    },
    {
      id: '3',
      type: 'Ad Package',
      item: 'Premium Ad Placement',
      amount: 'AED 499',
      date: '2 weeks ago',
      status: 'Completed',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return palette.gold;
      case 'Completed':
        return palette.success;
      case 'Pending':
        return palette.textSecondary;
      default:
        return palette.textSecondary;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.darkBg }}>
      {/* Header */}
      <View style={{ padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={palette.lightText} />
        </Pressable>
        <Text style={[textStyles.h3, { color: palette.lightText, flex: 1 }]}>My Orders</Text>
      </View>

      <ScrollView>
        <View style={{ padding: spacing.lg }}>
          {orders.map((order) => (
            <Pressable
              key={order.id}
              style={{
                backgroundColor: palette.cardBg,
                borderRadius: radii.lg,
                padding: spacing.lg,
                marginBottom: spacing.md,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md }}>
                <View style={{ flex: 1 }}>
                  <Text style={[textStyles.caption, { color: palette.gold, marginBottom: spacing.xs }]}>
                    {order.type}
                  </Text>
                  <Text style={[textStyles.body, { color: palette.lightText, marginBottom: spacing.xs }]}>
                    {order.item}
                  </Text>
                  <Text style={[textStyles.caption, { color: palette.textSecondary }]}>{order.date}</Text>
                </View>
                <View
                  style={{
                    backgroundColor: getStatusColor(order.status) + '20',
                    paddingHorizontal: spacing.sm,
                    paddingVertical: spacing.xs,
                    borderRadius: radii.sm,
                  }}
                >
                  <Text style={[textStyles.caption, { color: getStatusColor(order.status) }]}>{order.status}</Text>
                </View>
              </View>
              <View
                style={{
                  borderTopWidth: 1,
                  borderTopColor: palette.border,
                  paddingTop: spacing.md,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Text style={[textStyles.h4, { color: palette.gold }]}>{order.amount}</Text>
                <Pressable>
                  <Text style={[textStyles.bodySmall, { color: palette.gold }]}>View Details</Text>
                </Pressable>
              </View>
            </Pressable>
          ))}

          {/* Empty State */}
          {orders.length === 0 && (
            <View style={{ alignItems: 'center', paddingVertical: spacing['4xl'] }}>
              <Ionicons name="receipt-outline" size={64} color={palette.textSecondary} />
              <Text style={[textStyles.h3, { color: palette.lightText, marginTop: spacing.lg, marginBottom: spacing.sm }]}>
                No Orders Yet
              </Text>
              <Text style={[textStyles.body, { color: palette.textSecondary, textAlign: 'center' }]}>
                Your purchase history will appear here
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
