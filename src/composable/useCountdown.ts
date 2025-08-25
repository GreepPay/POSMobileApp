import { ref, computed, ComputedRef } from 'vue';

export type CountdownType = 'waiting_business' | 'payment_confirmation' | 'send_usdc';

interface CountdownVisibilityOptions {
  isBusinessUser: ComputedRef<boolean>;
  orderConfirmed: ComputedRef<boolean>;
  isConversationCompleted: ComputedRef<boolean>;
  paymentConfirmed: ComputedRef<boolean>;
  stage: ComputedRef<string>;
}

export function useCountdown(visibilityOptions?: CountdownVisibilityOptions) {
  const countdownSeconds = ref(600); // Default 10 minutes
  const countdownType = ref<CountdownType>('waiting_business');

  // Computed text for countdown based on type
  const countdownText = computed(() => {
    switch (countdownType.value) {
      case 'waiting_business':
        return 'Waiting for business:';
      case 'payment_confirmation':
        return '';
      case 'send_usdc':
        return 'Sending USDC to business in';
      default:
        return 'Time remaining:';
    }
  });

  // Check if countdown is active
  const isCountdownActive = computed(() => {
    return countdownSeconds.value > 0;
  });

  // Determine when to show countdown based on conversation state and type
  const shouldShowCountdown = computed(() => {
    if (!visibilityOptions || !isCountdownActive.value) return false;
    
    const { isBusinessUser, orderConfirmed, isConversationCompleted, paymentConfirmed, stage } = visibilityOptions;
    const type = countdownType.value;
    
    // Only show countdown for the customer/seller, not business users
    if (isBusinessUser.value) return false;
    
    // Show waiting_business countdown only after order is confirmed and waiting for business to accept
    if (type === 'waiting_business') {
      // Only show if order is confirmed and we're waiting
      return orderConfirmed.value && !isConversationCompleted.value;
    }
    
    // Show send_usdc countdown during final USDC release stage (seller only)
    if (type === 'send_usdc') {
      // Only show during the final release stage
      return stage.value === 'finalize_payment' || paymentConfirmed.value;
    }
    
    // Don't show payment_confirmation countdown in main chat area (it's in the inline section)
    if (type === 'payment_confirmation') {
      return false;
    }
    
    return false;
  });

  // Start countdown with specific type and duration
  const startCountdown = (type: CountdownType, duration: number) => {
    countdownType.value = type;
    countdownSeconds.value = duration;
  };

  // Stop/reset countdown
  const stopCountdown = () => {
    countdownSeconds.value = 0;
  };

  return {
    countdownSeconds,
    countdownType,
    countdownText,
    isCountdownActive,
    shouldShowCountdown,
    startCountdown,
    stopCountdown,
  };
}
