<template>
  <div
    class="w-full flex flex-col items-center justify-start h-full space-y-6 pt-1"
  >
    <!-- Form -->
    <app-form-wrapper
      ref="formComponent"
      :parent-refs="parentRefs"
      class="w-full flex flex-col space-y-[20px] h-full"
    >
      <!-- Info box -->
      <app-info-box>
        <app-normal-text custom-class="!leading-5">
          <span class="font-semibold">Optional step</span>
          to give customers the choice for different versions of same product -
          colors, sizes, style, etc.
        </app-normal-text>
      </app-info-box>

      <div class="w-full flex flex-col">
        <div
          @click="showVariantModal = true"
          class="w-full px-4 flex flex-row space-x-1 items-center border-[1.5px] border-primary py-3 rounded-[12px]"
        >
          <app-icon name="add-green" custom-class="!h-[24px]" />
          <app-normal-text class="!text-primary !font-[500]">
            Add Variants
          </app-normal-text>
        </div>

        <!-- Variants fields -->

        <template v-for="(item, index) in variantAttributes" :key="index">
          <div
            class="w-full flex flex-col pt-4"
            v-if="item.count && item.selected"
          >
            <!-- Title -->
            <app-normal-text
              class="w-full !text-left !font-[500] !text-sm pb-3"
            >
              {{ item.name }}
            </app-normal-text>

            <div class="flex flex-col w-full">
              <div
                v-for="innerIndex in item.count"
                :key="innerIndex"
                class="flex flex-col pb-4"
              >
                <app-text-field
                  :has-title="false"
                  :type="item.type"
                  :placeholder="`Enter ${item.name}`"
                  :name="item.name"
                  v-model="item.values[innerIndex]"
                  :rules="[FormValidations.RequiredRule]"
                >
                  <template #inner-suffix v-if="item.type == 'color'">
                    <div class="h-full flex justify-center items-center">
                      <div
                        :class="`h-[24px] w-[24px] rounded-full `"
                        :style="`background-color: ${
                          item.values[innerIndex]
                            ? item.values[innerIndex]
                            : '#999999'
                        };`"
                      ></div>
                    </div>
                  </template>
                </app-text-field>
              </div>
            </div>
          </div>
        </template>
      </div>
    </app-form-wrapper>

    <!-- Add variant Modal -->
    <app-modal
      v-if="showVariantModal"
      :close="
        () => {
          showVariantModal = false;
        }
      "
      :innerClass="'!p-0'"
      :hasTitle="true"
      title="Add Variants"
    >
      <div
        class="w-full flex flex-col relative !overflow-y-auto !max-h-[400px] !px-0"
      >
        <div class="w-full flex flex-col pb-4">
          <div
            v-for="(variant, index) in variantAttributes"
            :key="index"
            class="mb-4 grid grid-cols-12 items-center border-[1.5px] border-[#E0E2E4] rounded-[12px]"
          >
            <div class="col-span-6 flex flex-row px-3 !text-left py-4 relative">
              <app-content-editable
                v-model="variant.name"
                :default-value="variant.name"
                v-if="variant.editable"
                class="!font-semibold !text-sm !text-black !min-w-[30px]"
                placeholder="Custom"
              />
              <app-normal-text v-else class="!font-semibold !text-sm">
                {{ variant.name }}
              </app-normal-text>

              <div
                @click="removeAttribute(index)"
                v-if="variant.deletable"
                class="absolute right-0 top-0 h-full px-2 bg-white flex items-center justify-center"
              >
                <app-icon name="trash" custom-class="!h-[22px]" />
              </div>
            </div>
            <div
              class="col-span-4 flex flex-row items-center justify-between px-2 !text-left py-4 !border-l-[1.5px] !border-r-[1.5px] border-[#E0E2E4]"
            >
              <div
                @click="variant.count > 0 ? variant.count-- : null"
                :class="`w-[24px] h-[24px] flex items-center justify-center ${
                  variant.count == 0 ? 'opacity-30' : ''
                }`"
              >
                <app-icon name="minus" custom-class="!h-[12px] !w-[16px]" />
              </div>

              <app-normal-text class="!text-center !font-semibold !text-base">
                {{ variant.count }}
              </app-normal-text>

              <div
                @click="variant.count++"
                class="w-[24px] h-[24px] flex items-center justify-center"
              >
                <app-icon name="plus" custom-class="!h-[24px]" />
              </div>
            </div>

            <div
              @click="
                variant.selected
                  ? (variant.selected = false)
                  : (variant.selected = true)
              "
              class="col-span-2 flex flex-row items-center justify-center"
            >
              <app-icon
                :name="variant.selected ? 'selected' : 'not-selected'"
                custom-class="!h-[22px]"
              />
            </div>
          </div>

          <div class="w-full flex flex-col pt-1">
            <div
              @click="addNewAttribute"
              class="w-full px-4 flex flex-row space-x-1 items-center border-[1.5px] border-primary py-3 rounded-[12px]"
            >
              <app-icon name="add-green" custom-class="!h-[24px]" />
              <app-normal-text class="!text-primary !font-[500]">
                Add Custom
              </app-normal-text>
            </div>
          </div>
        </div>

        <app-button
          :custom-class="`!bg-secondary !w-full !py-4 w-full !text-xs`"
          @click="showVariantModal = false"
          variant="secondary"
        >
          Save
        </app-button>
      </div>
    </app-modal>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from "vue";
import {
  AppFormWrapper,
  AppInfoBox,
  AppNormalText,
  AppIcon,
  AppModal,
  AppButton,
  AppContentEditable,
  AppTextField,
} from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { VariantAttribute } from "../../composable/shop";

export default defineComponent({
  components: {
    AppFormWrapper,
    AppInfoBox,
    AppNormalText,
    AppIcon,
    AppModal,
    AppButton,
    AppContentEditable,
    AppTextField,
  },
  props: {},
  name: "ProductSetupProductVariants",
  setup() {
    const FormValidations = Logic.Form;

    const formData = reactive({
      password: "",
      confirmPassword: "",
    });

    const variantAttributes = reactive<VariantAttribute[]>([
      {
        name: "Color",
        type: "color",
        count: 0,
        key: "color",
        editable: false,
        selected: false,
        deletable: false,
        values: [],
      },
    ]);

    const showVariantModal = ref(false);

    const formComponent = ref<any>(null);

    const continueWithForm = () => {
      const state = formComponent.value?.validate();
      if (state) {
        // Proceed with form submission
        return formData;
      } else {
        return;
      }
    };

    const addNewAttribute = () => {
      variantAttributes.push({
        name: "",
        type: "text",
        count: 0,
        key: Logic.Common.makeid(10),
        editable: true,
        selected: true,
        deletable: true,
        values: [],
      });
    };

    const removeAttribute = (index: number) => {
      variantAttributes.splice(index, 1);
    };

    return {
      FormValidations,
      Logic,
      formData,
      formComponent,
      continueWithForm,
      showVariantModal,
      variantAttributes,
      addNewAttribute,
      removeAttribute,
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
