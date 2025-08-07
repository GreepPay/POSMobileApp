<template>
  <div class="relative w-full px-4" v-if="validateWarningVisibility">
    <div
      class="w-full px-4 py-4 rounded-xl flex flex-col justify-center items-center !bg-orange-50 border !border-orange-500"
    >
      <app-normal-text
        custom-class="animate-marquee !text-orange-800 text-xs font-medium flex-1 text-center"
      >
        Your account verification is incomplete. Please verify your identity to
        access all features.
      </app-normal-text>
      <div class="w-full flex justify-center items-center pt-2">
        <app-link-text
          text="Verify Now."
          iconClass="!h-5"
          customClass="border !border-green bg-green-50 py-1 px-3 rounded-full !text-green-600"
          @click="Logic.Common.GoToRoute('/auth/kyc-verification')"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent, computed, ref, onMounted } from "vue"
  import { AppLinkText, AppNormalText } from "@greep/ui-components"
  import { Logic } from "@greep/logic"
  import { useRoute } from "vue-router"

  export default defineComponent({
    name: "AuthSSO",
    components: {
      AppLinkText,
      AppNormalText,
    },
    setup() {
      const AuthUser = ref(Logic.Auth.AuthUser)
      const route: any = useRoute()

      const validateWarningVisibility = computed(
        () =>
          !route.fullPath.includes("/auth/") &&
          AuthUser.value?.profile?.verification_status !== "Approved"
      )

      onMounted(() => {
        Logic.Auth.watchProperty("AuthUser", AuthUser)
      })

      return {
        Logic,
        route,
        validateWarningVisibility,
      }
    },
  })
</script>
