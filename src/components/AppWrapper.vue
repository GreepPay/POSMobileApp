<template>
  <template v-if="buildType == 'mobile'">
    <ion-page
      :registerIonPage="registerIonPage"
      id="ionPageApp"
      :class="`${innerClassRef}  ${
        currentPlatform == 'ios' || currentPlatform == 'android'
          ? `${mobilePadding}`
          : ''
      }`"
    >
      <ion-content
        :scroll-y="false"
        id="mainContent"
        :class="`${innerClassRef} `"
      >
        <slot />
      </ion-content>
    </ion-page>
  </template>
  <template v-if="buildType == 'web'">
    <div :class="`w-full h-full ${innerClassRef} `" id="ionPageApp">
      <slot />
    </div>
  </template>
</template>

<script lang="ts">
import { defineComponent, toRef } from "vue";
import { IonContent, IonPage } from "@ionic/vue";
import { getPlatforms } from "@ionic/vue";
import { computed } from "vue";

export default defineComponent({
  props: {
    class: {
      type: String,
      default: "",
    },
    registerIonPage: {
      type: Function,
      default: () => {
        //
      },
    },
    innerClass: {
      type: String,
      default: "bg-white dark:bg-black",
    },
    mobilePadding: {
      type: String,
      default: "!pt-6",
    },
  },
  components: {
    IonContent,
    IonPage,
  },
  name: "AppWrapper",
  setup(props) {
    const innerClassRef = toRef(props, "innerClass");

    const buildType = "mobile";

    const currentPlatform = computed(() => {
      return getPlatforms()[0];
    });

    return {
      innerClassRef,
      buildType,
      currentPlatform,
    };
  },
});
</script>
