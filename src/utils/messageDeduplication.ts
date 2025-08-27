import { MessageInfo } from '../composable';

export interface DeduplicationOptions {
  timeWindow?: number; // Default: 5 seconds
  checkRecentDuplicates?: boolean;
  checkExactContentMatch?: boolean;
  checkExistingIds?: boolean;
}

export interface MessageToCheck {
  id: string | number;
  content?: string;
  text_content?: string;
  user_uuid?: string;
  sender?: {
    uuid?: string;
  };
}

/**
 * Check if a message already exists by ID
 */
export function checkExistingMessageById(
  message: MessageToCheck,
  existingMessages: MessageInfo[]
): boolean {
  const existingIndex = existingMessages.findIndex(m => m.id === message.id.toString());
  return existingIndex !== -1;
}

/**
 * Check for recent duplicate messages within a time window
 */
export function checkRecentDuplicates(
  message: MessageToCheck,
  existingMessages: MessageInfo[],
  options: DeduplicationOptions = {}
): MessageInfo | null {
  const timeWindow = options.timeWindow || 5000; // 5 seconds default
  const messageContent = message.text_content || message.content;
  const messageUserId = message.sender?.uuid || message.user_uuid;
  const now = Date.now();

  const recentDuplicate = existingMessages.find(m => {
    const mContent = m.text_content;
    const mUserId = m.user_uuid === "greep_ai" ? "greep_ai" :
      (m.user_uuid === "temp_user" ? "temp_user" : m.user_uuid);

    // Check if content and user match
    const contentMatches = mContent === messageContent;
    const userMatches = mUserId === messageUserId ||
      (mUserId === "greep_ai" && messageUserId === "greep_ai");

    // Check if message was added recently (within time window)
    const isRecent = typeof m.id === 'string' && m.id.startsWith('temp_') ?
      parseInt(m.id.split('_')[1]) > (now - timeWindow) : false;

    return contentMatches && userMatches && isRecent;
  });

  return recentDuplicate || null;
}

/**
 * Check for exact content match from current user (prevents server confirmation duplicates)
 */
export function checkExactContentMatch(
  message: MessageToCheck,
  existingMessages: MessageInfo[],
  currentUserUuid: string
): MessageInfo | null {
  const messageContent = message.text_content || message.content;
  const isFromCurrentUser = message.sender?.uuid === currentUserUuid || message.user_uuid === currentUserUuid;
  
  if (!isFromCurrentUser) {
    return null;
  }

  const exactContentMatch = existingMessages.find(m =>
    m.text_content === messageContent &&
    m.user_uuid === currentUserUuid
  );

  return exactContentMatch || null;
}

/**
 * Comprehensive message deduplication check
 * Returns true if message should be skipped (is duplicate)
 */
export function shouldSkipMessage(
  message: MessageToCheck,
  existingMessages: MessageInfo[],
  currentUserUuid: string,
  options: DeduplicationOptions = {}
): { shouldSkip: boolean; reason?: string; duplicateMessage?: MessageInfo } {
  const {
    checkRecentDuplicates: enableRecentCheck = true,
    checkExactContentMatch: enableExactCheck = true,
    checkExistingIds: enableIdCheck = true
  } = options;

  // Check 1: Message already exists by ID
  if (enableIdCheck && checkExistingMessageById(message, existingMessages)) {
    return {
      shouldSkip: true,
      reason: 'Message already exists by ID'
    };
  }

  // Check 2: Recent duplicate within time window
  if (enableRecentCheck) {
    const recentDuplicate = checkRecentDuplicates(message, existingMessages, options);
    if (recentDuplicate) {
      return {
        shouldSkip: true,
        reason: 'Recent duplicate message found',
        duplicateMessage: recentDuplicate
      };
    }
  }

  // Check 3: Exact content match from current user
  if (enableExactCheck) {
    const exactMatch = checkExactContentMatch(message, existingMessages, currentUserUuid);
    if (exactMatch) {
      return {
        shouldSkip: true,
        reason: 'Exact content match for current user',
        duplicateMessage: exactMatch
      };
    }
  }

  return { shouldSkip: false };
}

/**
 * Enhanced logging for deduplication decisions
 */
export function logDeduplicationDecision(
  message: MessageToCheck,
  result: ReturnType<typeof shouldSkipMessage>
): void {
  if (result.shouldSkip) {
    console.log("⏭️ Message skipped:", {
      reason: result.reason,
      messageId: message.id,
      content: (message.text_content || message.content)?.substring(0, 50) + '...',
      userId: message.sender?.uuid || message.user_uuid,
      duplicateId: result.duplicateMessage?.id
    });
  } else {
    console.log("✅ Message passed deduplication check:", {
      messageId: message.id,
      content: (message.text_content || message.content)?.substring(0, 50) + '...',
      userId: message.sender?.uuid || message.user_uuid
    });
  }
}
