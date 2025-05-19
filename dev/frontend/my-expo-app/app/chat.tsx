import React, { useState, useRef } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

// ✅ ScrollView を型として使う場合はこれでOK
const scrollViewRef = useRef<ScrollView>(null);


type Message = {
  sender: "user" | "ai";
  text: string;
};

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  
  const handleSend = () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { sender: "user", text: input }];
    setMessages(newMessages);
    setInput("");

    // スクロール追従
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // 仮のAI応答SS
    setTimeout(() => {
      const reply = [...newMessages, { sender: "ai", text: "これはAIの返答です（仮）" }];
      setMessages(reply);

      // スクロール追従
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }, 500);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>チャット画面</Text>

      <ScrollView
        ref={scrollViewRef}
        style={styles.chatArea}
        contentContainerStyle={{ padding: 10 }}
      >
        {messages.map((msg, index) => (
          <View
            key={index}
            style={{
              flexDirection: msg.sender === "user" ? "row-reverse" : "row",
              alignItems: "flex-end",
              marginVertical: 4,
            }}
          >
            {msg.sender === "ai" && (
              <Text style={{ fontSize: 20, marginRight: 5 }}>🤖</Text>
            )}

            <View
              style={[
                styles.messageBubble,
                msg.sender === "user" ? styles.user : styles.ai,
              ]}
            >
              <Text
                style={{
                  color: msg.sender === "user" ? "#fff" : "#000",
                }}
              >
                {msg.text}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputArea}>
  <TextInput
    style={styles.input}
    value={input}
    onChangeText={setInput}
    placeholder="メッセージを入力"
    returnKeyType="send"            // スマホで送信ボタン表示
    onSubmitEditing={handleSend}    // Enter押したら送信
    blurOnSubmit={false}            // キーボード閉じない
  />
  <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
    <Text style={styles.sendIcon}>➤</Text>
  </TouchableOpacity>
</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f1f1",
  },
  title: {
    textAlign: "center",
    marginVertical: 10,
    fontSize: 16,
    fontWeight: "bold",
  },
  chatArea: {
    flex: 1,
  },
  messageBubble: {
    maxWidth: "70%",
    padding: 10,
    borderRadius: 12,
  },
  user: {
    backgroundColor: "#002F6C",
    alignSelf: "flex-end",
  },
  ai: {
    backgroundColor: "#ddd",
    alignSelf: "flex-start",
  },
  inputArea: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "#eee",
    borderRadius: 20,
    paddingHorizontal: 15,
    height: 40,
    marginRight: 10,
  },
  sendButton: {
  padding: 10,
  justifyContent: "center",
  alignItems: "center",
},
sendIcon: {
  fontSize: 22,
  color: "#007AFF",
},

    
});
