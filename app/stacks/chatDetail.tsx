import SafetyTipsModal from "@/components/SafetyTipsModal";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { COLORS } from "@/constants/Colors";
import { sendChatMessageApi, getConversationMessagesApi, markConversationAsReadApi } from "@/constants/functions";
import { SIZES_WITH_ALIASES as SIZES } from "@/constants/Sizes";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  BackHandler,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";


export default function ChatDetailScreen() {
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const [inputText, setInputText] = useState("");
  const [showSafetyTips, setShowSafetyTips] = useState(true);
  const currentUser = useSelector((state: any) => state.entities.authReducer?.user);
  const userName = params.userName as string || "User";
  const conversation_id = params.conversation_id as string || "";
  const receiverId = params.receiverId as string || "";
  const [messages, setMessages] = useState<any[]>([]);

  const getMessages = async () => {
    try {
      const response = await getConversationMessagesApi(conversation_id);
      if (response && Array.isArray(response)) {
        // Sort messages by created_at ascending (oldest first, newest at bottom)
        const sortedMessages = [...response].sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        setMessages(sortedMessages);
      }
      await markConversationAsReadApi(conversation_id);
    } catch (error) {
      console.log(error, "error");
    }
  };
  useEffect(() => {
    getMessages();
  }, []);
  useEffect(() => {
    const backAction = () => {
      router.replace("/(tabs)/chat");
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );
    return () => backHandler.remove();
  }, []);
  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  };

  // Get initials from name
  const getInitials = (name: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;
    try {
      const response = await sendChatMessageApi({
        "conversation_id": parseInt(conversation_id),
        "receiver_id": parseInt(receiverId),
        "message": inputText.trim(),
        "message_type": "text",
        "attachment_url": null
      });
      setInputText("");

      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.log(error, "error");
    } finally {
      getMessages();
    }
  };

  const renderMessage = ({ item }: { item: any }) => {
    // Compare as numbers to handle type mismatch (string vs number)
    const isCurrentUser = Number(item.sender_id) === Number(currentUser?.id);
    const senderName = item.sender?.name || "Unknown";

    return (
      <View style={[styles.messageRow, isCurrentUser && styles.messageRowBuyer]}>
        {!isCurrentUser && (
          <View style={styles.avatarPlaceholder}>
            <ThemedText style={styles.avatarText}>{getInitials(senderName)}</ThemedText>
          </View>
        )}
        <View
          style={[
            styles.messageBubble,
            isCurrentUser ? styles.buyerBubble : styles.sellerBubble,
          ]}
        >
          <ThemedText
            style={[
              styles.messageText,
              isCurrentUser && styles.buyerMessageText,
            ]}
          >
            {item.message}
          </ThemedText>
          <View style={styles.messageFooter}>
            <ThemedText
              style={[
                styles.messageTime,
                isCurrentUser && styles.buyerMessageTime,
              ]}
            >
              {formatTime(item.created_at)}
            </ThemedText>
            {isCurrentUser && (
              <Ionicons
                name={item.is_read ? "checkmark-done" : "checkmark"}
                size={14}
                color={item.is_read ? "#4FC3F7" : "rgba(255,255,255,0.7)"}
                style={{ marginLeft: 4 }}
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={[styles.header]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.replace("/(tabs)/chat")}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>

        <View style={styles.userInfo}>
          <View style={styles.headerAvatarPlaceholder}>
            <ThemedText style={styles.headerAvatarText}>{getInitials(userName)}</ThemedText>
          </View>
          <View style={styles.headerText}>
            <View style={styles.headerNameRow}>
              <ThemedText style={styles.headerName}>{userName}</ThemedText>
            </View>
            <ThemedText style={styles.headerStatus} numberOfLines={1}>
              {messages.length > 0 ? `${messages.length} messages` : "Start a conversation"}
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.chatContainer}
        keyboardVerticalOffset={0}
      >
        {messages.length > 0 ? (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          />
        ) : (
          <View style={styles.emptyChat}>
            <Ionicons name="chatbubbles-outline" size={64} color={COLORS.gray} />
            <ThemedText style={styles.emptyChatText}>No messages yet</ThemedText>
            <ThemedText style={styles.emptyChatSubtext}>Send a message to start the conversation</ThemedText>
          </View>
        )}

        {/* Input Area */}
        <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 10 }]}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              placeholderTextColor={COLORS.gray}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />

          </View>

          <TouchableOpacity
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Ionicons
              name="send"
              size={20}
              color={inputText.trim() ? COLORS.white : COLORS.gray}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      <SafetyTipsModal
        visible={showSafetyTips}
        onClose={() => setShowSafetyTips(false)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SIZES.padding,
    paddingBottom: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  userInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerAvatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary + "20",
    justifyContent: "center",
    alignItems: "center",
  },
  headerAvatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.primary,
  },
  headerText: {
    flex: 1,
  },
  headerNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headerName: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
  },
  headerStatus: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
  },
  menuBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  /* Chat */
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: 16,
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: 12,
    maxWidth: "80%",
  },
  messageRowBuyer: {
    alignSelf: "flex-end",
    flexDirection: "row-reverse",
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: COLORS.primary + "20",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.primary,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 18,
    maxWidth: "100%",
  },
  sellerBubble: {
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 4,
  },
  buyerBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  buyerMessageText: {
    color: COLORS.white,
  },
  messageTime: {
    fontSize: 10,
    color: COLORS.gray,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  buyerMessageTime: {
    color: "rgba(255,255,255,0.7)",
  },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 4,
  },
  emptyChat: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SIZES.padding * 2,
  },
  emptyChatText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: 16,
  },
  emptyChatSubtext: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: "center",
    marginTop: 8,
  },
  systemMessage: {
    alignSelf: "center",
    backgroundColor: COLORS.success + "20",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginVertical: 12,
  },
  systemMessageText: {
    fontSize: 13,
    color: COLORS.success,
    fontWeight: "600",
    textAlign: "center",
  },

  /* Input */
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SIZES.padding,
    paddingTop: 12,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 10,
  },
  attachBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 48,
    maxHeight: 120,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    maxHeight: 100,
  },
  emojiBtn: {
    marginLeft: 8,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  sendBtnDisabled: {
    backgroundColor: COLORS.lightGray,
  },
});

