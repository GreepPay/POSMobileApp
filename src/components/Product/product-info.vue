<template>
  <div class="w-full flex flex-col items-center justify-start h-full space-y-6">
    <!-- Form -->
    <app-form-wrapper
      ref="formComponent"
      :parent-refs="parentRefs"
      class="w-full flex flex-col space-y-[23px] h-full"
      v-if="!hideContent"
    >
      <div
        class="w-full flex no-scrollbar flex-row space-x-3 flex-nowrap overflow-x-auto scrollbar-hide"
      >
        <div class="flex flex-row py-2">
          <div class="pr-3 flex flex-col">
            <app-file-attachment
              :is-wrapper="true"
              @update:model-value="
                (images) => {
                  formData.photos.push(...images);
                }
              "
              @update:local-file-url="
                (imageUrls) => {
                  formData.photo_urls.push(...imageUrls);
                }
              "
              :accept="`image/png, image/gif, image/jpeg`"
              is-multiple
              class="flex flex-row items-center justify-start !w-auto"
            >
              <template v-slot:content>
                <div
                  class="w-[96px] h-[96px] !border-[1.5px] border-[#E0E2E4] rounded-[16px] flex flex-row items-center justify-center"
                >
                  <app-icon name="gallery-add" custom-class="!h-[32px]" />
                </div>
              </template>
            </app-file-attachment>
          </div>

          <div
            class="pr-3 flex flex-col relative"
            v-for="(item, index) in formData.photo_urls"
            :key="index"
          >
            <span
              class="absolute top-0 right-0 py-1 px-1 bg-white rounded-full"
              @click="formData.photo_urls.splice(index, 1)"
            >
              <app-icon name="remove-image" custom-class="!h-[28px]" />
            </span>
            <app-image-loader
              :photo-url="item"
              class="w-[96px] h-[96px] !border-[1.5px] border-[#E0E2E4] rounded-[16px]"
            >
            </app-image-loader>
          </div>
        </div>
      </div>

      <app-text-field
        :has-title="false"
        type="text"
        placeholder="Product name"
        ref="productName"
        name="Name"
        v-model="formData.name"
        usePermanentFloatingLabel
        :rules="[FormValidations.RequiredRule]"
      >
      </app-text-field>

      <app-text-field
        :has-title="false"
        type="text"
        placeholder="Type to ‘add new’ or ‘search’"
        ref="productCategory"
        name="Catgory"
        v-model="formData.category"
        usePermanentFloatingLabel
        :rules="[FormValidations.RequiredRule]"
      >
      </app-text-field>

      <app-text-field
        :has-title="false"
        type="text"
        placeholder="Full details of the product"
        ref="productDescription"
        name="Description"
        v-model="formData.descriptions"
        usePermanentFloatingLabel
        is-textarea
        :max-character="10000"
        :rules="[FormValidations.RequiredRule]"
      >
      </app-text-field>

      <!-- Spacer -->
      <div class="h-[30px]"></div>
    </app-form-wrapper>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, onMounted, ref } from "vue";
import {
  AppFormWrapper,
  AppTextField,
  AppIcon,
  AppFileAttachment,
  AppImageLoader,
} from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { User } from "@greep/logic/src/gql/graphql";

export default defineComponent({
  components: {
    AppFormWrapper,
    AppTextField,
    AppIcon,
    AppFileAttachment,
    AppImageLoader,
  },
  props: {
    authUser: {
      type: Object as () => User,
    },
  },
  name: "ProductSetupProductInfo",
  setup(props) {
    const FormValidations = Logic.Form;

    const hideContent = ref(false);

    const formData = reactive<{
      name: string;
      category: string;
      descriptions: string;
      photos: any[];
      photo_urls: any[];
    }>({
      name: "",
      category: "",
      descriptions: "",
      photos: [],
      photo_urls: [],
    });

    const formComponent = ref<any>(null);

    const continueWithForm = () => {
      const state = formComponent.value?.validate();
      if (state) {
        return formData;
      } else {
        return;
      }
    };

    const setDefaultValues = () => {
      if (props.authUser) {
        hideContent.value = true;

        setTimeout(() => {
          hideContent.value = false;
        }, 100);
      }
    };

    onMounted(() => {
      setDefaultValues();
    });

    return {
      FormValidations,
      Logic,
      formData,
      formComponent,
      continueWithForm,
      hideContent,
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
