import { SafeAreaView, View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { palette } from '../../theme/palette';
import { spacing, radii } from '../../theme/tokens';
import { textStyles } from '../../theme/typography';
import { applyShadow } from '../../utils/shadow';

export default function GarageScreen() {
  const router = useRouter();

  const categories = ['All', 'Repair', 'Maintenance', 'Modification', 'Detailing'];
  
  const garages = [
    { id: 1, name: 'Premium Auto Works', rating: 4.8, reviews: 234, specialty: 'Luxury Cars', distance: '2.4 km', verified: true },
    { id: 2, name: 'Speed Garage UAE', rating: 4.6, reviews: 187, specialty: 'Performance Tuning', distance: '3.1 km', verified: true },
    { id: 3, name: 'Classic Car Restoration', rating: 4.9, reviews: 156, specialty: 'Restoration', distance: '5.8 km', verified: false },
  ];

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <Text style={[textStyles.h3, { color: palette.lightText }]}>Garage Hub</Text>
        <View style={s.headerIcons}>
          <Pressable style={s.iconBtn} onPress={() => router.push('/screens/search')}>
            <Ionicons name="search-outline" size={20} color={palette.lightText} />
          </Pressable>
          <Pressable style={s.iconBtn}>
            <Ionicons name="location-outline" size={20} color={palette.lightText} />
          </Pressable>
        </View>
      </View>

      {/* Categories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.categories}>
        {categories.map((cat, idx) => (
          <Pressable key={idx} style={[s.categoryChip, idx === 0 && s.categoryChipActive]}>
            <Text style={[textStyles.bodySmall, { color: idx === 0 ? palette.darkBg : palette.lightText, fontWeight: '600' }]}>
              {cat}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={s.container}>
        {/* Request Repair Button */}
        <Pressable
          style={[s.requestCard, applyShadow('md')]}
          onPress={() => router.push('/screens/garage/request-repair')}
        >
          <View style={s.requestIcon}>
            <Ionicons name="construct" size={24} color={palette.darkBg} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[textStyles.h4, { color: palette.lightText }]}>Request Repair Quote</Text>
            <Text style={[textStyles.bodySmall, { color: palette.textSecondary, marginTop: 2 }]}>
              Get instant quotes from verified garages
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={palette.gold} />
        </Pressable>

        {/* Garages List */}
        <Text style={[textStyles.h4, { color: palette.lightText, marginBottom: spacing.md }]}>
          Nearby Garages
        </Text>
        
        {garages.map((garage) => (
          <Pressable
            key={garage.id}
            style={[s.garageCard, applyShadow('card')]}
            onPress={() => router.push('/screens/garage/garage-detail')}
          >
            <View style={s.garageHeader}>
              <View style={s.garageLogo}>
                <MaterialCommunityIcons name="garage" size={32} color={palette.gold} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={s.nameRow}>
                  <Text style={[textStyles.body, { color: palette.lightText, fontWeight: '600', flex: 1 }]} numberOfLines={1}>
                    {garage.name}
                  </Text>
                  {garage.verified && (
                    <View style={s.verifiedBadge}>
                      <Ionicons name="checkmark-circle" size={16} color={palette.gold} />
                    </View>
                  )}
                </View>
                <Text style={[textStyles.caption, { color: palette.textSecondary }]}>{garage.specialty}</Text>
              </View>
            </View>

            <View style={s.garageDetails}>
              <View style={s.detail}>
                <Ionicons name="star" size={14} color={palette.gold} />
                <Text style={[textStyles.bodySmall, { color: palette.lightText, marginLeft: 4 }]}>
                  {garage.rating} ({garage.reviews} reviews)
                </Text>
              </View>
              <View style={s.detail}>
                <Ionicons name="location-outline" size={14} color={palette.textSecondary} />
                <Text style={[textStyles.bodySmall, { color: palette.textSecondary, marginLeft: 4 }]}>
                  {garage.distance}
                </Text>
              </View>
            </View>

            <View style={s.garageActions}>
              <Pressable style={s.primaryBtn}>
                <Text style={[textStyles.bodySmall, { color: palette.darkBg, fontWeight: '600' }]}>Get Quote</Text>
              </Pressable>
              <Pressable style={s.outlineBtn}>
                <Ionicons name="call-outline" size={18} color={palette.gold} />
              </Pressable>
              <Pressable style={s.outlineBtn}>
                <Ionicons name="chatbubble-outline" size={18} color={palette.gold} />
              </Pressable>
            </View>
          </Pressable>
        ))}

        {/* Services Offered Section */}
        <View style={s.section}>
          <Text style={[textStyles.h4, { color: palette.lightText, marginBottom: spacing.md }]}>
            Popular Services
          </Text>
          <View style={s.servicesGrid}>
            {['Oil Change', 'Brake Service', 'AC Repair', 'Engine Tuning'].map((service, idx) => (
              <Pressable key={idx} style={[s.serviceCard, applyShadow('sm')]}>
                <Ionicons name="build-outline" size={24} color={palette.gold} />
                <Text style={[textStyles.bodySmall, { color: palette.lightText, marginTop: spacing.xs, textAlign: 'center' }]}>
                  {service}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.darkBg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  headerIcons: { flexDirection: 'row', gap: spacing.sm },
  iconBtn: { width: 40, height: 40, borderRadius: radii.lg, backgroundColor: palette.cardBg, alignItems: 'center', justifyContent: 'center' },
  categories: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  categoryChip: { backgroundColor: palette.cardBg, borderRadius: radii.pill, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, marginRight: spacing.sm, borderWidth: 1, borderColor: palette.border },
  categoryChipActive: { backgroundColor: palette.gold, borderColor: palette.gold },
  container: { padding: spacing.lg, paddingBottom: spacing['6xl'] },
  requestCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: palette.cardBg, borderRadius: radii.lg, padding: spacing.lg, marginBottom: spacing.xl, borderWidth: 1, borderColor: palette.gold },
  requestIcon: { width: 48, height: 48, borderRadius: radii.lg, backgroundColor: palette.gold, alignItems: 'center', justifyContent: 'center' },
  garageCard: { backgroundColor: palette.cardBg, borderRadius: radii.lg, padding: spacing.lg, marginBottom: spacing.md },
  garageHeader: { flexDirection: 'row', gap: spacing.md },
  garageLogo: { width: 60, height: 60, borderRadius: radii.md, backgroundColor: palette.secondary, alignItems: 'center', justifyContent: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  verifiedBadge: { width: 16, height: 16 },
  garageDetails: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: palette.border },
  detail: { flexDirection: 'row', alignItems: 'center' },
  garageActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  primaryBtn: { flex: 1, height: 40, borderRadius: radii.md, backgroundColor: palette.gold, alignItems: 'center', justifyContent: 'center' },
  outlineBtn: { width: 40, height: 40, borderRadius: radii.md, borderWidth: 1, borderColor: palette.gold, alignItems: 'center', justifyContent: 'center' },
  section: { marginTop: spacing.xl },
  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  serviceCard: { width: '47%', backgroundColor: palette.cardBg, borderRadius: radii.lg, padding: spacing.lg, alignItems: 'center' },
});
