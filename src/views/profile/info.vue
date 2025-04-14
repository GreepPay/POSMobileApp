<template>
  <app-wrapper>
    <subpage-layout title="Business Info">
      <div
        class="w-full flex flex-col space-y-5 justify-start px-4 h-full pt-4"
      >
        <div class="w-full flex flex-row">
          <div
            :style="`background-image: url(${photoUrl});  background-size: cover;
      background-repeat: no-repeat;
      background-position: center;`"
            class="h-[90px] w-[90px] rounded-full flex flex-row items-center relative"
          >
            <app-file-attachment
              :is-wrapper="true"
              v-model="formDetails.photo"
              v-model:local-file-url="photoUrl"
              :accept="`image/png, image/gif, image/jpeg`"
              class="flex flex-row items-center justify-start !w-auto absolute bottom-[-10%] right-[-10%]"
            >
              <template v-slot:content>
                <app-icon name="upload-image" custom-class="!h-[48px]" />
              </template>
            </app-file-attachment>
          </div>
        </div>
        <div class="w-full flex flex-col pt-3">
          <app-details :details="profileDetails" />
        </div>
      </div>
    </subpage-layout>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { AppDetails, AppFileAttachment, AppIcon } from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { reactive } from "vue";

export default defineComponent({
  name: "ProfileSettingsPage",
  components: {
    AppDetails,
    AppFileAttachment,
    AppIcon,
  },
  setup() {
    const formDetails = reactive({
      photo: "",
    });

    const photoUrl = ref("/images/temps/user-profile.png");

    const profileDetails = reactive([
      {
        title: "First & Last Name",
        content: "Timmy Salami",
      },
      {
        title: "Phone Number",
        content: "+1 801 810 4006",
      },
      {
        title: "Email Address",
        content: "timmy@gmail.com",
      },
      {
        title: "Business Name",
        content: "Timms Closet Ventures",
      },
      {
        title: "State, Country",
        content: "Maryland, USA",
      },
    ]);

    const FormValidations = Logic.Form;

    const continueToNext = () => {
      //   modalIsOpen.value = true;
    };

    return {
      Logic,
      formDetails,
      continueToNext,
      FormValidations,
      profileDetails,
      photoUrl,
    };
  },
});
</script>
