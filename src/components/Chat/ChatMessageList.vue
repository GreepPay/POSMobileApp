<template>
  <div class="chat-messages" ref="messagesContainer">
    <div
      v-for="message in displayMessages"
      :key="message.id"
      :class="['message-wrapper', getMessageClass(message, currentUserUuid)]"
    >
      <!-- AI Message -->
      <div v-if="isAIMessage(message)" class="ai-message">
        <div class="message-content">
          <div class="ai-avatar">🤖</div>
          <div class="message-bubble">
            <div class="message-text" v-html="formatMessageText(message.text_content)"></div>
            <div v-if="hasActions(message)" class="message-actions">
              <button
                v-for="action in message.actions"
                :key="action.value"
                :class="['action-button', action.type]"
                @click="handleActionClick(action)"
              >
                {{ action.label }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- User Message -->
      <div v-else-if="isCurrentUserMessage(message, currentUserUuid)" class="user-message">
        <div class="message-content">
          <div class="message-bubble">
            <div class="message-text">{{ message.text_content }}</div>
          </div>
          <div class="user-avatar">👤</div>
        </div>
      </div>

      <!-- Business Message -->
      <div v-else class="business-message">
        <div class="message-content">
          <div class="business-avatar">🏢</div>
          <div class="message-bubble">
            <div class="message-text">{{ message.text_content }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useMessageDisplay } from '../../composables____/chat/useMessageDisplay';
import { MessageInfo } from '../../composable';

interface Props {
  messages: MessageInfo[];
  currentUserUuid: string;
}

interface Emits {
  (e: 'action-click', action: any): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const {
  displayMessages,
  isCurrentUserMessage,
  hasActions,
  isAIMessage,
  isBusinessMessage,
  getMessageClass
} = useMessageDisplay(props.messages);

// Format message text (handle markdown, links, etc.)
const formatMessageText = (text: string) => {
  if (!text) return '';
  
  // Convert line breaks to <br> tags
  let formatted = text.replace(/\n/g, '<br>');
  
  // Convert URLs to clickable links
  formatted = formatted.replace(
    /(https?:\/\/[^\s]+)/g,
    '<a href="$1" target="_blank" class="message-link">$1</a>'
  );
  
  // Convert **bold** to <strong>
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Convert *italic* to <em>
  formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  return formatted;
};

// Handle action button clicks
const handleActionClick = (action: any) => {
  emit('action-click', action);
};
</script>

<style scoped>
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message-wrapper {
  display: flex;
  margin-bottom: 1rem;
}

.message-content {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  max-width: 80%;
}

.ai-message .message-content {
  flex-direction: row;
}

.user-message .message-content {
  flex-direction: row-reverse;
  margin-left: auto;
}

.business-message .message-content {
  flex-direction: row;
}

.ai-avatar,
.business-avatar,
.user-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
}

.ai-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.business-avatar {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.user-avatar {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.message-bubble {
  background: #f8f9fa;
  border-radius: 1rem;
  padding: 0.75rem 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.ai-message .message-bubble {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.user-message .message-bubble {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.business-message .message-bubble {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.message-text {
  line-height: 1.5;
  word-wrap: break-word;
}

.message-text :deep(.message-link) {
  color: inherit;
  text-decoration: underline;
}

.message-actions {
  margin-top: 0.75rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.action-button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-button.primary {
  background: #007bff;
  color: white;
}

.action-button.secondary {
  background: #6c757d;
  color: white;
}

.action-button.success {
  background: #28a745;
  color: white;
}

.action-button.danger {
  background: #dc3545;
  color: white;
}

.action-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.action-button:active {
  transform: translateY(0);
}
</style>
