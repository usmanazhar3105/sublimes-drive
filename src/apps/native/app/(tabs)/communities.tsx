import { SafeAreaView, View, Text, ScrollView, Pressable, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { palette } from '../../theme/palette';
import { spacing, radii } from '../../theme/tokens';
import { textStyles } from '../../theme/typography';
import { applyShadow } from '../../utils/shadow';

export default function CommunitiesScreen() {
  const router = useRouter();

  const posts = [
    { id: 1, user: 'Ahmed Al-M', time: '2h ago', content: 'Just installed new exhaust on my GT-R!', likes: 45, comments: 12 },
    { id: 2, user: 'Khalid S', time: '4h ago', content: 'Who's going to the car meet this weekend?', likes: 32, comments: 18 },
    { id: 3, user: 'Sara K', time: '6h ago', content: 'New wrap on the Supra 🔥', likes: 89, comments: 23 },
  ];

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <Text style={[textStyles.h3, { color: palette.lightText }]}>Communities</Text>
        <View style={s.headerIcons}>
          <Pressable style={s.iconBtn} onPress={() => router.push('/screens/search')}>
            <Ionicons name="search-outline" size={20} color={palette.lightText} />
          </Pressable>
          <Pressable style={s.iconBtn}>
            <Ionicons name="filter-outline" size={20} color={palette.lightText} />
          </Pressable>
        </View>
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabs}>
        {['For You', 'Following', 'Trending', 'New'].map((tab, idx) => (
          <Pressable key={idx} style={[s.tab, idx === 0 && s.tabActive]}>
            <Text style={[textStyles.body, { color: idx === 0 ? palette.gold : palette.textSecondary, fontWeight: idx === 0 ? '600' : '400' }]}>
              {tab}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={s.container}>
        {/* Create Post Card */}
        <Pressable style={[s.createCard, applyShadow('sm')]}>
          <View style={s.avatarSmall}>
            <Ionicons name="person" size={18} color={palette.darkBg} />
          </View>
          <Text style={[textStyles.body, { color: palette.textSecondary, flex: 1 }]}>What's on your mind?</Text>
          <Ionicons name="image-outline" size={20} color={palette.gold} />
        </Pressable>

        {/* Posts Feed */}
        {posts.map((post) => (
          <View key={post.id} style={[s.postCard, applyShadow('card')]}>
            <View style={s.postHeader}>
              <View style={s.avatar}>
                <Ionicons name="person" size={22} color={palette.darkBg} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[textStyles.body, { color: palette.lightText, fontWeight: '600' }]}>{post.user}</Text>
                <Text style={[textStyles.caption, { color: palette.textSecondary }]}>{post.time}</Text>
              </View>
              <Pressable>
                <Ionicons name="ellipsis-horizontal" size={20} color={palette.textSecondary} />
              </Pressable>
            </View>

            <Text style={[textStyles.body, { color: palette.lightText, marginTop: spacing.md }]}>{post.content}</Text>

            <View style={s.postStats}>
              <Text style={[textStyles.caption, { color: palette.textSecondary }]}>
                {post.likes} likes • {post.comments} comments
              </Text>
            </View>

            <View style={s.postActions}>
              <Pressable style={s.actionBtn}>
                <Ionicons name="heart-outline" size={20} color={palette.textSecondary} />
                <Text style={[textStyles.bodySmall, { color: palette.textSecondary, marginLeft: 6 }]}>Like</Text>
              </Pressable>
              <Pressable style={s.actionBtn}>
                <Ionicons name="chatbubble-outline" size={20} color={palette.textSecondary} />
                <Text style={[textStyles.bodySmall, { color: palette.textSecondary, marginLeft: 6 }]}>Comment</Text>
              </Pressable>
              <Pressable style={s.actionBtn}>
                <Ionicons name="share-social-outline" size={20} color={palette.textSecondary} />
                <Text style={[textStyles.bodySmall, { color: palette.textSecondary, marginLeft: 6 }]}>Share</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* FAB */}
      <Pressable style={s.fab}>
        <Ionicons name="add" size={28} color={palette.darkBg} />
      </Pressable>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.darkBg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  headerIcons: { flexDirection: 'row', gap: spacing.sm },
  iconBtn: { width: 40, height: 40, borderRadius: radii.lg, backgroundColor: palette.cardBg, alignItems: 'center', justifyContent: 'center' },
  tabs: { paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  tab: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, marginRight: spacing.sm },
  tabActive: { borderBottomWidth: 2, borderBottomColor: palette.gold },
  container: { padding: spacing.lg, paddingBottom: spacing['6xl'] },
  createCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: palette.cardBg, borderRadius: radii.lg, padding: spacing.lg, marginBottom: spacing.lg },
  avatarSmall: { width: 36, height: 36, borderRadius: 18, backgroundColor: palette.gold, alignItems: 'center', justifyContent: 'center' },
  postCard: { backgroundColor: palette.cardBg, borderRadius: radii.lg, padding: spacing.lg, marginBottom: spacing.lg },
  postHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: palette.gold, alignItems: 'center', justifyContent: 'center' },
  postStats: { paddingTop: spacing.md, marginTop: spacing.md, borderTopWidth: 1, borderTopColor: palette.border },
  postActions: { flexDirection: 'row', justifyContent: 'space-around', marginTop: spacing.sm },
  actionBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm },
  fab: { position: 'absolute', bottom: spacing['4xl'], right: spacing.lg, width: 56, height: 56, borderRadius: 28, backgroundColor: palette.gold, alignItems: 'center', justifyContent: 'center', ...applyShadow('lg') },
});
