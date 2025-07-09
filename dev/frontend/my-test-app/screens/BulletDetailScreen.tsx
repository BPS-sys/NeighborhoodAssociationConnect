import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, Text, ScrollView, View, Platform, StatusBar, TouchableOpacity } from 'react-native';
import { RootStackParamList } from '../tabs/board';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

type Props = NativeStackScreenProps<RootStackParamList, 'Detail'>;

export default function BulletDetailScreen({ route, navigation }: Props) {
  const { title, date, content } = route.params;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Tokyo',
    };
    return date.toLocaleDateString('ja-JP', options).replace('、', ' ');
  };


  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      
      {/* ヘッダーグラデーション */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <View style={styles.backButtonContainer}>
              <Ionicons name="chevron-back" size={24} color="#ffffff" />
            </View>
          </TouchableOpacity>
          
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>詳細情報</Text>
            <Text style={styles.headerSubtitle}>記事の詳細内容</Text>
          </View>
        </View>
      </LinearGradient>

      {/* コンテンツ */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentCard}>
          <LinearGradient
            colors={['#ffffff', '#f8fafc']}
            style={styles.cardGradient}
          >
            <View style={styles.cardContent}>
              {/* 日付バッジ */}
              <View style={styles.dateContainer}>
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.dateBadge}
                >
                  <Ionicons name="calendar" size={16} color="#ffffff" />
                  <Text style={styles.dateText}>{formatDate(date)}</Text>
                </LinearGradient>
              </View>

              {/* タイトル */}
              <Text style={styles.title}>{title}</Text>

              {/* 区切り線 */}
              <View style={styles.divider} />

              {/* コンテンツ */}
              <View style={styles.contentContainer}>
                <Text style={styles.content}>{content}</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* アクションボタン */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.actionButtonGradient}
            >
              <Ionicons name="arrow-back" size={20} color="#ffffff" />
              <Text style={styles.actionButtonText}>戻る</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },

  // ヘッダー
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backButton: {
    marginRight: 16,
  },
  backButtonContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },

  // スクロールコンテンツ
  scrollContent: {
    paddingBottom: 40,
  },

  // コンテンツカード
  contentCard: {
    margin: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  cardGradient: {
    borderRadius: 20,
  },
  cardContent: {
    padding: 24,
  },

  // 日付
  dateContainer: {
    marginBottom: 20,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  dateText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
    marginLeft: 6,
  },

  // タイトル
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    lineHeight: 32,
    marginBottom: 20,
  },

  // 区切り線
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginBottom: 24,
  },

  // コンテンツ
  contentContainer: {
    minHeight: 200,
  },
  content: {
    fontSize: 16,
    lineHeight: 26,
    color: '#374151',
    fontWeight: '400',
  },

  // アクションボタン
  actionContainer: {
    marginHorizontal: 20,
    marginTop: 16,
  },
  actionButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});