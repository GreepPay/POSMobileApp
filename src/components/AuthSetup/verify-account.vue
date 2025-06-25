<template>
  <div class="w-full flex flex-col items-center justify-start h-full space-y-6">
    <!-- Form -->
    <app-form-wrapper
      ref="formComponent"
      :parent-refs="parentRefs"
      class="w-full flex flex-col space-y-[20px] h-full"
    >
      <!-- Info box -->
      <app-info-box>
        <app-normal-text custom-class="!leading-5">
          <span class="font-semibold">Quick security check!</span>
          Please upload legal documents below to get verified.
        </app-normal-text>
      </app-info-box>

      <!-- Form fields -->
      <app-file-attachment
        v-model="formData.international_passport"
        class="w-full flex flex-col"
        is-wrapper
        accept="image/*, application/pdf"
      >
        <template #content>
          <div
            class="flex w-full flex-col space-y-3 px-4 py-4 !border-[1.5px] !border-dashed !border-[#999999] rounded-[10px]"
          >
            <app-normal-text class="w-full text-left font-semibold !text-sm">
              International Passport
            </app-normal-text>

            <div class="w-full flex flex-row items-center justify-between">
              <app-normal-text
                class="text-left text-gray-two line-clamp-2 !text-wrap"
              >
                {{
                  formData.international_passport
                    ? formData.international_passport.name
                    : "Upload File"
                }}
              </app-normal-text>

              <div class="w-[29px] justify-end flex flex-row">
                <app-icon name="document-upload" class="h-[24px]" />
              </div>
            </div>
          </div>
        </template>
      </app-file-attachment>

      <app-file-attachment
        v-model="formData.business_document"
        class="w-full flex flex-col"
        is-wrapper
        accept="image/*, application/pdf"
      >
        <template #content>
          <div
            class="flex flex-col w-full space-y-3 px-4 py-4 !border-[1.5px] !border-dashed !border-veryLightGray rounded-[10px]"
          >
            <app-normal-text class="w-full text-left font-semibold">
              Business Registration
            </app-normal-text>

            <div
              class="w-full flex flex-row items-center justify-between text-wrap"
            >
              <app-normal-text
                class="text-left text-gray-two line-clamp-2 text-wrap"
              >
                {{
                  formData.business_document
                    ? formData.business_document.name
                    : "Upload File"
                }}
              </app-normal-text>

              <div class="w-[29px] justify-end flex flex-row">
                <app-icon name="document-upload" class="h-[24px]" />
              </div>
            </div>
          </div>
        </template>
      </app-file-attachment>

      <app-file-attachment
        v-model="formData.business_document_2"
        class="w-full flex flex-col"
        is-wrapper
        accept="image/*, application/pdf"
      >
        <template #content>
          <div
            class="flex flex-col w-full space-y-3 px-4 py-4 !border-[1.5px] !border-dashed !border-veryLightGray rounded-[10px]"
          >
            <app-normal-text class="w-full text-left font-semibold">
              Other Business Document
            </app-normal-text>

            <div class="w-full flex flex-row items-center justify-between">
              <app-normal-text
                class="text-left text-gray-two line-clamp-2 text-wrap"
              >
                {{
                  formData.business_document_2
                    ? formData.business_document_2.name
                    : "Upload File"
                }}
              </app-normal-text>

              <div class="w-[29px] justify-end flex flex-row">
                <app-icon name="document-upload" class="h-[24px]" />
              </div>
            </div>
          </div>
        </template>
      </app-file-attachment>
    </app-form-wrapper>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";
import {
  AppFormWrapper,
  AppInfoBox,
  AppNormalText,
  AppFileAttachment,
  AppIcon,
} from "@greep/ui-components";
import { Logic } from "@greep/logic";

export default defineComponent({
  components: {
    AppFormWrapper,
    AppFileAttachment,
    AppInfoBox,
    AppNormalText,
    AppIcon,
  },
  props: {},
  name: "AuthSetupVerifyAccount",
  setup() {
    const FormValidations = Logic.Form;

    const formData = reactive<{
      international_passport: any;
      business_document: any;
      business_document_2: any;
    }>({
      international_passport: "",
      business_document: "",
      business_document_2: "",
    });

    const continueWithForm = () => {
      if (formData.international_passport && formData.business_document) {
        return formData;
      } else {
        return;
      }
    };

    return {
      formData,
      FormValidations,
      continueWithForm,
    };
  },
  data() {
    return {
      parentRefs: [],
    };
  },
  mounted() {
    const parentRefs: any = this.$refs;
    this.parentRefs = parentRefs;
  },
});
</script>
