import { ref, onUnmounted } from 'vue';
import { Logic } from '@greep/logic';

export interface WebSocketUser {
  id?: number;
  user_id?: number;
  uuid?: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  user_name?: string;
  user_type?: string;
  participant_type?: string;
  is_business?: boolean;
}

export interface WebSocketMessageData {
  id: number;
  text_content?: string;
  content?: string;
  user_id: number;
  sender_id?: number;
  conversation_id?: number;
  metadata?: string | object;
  sender?: {
    uuid?: string;
    first_name?: string;
    last_name?: string;
  };
}

export function useWebSocket() {
  const echoChannel = ref<any>(null);
  const isConnected = ref(false);

  // Setup WebSocket listeners for a conversation
  const setupWebSocketListeners = (
    conversationUuid: string,
    callbacks: {
      onUserJoining?: (user: WebSocketUser) => void;
      onUserLeaving?: (user: WebSocketUser) => void;
      onMessageCreated?: (data: WebSocketMessageData) => void;
      onBusinessJoined?: (data: WebSocketUser) => void;
    }
  ) => {
    if (!conversationUuid || echoChannel.value) {
      return;
    }

    try {
      // Check if WebSocket is properly initialized
      if (!Logic.Common.laravelEcho) {
        Logic.Common.initiateWebSocket({
          pusherKey: import.meta.env.VITE_PUSHER_APP_KEY,
          pusherHost: import.meta.env.VITE_PUSHER_HOST,
          pusherPort: import.meta.env.VITE_PUSHER_PORT,
          pusherCluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
          socketAuthUrl: import.meta.env.VITE_SOCKET_AUTH_URL,
        });
      }

      // ✅ SINGLE UNIFIED CHANNEL - Conversation channel
      echoChannel.value = Logic.Common.laravelEcho?.join(`conversation.${conversationUuid}`)
        .here((users: WebSocketUser[]) => {
          console.log('🔧 Users currently in conversation:', users);
          isConnected.value = true;
        })
        .joining((user: WebSocketUser) => {
          console.log('🔧 User joining conversation:', user);
          if (callbacks.onUserJoining) {
            callbacks.onUserJoining(user);
          }
        })
        .leaving((user: WebSocketUser) => {
          console.log('🔧 User leaving conversation:', user);
          if (callbacks.onUserLeaving) {
            callbacks.onUserLeaving(user);
          }
        })
        // ✅ LISTEN FOR ALL MESSAGE TYPES ON SAME CHANNEL
        .listen('.message.created', (data: WebSocketMessageData) => {
          console.log('🔧 WebSocket message.created event received:', data);
          if (callbacks.onMessageCreated) {
            callbacks.onMessageCreated(data);
          }
        })
        .listen('.business.joined', (data: WebSocketUser) => {
          console.log('🔧 WebSocket business.joined event received:', data);
          if (callbacks.onBusinessJoined) {
            callbacks.onBusinessJoined(data);
          }
        });

      // ✅ ADDITIONAL: Message channel listener (this is the working one)
      const messageChannel = Logic.Common.laravelEcho?.join(`message.${conversationUuid}`)
        .here((users: WebSocketUser[]) => {
          console.log('🔧 Users currently in message channel:', users);
        })
        .joining((user: WebSocketUser) => {
          console.log('🔧 User joining message channel:', user);
          if (callbacks.onUserJoining) {
            callbacks.onUserJoining(user);
          }
        })
        .leaving((user: WebSocketUser) => {
          console.log('🔧 User leaving message channel:', user);
          if (callbacks.onUserLeaving) {
            callbacks.onUserLeaving(user);
          }
        })
        .listen('.message.created', (data: WebSocketMessageData) => {
          console.log('🔧 WebSocket message channel message.created event received:', data);
          if (callbacks.onMessageCreated) {
            callbacks.onMessageCreated(data);
          }
        })
        .listen('.business.joined', (data: WebSocketUser) => {
          console.log('🔧 WebSocket message channel business.joined event received:', data);
          if (callbacks.onBusinessJoined) {
            callbacks.onBusinessJoined(data);
          }
        });

      console.log('✅ Unified WebSocket listeners set up successfully');
      console.log('🔧 Listening on channels:', {
        conversation: `conversation.${conversationUuid}`,
        message: `message.${conversationUuid}`
      });

    } catch (error) {
      console.error('❌ Error setting up WebSocket listeners:', error);
      isConnected.value = false;
    }
  };

  // Cleanup WebSocket connections
  const cleanup = () => {
    if (echoChannel.value) {
      try {
        console.log('🔧 Cleaning up WebSocket connections');
        // Note: Laravel Echo channels don't have a direct leave method
        // The connection will be cleaned up when the component unmounts
        echoChannel.value = null;
        isConnected.value = false;
      } catch (error) {
        console.error('❌ Error cleaning up WebSocket channel:', error);
      }
    }
  };

  // Determine if user is business based on WebSocket user data
  const isBusinessUser = (user: WebSocketUser, currentUserId: number): number | boolean | undefined  => {
    return user.user_type === 'business' ||
      user.participant_type === 'business' ||
      user.is_business === true ||
      (user.id && user.id !== currentUserId && user.id !== 0) ||
      (user.user_id && user.user_id !== currentUserId && user.user_id !== 0);
  };

  // Get user display name from WebSocket user data
  const getUserDisplayName = (user: WebSocketUser): string => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user.name || user.user_name || "Unknown User";
  };

  // Auto cleanup on unmount
  onUnmounted(() => {
    cleanup();
  });

  return {
    echoChannel,
    isConnected,
    setupWebSocketListeners,
    cleanup,
    isBusinessUser,
    getUserDisplayName,
  };
}
