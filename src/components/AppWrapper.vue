<template>
  <template v-if="buildType == 'mobile'">
    <ion-page
      :registerIonPage="registerIonPage"
      id="ionPageApp"
      :class="`${innerClassRef} h-full ${
        currentPlatform == 'ios' || currentPlatform == 'android' ? '!pt-6' : ''
      }`"
    >
      <ion-content :scroll-y="false" id="mainContent" :class="`${innerClassRef} h-full`">
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
