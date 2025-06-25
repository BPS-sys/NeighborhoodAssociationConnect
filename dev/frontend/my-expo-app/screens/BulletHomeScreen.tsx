import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { RootStackParamList } from '../app/board';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

type Post = {
  id: string;
  category: string;
  title: string;
  date: string;
  content: string;
};

export default function BulletHomeScreen({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState("防犯");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/v1/regions/ugyGiVvlg4fDN2afMnoe(RegionID)/news');
        const data = await res.json();
        const formatted: Post[] = data.map((item: any) => ({
          id: item.id,
          category: item.columns,
          title: item.title,
          date: item.time.split('T')[0],
          content: item.text,
        }));
        setPosts(formatted);
      } catch (error) {
        console.error('データ取得エラー:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [refreshKey]);

  const filteredPosts = posts.filter(p => p.category === activeTab);

  return (
    <View style={styles.container}>
      {/* カテゴリ切り替えタブ */}
      <View style={styles.tabContainer}>
        {["防犯", "イベント", "防災"].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
          >
            <Text style={styles.tabText}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ローディング表示 */}
      {loading ? (
        <ActivityIndicator size="large" color="#00BCD4" />
      ) : (
        <FlatList
          data={filteredPosts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                navigation.navigate('Detail', {
                  title: item.title,
                  date: item.date,
                  content: item.content,
                })
              }
            >
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.date}>{item.date}</Text>
            </TouchableOpacity>
          )}
        />
      )}
      <TouchableOpacity
  style={{ marginBottom: 10, backgroundColor: '#4CAF50', padding: 10, borderRadius: 8 }}
  onPress={() => setRefreshKey(prev => prev + 1)}
>
  <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>更新</Text>
</TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: {
    backgroundColor: '#e0f7fa',
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
  },
  title: { fontSize: 16, fontWeight: 'bold' },
  date: { fontSize: 12, color: '#666' },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#ccc',
    alignItems: 'center',
    borderRadius: 5,
    marginHorizontal: 5,
  },
  activeTab: {
    backgroundColor: '#00BCD4',
  },
  tabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
