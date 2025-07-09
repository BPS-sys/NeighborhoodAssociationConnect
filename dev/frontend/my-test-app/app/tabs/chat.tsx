import { Ionicons } from "@expo/vector-icons";
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { useRef, useState } from "react";
import {
  Dimensions,
  KeyboardAvoidingView, Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useAuth } from '../../contexts/AuthContext';

const { width } = Dimensions.get('window');
const scrollViewRef = useRef<ScrollView>(null);

type Message = {
  sender: "user" | "ai";
  text: string;
  timestamp: string;
};

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [input, setInput] = useState("");
  const { RegionID, regionName, userName } = useAuth();

  const handleSend = async () => {
    if (!input.trim() || isTyping) return; // 追加: isTyping が true のとき送信禁止

    const now = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const newMessages = [
      ...messages,
      { sender: "user", text: input, timestamp: now },
    ];
    setMessages(newMessages);
    setIsTyping(true); // AI返答待機状態にする
    setInput("");

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const response = await fetch(`${Constants.expoConfig?.extra?.deployUrl}/api/v1/Chat`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${Constants.expoConfig?.extra?.backendAPIKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          UserMessage: input,
          RegionID: RegionID,
          RegionName: regionName,
        }),
      });

      const data = await response.json();
      
      const replyMessage = {
        sender: "ai",
        text: data || "AIの返答がありません",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, replyMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "エラーが発生しました。",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } finally {
      setIsTyping(false); // AI返答終了で送信可能に戻す
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };


  const TypingIndicator = () => (
    <View style={styles.typingContainer}>
      <View style={styles.aiAvatar}>
        <Ionicons name="hardware-chip-outline" size={20} color="#ffffff" />
      </View>
      <View style={styles.typingBubble}>
        <View style={styles.typingDots}>
          <View style={[styles.dot, styles.dot1]} />
          <View style={[styles.dot, styles.dot2]} />
          <View style={[styles.dot, styles.dot3]} />
        </View>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20} // 必要に応じて調整
    >
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      
      {/* ヘッダーグラデーション */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <View style={styles.aiHeaderAvatar}>
            <Ionicons name="hardware-chip-outline" size={20} color="#ffffff" />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>AIアシスタント</Text>
            <Text style={styles.headerSubtitle}>{regionName || 'チャット'}</Text>
          </View>
          <View style={styles.onlineIndicator} />
        </View>
      </LinearGradient>

      {/* チャットエリア */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.chatArea}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="chatbubble-outline" size={48} color="#94a3b8" />
            </View>
            <Text style={styles.emptyStateTitle}>チャットを始めましょう</Text>
            <Text style={styles.emptyStateSubtitle}>
              何かお手伝いできることはありますか？
            </Text>
          </View>
        )}

        {messages.map((msg, index) => (
          <View
            key={index}
            style={[
              styles.messageContainer,
              msg.sender === "user" ? styles.userMessageContainer : styles.aiMessageContainer
            ]}
          >
            {msg.sender === "ai" && (
              <View style={styles.aiAvatar}>
                <Ionicons name="hardware-chip-outline" size={20} color="#ffffff" />
              </View>
            )}

            <View
              style={[
                styles.messageBubble,
                msg.sender === "user" ? styles.userBubble : styles.aiBubble,
              ]}
            >
              <Text style={[
                styles.messageText,
                msg.sender === "user" ? styles.userText : styles.aiText
              ]}>
                {msg.text}
              </Text>
              <Text style={[
                styles.timestamp,
                msg.sender === "user" ? styles.userTimestamp : styles.aiTimestamp
              ]}>
                {msg.timestamp}
              </Text>
            </View>
          </View>
        ))}

        {isTyping && <TypingIndicator />}
      </ScrollView>

      {/* 入力エリア */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="メッセージを入力..."
            placeholderTextColor="#94a3b8"
            returnKeyType="send"
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
            multiline
          />
          <TouchableOpacity
            onPress={handleSend}
            style={[
              styles.sendButton,
              input.trim() ? styles.sendButtonActive : styles.sendButtonInactive
            ]}
            disabled={!input.trim() || isTyping}
          >
            <LinearGradient
              colors={input.trim() && !isTyping ? ['#667eea', '#764ba2'] : ['#e2e8f0', '#e2e8f0']}
              style={styles.sendButtonGradient}
            >
              <Ionicons 
                name="send" 
                size={18} 
                color={input.trim() && !isTyping ? "#ffffff" : "#94a3b8"} 
              />
            </LinearGradient>

          </TouchableOpacity>
        </View>
      </View>
    </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },

  // ヘッダー
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  aiHeaderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: "center",
    alignItems: "center",
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "700",
  },
  headerSubtitle: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    marginTop: 2,
  },
  onlineIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#10b981",
  },
  userGreeting: {
    alignItems: "center",
    marginTop: 16,
  },
  greetingText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
  },

  // チャットエリア
  chatArea: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
    paddingBottom: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyIconContainer: {
    backgroundColor: '#f1f5f9',
    borderRadius: 32,
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
  },

  // メッセージ
  messageContainer: {
    flexDirection: "row",
    marginVertical: 8,
    alignItems: "flex-end",
  },
  userMessageContainer: {
    flexDirection: "row-reverse",
  },
  aiMessageContainer: {
    flexDirection: "row",
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#667eea",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    marginBottom: 2,
  },
  messageBubble: {
  maxWidth: width * 0.7,  // 少し小さめに調整
  paddingHorizontal: 16,
  paddingVertical: 12,
  borderRadius: 20,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 4,
  flexShrink: 1,           // テキストが縮むようにする
  overflow: 'hidden',      // はみ出し防止
},
  userBubble: {
    backgroundColor: "#ffffff",
    borderBottomRightRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  aiBubble: {
    backgroundColor: "#ffffff",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  messageText: {
  fontSize: 16,
  lineHeight: 22,
  flexWrap: 'wrap',        // 折り返しを有効に
},
  userText: {
    color: "#1e293b",
  },
  aiText: {
    color: "#1e293b",
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  userTimestamp: {
    color: "#94a3b8",
  },
  aiTimestamp: {
    color: "#94a3b8",
  },

  // タイピングインジケーター
  typingContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginVertical: 8,
  },
  typingBubble: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  typingDots: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#94a3b8",
    marginHorizontal: 2,
  },
  dot1: {},
  dot2: {},
  dot3: {},

  // 入力エリア
  inputContainer: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#f8fafc",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxHeight: 100,
    color: "#1e293b",
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 8,
    overflow: 'hidden',
  },
  sendButtonActive: {},
  sendButtonInactive: {},
  sendButtonGradient: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
});