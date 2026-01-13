import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { COLORS } from "@/constants/Colors";
import { SIZES_WITH_ALIASES as SIZES } from "@/constants/Sizes";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Mock messages
const MOCK_MESSAGES = [
  {
    id: 1,
    text: "Hi, is this item still available?",
    sender: "buyer",
    time: "10:30 AM",
  },
  {
    id: 2,
    text: "Yes, it's available! Are you interested?",
    sender: "seller",
    time: "10:32 AM",
  },
  {
    id: 3,
    text: "Yes, I'm interested. Can you share more photos?",
    sender: "buyer",
    time: "10:33 AM",
  },
  {
    id: 4,
    text: "Sure, let me send you some more pictures.",
    sender: "seller",
    time: "10:35 AM",
  },
  {
    id: 5,
    text: "What's your best price?",
    sender: "buyer",
    time: "10:40 AM",
  },
];

export default function ChatDetailScreen() {
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [inputText, setInputText] = useState("");

  const userName = params.userName as string || "Seller";
  const productTitle = params.productTitle as string || "Product";

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      text: inputText.trim(),
      sender: "buyer",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages([...messages, newMessage]);
    setInputText("");

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleConfirmDeal = () => {
    const dealMessage = {
      id: messages.length + 1,
      text: "🎉 Deal Confirmed! The admin has been notified.",
      sender: "system",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages([...messages, dealMessage]);
  };

  const renderMessage = ({ item }: { item: typeof MOCK_MESSAGES[0] }) => {
    const isBuyer = item.sender === "buyer";
    const isSystem = item.sender === "system";

    if (isSystem) {
      return (
        <View style={styles.systemMessage}>
          <ThemedText style={styles.systemMessageText}>{item.text}</ThemedText>
        </View>
      );
    }

    return (
      <View style={[styles.messageRow, isBuyer && styles.messageRowBuyer]}>
        {!isBuyer && (
          <Image
            source={{ uri: "https://i.pravatar.cc/150?img=11" }}
            style={styles.messageAvatar}
          />
        )}
        <View
          style={[
            styles.messageBubble,
            isBuyer ? styles.buyerBubble : styles.sellerBubble,
          ]}
        >
          <ThemedText
            style={[
              styles.messageText,
              isBuyer && styles.buyerMessageText,
            ]}
          >
            {item.text}
          </ThemedText>
          <ThemedText
            style={[
              styles.messageTime,
              isBuyer && styles.buyerMessageTime,
            ]}
          >
            {item.time}
          </ThemedText>
        </View>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.userInfo}>
          <Image
            source={{ uri: "https://i.pravatar.cc/150?img=11" }}
            style={styles.headerAvatar}
          />
          <View style={styles.headerText}>
            <View style={styles.headerNameRow}>
              <ThemedText style={styles.headerName}>{userName}</ThemedText>
              <View style={styles.onlineDot} />
            </View>
            <ThemedText style={styles.headerStatus} numberOfLines={1}>
              {productTitle}
            </ThemedText>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuBtn}>
          <Ionicons name="ellipsis-vertical" size={22} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Product Preview */}
      <View style={styles.productPreview}>
        <Image
          source={{ uri: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100" }}
          style={styles.productImage}
        />
        <View style={styles.productInfo}>
          <ThemedText style={styles.productTitle} numberOfLines={1}>
            {productTitle}
          </ThemedText>
          <ThemedText style={styles.productPrice}>₹85,000</ThemedText>
        </View>
        <TouchableOpacity style={styles.dealBtn} onPress={handleConfirmDeal}>
          <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
          <ThemedText style={styles.dealBtnText}>Confirm Deal</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.chatContainer}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        />

        {/* Input Area */}
        <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 10 }]}>
          <TouchableOpacity style={styles.attachBtn}>
            <Ionicons name="add-circle" size={28} color={COLORS.primary} />
          </TouchableOpacity>
          
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
            <TouchableOpacity style={styles.emojiBtn}>
              <Ionicons name="happy-outline" size={24} color={COLORS.gray} />
            </TouchableOpacity>
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
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
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

  /* Product Preview */
  productPreview: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.padding,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 12,
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
  },
  productInfo: {
    flex: 1,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.primary,
    marginTop: 2,
  },
  dealBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.success + "15",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  dealBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.success,
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
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
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
    alignItems: "flex-end",
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
    alignItems: "flex-end",
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

