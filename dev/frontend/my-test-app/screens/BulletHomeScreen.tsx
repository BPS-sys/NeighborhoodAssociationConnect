import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { RootStackParamList } from '../app/board';
import { useAuth } from '../contexts/AuthContext';
import Constants from 'expo-constants';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

type Post = {
  id: string;
  category: string;
  title: string;
  date: string;
  content: string;
  regionName: string;
};

const { width } = Dimensions.get('window');

const categoryIcons = {
  "防犯": "shield-checkmark",
  "イベント": "calendar",
  "防災": "warning"
} as const;

const categoryColors = {
  "防犯": ['#ef4444', '#dc2626'],
  "イベント": ['#667eea', '#764ba2'],
  "防災": ['#f59e0b', '#d97706']
} as const;

export default function BulletHomeScreen({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState("防犯");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { RegionID } = useAuth();
  const [isNeighbor, setIsNeighbor] = useState(false);
  const nearRegionNames: { [key: string]: string } = {};

  const fetchPosts = async () => {
    try {
      setLoading(true);

      let targetRegionIDs: string[] = [];

      if (isNeighbor) {
        // 隣接地域ID一覧を取得
        const nearRes = await fetch(`http://localhost:8080/api/v1/near_regions/view?region_id=${RegionID}`, {
          headers: {
            'Authorization': `Bearer ${Constants.expoConfig?.extra?.backendAPIKey}`
          }
        });
        const nearData = await nearRes.json();
        targetRegionIDs = nearData.map((item: any) => item.data.ID);
        nearData.forEach((item: any) => {
          nearRegionNames[item.data.ID] = item.data.Name;
        });
      } else {
        targetRegionIDs = [RegionID];
      }

      // 全地域分のニュースを並列取得
      const allNewsPromises = targetRegionIDs.map(async (id) => {
        const res = await fetch(`http://localhost:8080/api/v1/regions/${id}/news`, {
          headers: {
            'Authorization': `Bearer ${Constants.expoConfig?.extra?.backendAPIKey}`
          }
        });
        const data = await res.json();
        const regionName = id === RegionID ? '自地域' : (nearRegionNames[id] || '不明地域');
        const formatted: Post[] = data.map((item: any) => ({
          id: item.id,
          category: item.columns,
          title: item.title,
          date: item.time,
          content: item.text,
          regionName: regionName,
        }));
        return formatted;
      });

      const allNewsArrays = await Promise.all(allNewsPromises);
      const mergedNews = allNewsArrays.flat();

      // 日時の降順にソート
      mergedNews.sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });

      setPosts(mergedNews);
    } catch (error) {
      console.error('データ取得エラー:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  useEffect(() => {
    fetchPosts();
  }, [refreshKey]);

  const onRefresh = async () => {
    setRefreshing(true);
    setRefreshKey(prev => prev + 1);
    await fetchPosts();
    setRefreshing(false);
  };

  const filteredPosts = posts.filter(p => p.category === activeTab);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    
    // UTC → JST変換
    const jstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);

    const today = new Date();
    const diffTime = today.getTime() - jstDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    const hh = jstDate.getUTCHours().toString().padStart(2,'0');
    const mm = jstDate.getUTCMinutes().toString().padStart(2,'0');

    if (diffDays === 0) {
      return `今日 ${hh}:${mm}`;
    }
    if (diffDays === 1) return '昨日';
    if (diffDays <= 7) return `${diffDays}日前`;

    return `${jstDate.getUTCFullYear()}/${(jstDate.getUTCMonth()+1).toString().padStart(2,'0')}/${jstDate.getUTCDate().toString().padStart(2,'0')} ${hh}:${mm}`;
  };



  const getCategoryIcon = (category: string) => {
    return categoryIcons[category as keyof typeof categoryIcons] || 'information-circle';
  };

  const getCategoryColors = (category: string) => {
    return categoryColors[category as keyof typeof categoryColors] || ['#667eea', '#764ba2'];
  };

  const renderPostCard = ({ item, index }: { item: Post; index: number }) => (
    <TouchableOpacity
      style={styles.postCard}
      activeOpacity={0.7}
      onPress={() =>
        navigation.navigate('Detail', {
          title: item.title,
          date: item.date,
          content: item.content,
        })
      }
    >
      <LinearGradient
        colors={['#ffffff', '#f8fafc']}
        style={styles.postCardGradient}
      >
        <View style={styles.postCardContent}>
          <View style={styles.postHeader}>
            <LinearGradient
              colors={getCategoryColors(item.category)}
              style={styles.categoryBadge}
            >
              <Ionicons 
                name={getCategoryIcon(item.category) as any} 
                size={16} 
                color="#ffffff" 
              />
            </LinearGradient>
            <View style={styles.postMetaContainer}>
              <Text style={styles.categoryText}>{item.category}</Text>
              <Text style={styles.postDate}>{formatDateTime(item.date)}</Text>
            </View>
            <Text style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
            地域：{item.regionName}
          </Text>
          </View>

          
          
          <Text style={styles.postTitle} numberOfLines={2}>
            {item.title}
          </Text>
          
          <View style={styles.postFooter}>
            <Text style={styles.readMore}>詳細を見る</Text>
            <Ionicons name="chevron-forward" size={16} color="#64748b" />
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons 
          name={getCategoryIcon(activeTab) as any} 
          size={64} 
          color="#94a3b8" 
        />
      </View>
      <Text style={styles.emptyTitle}>
        {activeTab}の情報はありません
      </Text>
      <Text style={styles.emptySubtitle}>
        新しい情報が投稿されるとここに表示されます
      </Text>
    </View>
  );

  if (loading) {
    return (
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.loadingContainer}
      >
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>情報を取得中...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      
      {/* ヘッダーグラデーション */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.headerGradient}
      >
        <Text style={styles.headerTitle}>掲示板</Text>
        <Text style={styles.headerSubtitle}>地域の最新情報をチェック</Text>
      </LinearGradient>

      {/* カテゴリ切り替えタブ */}
      <View style={styles.tabContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollContainer}
        >
          {["防犯", "イベント", "防災"].map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[
                styles.tab,
                activeTab === tab && styles.activeTab,
              ]}
              activeOpacity={0.7}
            >
              {activeTab === tab ? (
                <LinearGradient
                  colors={getCategoryColors(tab)}
                  style={styles.activeTabGradient}
                >
                  <Ionicons 
                    name={getCategoryIcon(tab) as any} 
                    size={18} 
                    color="#ffffff" 
                    style={styles.tabIcon}
                  />
                  <Text style={styles.activeTabText}>{tab}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.inactiveTabContent}>
                  <Ionicons 
                    name={getCategoryIcon(tab) as any} 
                    size={18} 
                    color="#64748b" 
                    style={styles.tabIcon}
                  />
                  <Text style={styles.tabText}>{tab}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <TouchableOpacity
        style={styles.neighborButton}
        onPress={() => {
          setIsNeighbor(prev => !prev);
          setLoading(true);
          setRefreshKey(prev => prev + 1); // useEffect の fetchPosts をトリガー
        }}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={isNeighbor ? ['#06b6d4', '#3b82f6'] : ['#667eea', '#764ba2']}
          style={styles.neighborButtonGradient}
        >
          <Ionicons name="earth" size={18} color="#ffffff" style={{ marginRight: 6 }} />
          <Text style={styles.neighborButtonText}>
            {isNeighbor ? '自地域ニュースへ戻す' : '隣接地域ニュース'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>


      {/* コンテンツエリア */}
      <View style={styles.contentContainer}>
        {filteredPosts.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={filteredPosts}
            keyExtractor={(item) => item.id}
            renderItem={renderPostCard}
            contentContainerStyle={styles.postList}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#667eea']}
                tintColor="#667eea"
              />
            }
          />
        )}
        
      </View>
      

      {/* フローティング更新ボタン */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={onRefresh}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.floatingButtonGradient}
        >
          <Ionicons name="refresh" size={24} color="#ffffff" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8fafc',
  },
  
  // ローディング
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 12,
    fontWeight: '500',
  },

  // ヘッダー
  headerGradient: {
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    textAlign: 'center',
  },

  // タブ
  tabContainer: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabScrollContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  tab: {
    borderRadius: 25,
    overflow: 'hidden',
    minWidth: 100,
  },
  activeTab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  activeTabGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  inactiveTabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#f1f5f9',
  },
  tabIcon: {
    marginRight: 6,
  },
  activeTabText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  tabText: {
    color: '#64748b',
    fontWeight: '500',
    fontSize: 14,
  },

  // コンテンツ
  contentContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  postList: {
    padding: 20,
    paddingBottom: 100,
  },

  // 投稿カード
  postCard: {
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  postCardGradient: {
    borderRadius: 20,
  },
  postCardContent: {
    padding: 20,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryBadge: {
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  postMetaContainer: {
    flex: 1,
  },
  categoryText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  postDate: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    lineHeight: 26,
    marginBottom: 16,
  },
  postFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  readMore: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },

  // 空状態
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyIconContainer: {
    backgroundColor: '#f1f5f9',
    borderRadius: 40,
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
  },

  // フローティングボタン
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  floatingButtonGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  neighborButton: {
  marginTop: 12,
  marginHorizontal: 20,
  borderRadius: 25,
  overflow: 'hidden',
  },
  neighborButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  neighborButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
});