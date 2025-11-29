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
              @update:files-and-url="
              (newPhotos: any[]) => {
                formData.photos.push(...newPhotos);
              }
            "
              :accept="`image/png, image/gif, image/jpeg, image/webp`"
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
            v-for="(item, index) in formData.photos"
            :key="index"
          >
            <span
              class="absolute top-0 right-0 py-1 px-1 bg-white rounded-full"
              @click="formData.photos.splice(index, 1)"
            >
              <app-icon name="remove-image" custom-class="!h-[28px]" />
            </span>
            <app-image-loader
              :photo-url="item.url"
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

      <app-select
        :placeholder="'Product Category'"
        :hasTitle="false"
        :paddings="'py-4 !px-3'"
        :options="categoryOptions"
        ref="categorySelect"
        use-floating-label
        v-model="formData.category"
        auto-complete
      >
      </app-select>

      <app-select
        :placeholder="'Product Type'"
        :hasTitle="false"
        :paddings="'py-4 !px-3'"
        :options="productTypeOptions"
        ref="country"
        use-floating-label
        v-model="formData.type"
      >
      </app-select>

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

      <div class="w-full flex flex-col">
        <div class="w-40 flex flex-row items-center">
          <app-checkbox
            v-model="formData.isNationalCuisine"
            variant="switch"
            custom-class="!space-x-1"
          >
            <template v-slot:label>
              <app-normal-text custom-class="!font-medium"
                >National Cuisine</app-normal-text
              >
            </template>
          </app-checkbox>
        </div>

        <div class="w-full flex flex-col pt-2">
          <app-select
            v-if="formData.isNationalCuisine"
            :placeholder="'Select the cuisine\'s country'"
            :hasTitle="true"
            :paddings="'py-4 !px-3'"
            :options="cuisineCountryOptions"
            ref="cuisineCountry"
            use-floating-label
            v-model="formData.cuisineCountry"
            auto-complete
          >
          </app-select>
        </div>
      </div>

      <!-- Spacer -->
      <div class="h-[30px]"></div>
    </app-form-wrapper>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, onMounted, ref, watch } from "vue";
import {
  AppFormWrapper,
  AppTextField,
  AppIcon,
  AppFileAttachment,
  AppImageLoader,
  AppSelect,
  AppCheckbox,
  AppNormalText,
  availableCurrencies,
} from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { User } from "@greep/logic/src/gql/graphql";
import { BaseProductSummary } from "../../composable/shop";
import { SelectOption } from "@greep/ui-components/src/types";

export default defineComponent({
  components: {
    AppFormWrapper,
    AppTextField,
    AppIcon,
    AppFileAttachment,
    AppImageLoader,
    AppSelect,
    AppCheckbox,
    AppNormalText,
  },
  props: {
    authUser: {
      type: Object as () => User,
    },
    data: {
      type: Object as () => BaseProductSummary,
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
      photos: {
        url: string;
        rawValue: string;
      }[];
      type: string;
      cuisineCountry: string;
      isNationalCuisine: boolean;
    }>({
      name: "",
      category: "",
      descriptions: "",
      photos: [],
      type: "physical",
      cuisineCountry: "",
      isNationalCuisine: false,
    });

    const formComponent = ref<any>(null);

    // Product Type Options
    const productTypeOptions = reactive<SelectOption[]>([
      {
        key: "physical",
        value: "Physical",
      },
      {
        key: "digital",
        value: "Digital",
      },
    ]);

    // Category Options
    const categoryOptions = ref<SelectOption[]>([]);

    // Cuisine Country Options
    const cuisineCountryOptions = reactive<SelectOption[]>([]);

    // Load categories from API
    const loadCategories = async () => {
      try {
        const categories = await Logic.Product.GetCategories();

        if (categories && categories.length > 0) {
          // Use .value with ref
          categoryOptions.value = categories.map((category) => ({
            key: category.name,
            value: category.name,
          }));
        }
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    };
    const initializeCountries = () => {
      try {
        cuisineCountryOptions.length = 0;
        availableCurrencies
          ?.filter((item) => !item.is_crypto && !item.is_foreign_currency)
          .forEach((currency) => {
            if (currency.country_code && currency.country_name) {
              cuisineCountryOptions.push({
                key: currency.country_code,
                value: currency.country_name || "",
              });
            }
          });
      } catch (error) {
        console.error("Error loading countries:", error);
      }
    };

    const continueWithForm = () => {
      const state = formComponent.value?.validate();
      if (state) {
        return formData;
      } else {
        return;
      }
    };

    const setDefaultValues = () => {
      if (props.data) {
        hideContent.value = true;
        formData.name = props.data.name;
        formData.category = props.data.category; // This should match your existing data structure
        formData.descriptions = props.data.descriptions;
        formData.photos = props.data.photos;
        formData.type = props.data.type;
        formData.cuisineCountry = props.data.cuisineCountry || "";
        formData.isNationalCuisine = props.data.isNationalCuisine || false;

        setTimeout(() => {
          hideContent.value = false;
        }, 200);
      }
    };

    watch(
      () => props.data,
      () => {
        setDefaultValues();
      }
    );

    onMounted(() => {
      initializeCountries();
      loadCategories(); // Load categories when component mounts
      setDefaultValues();
    });

    return {
      FormValidations,
      Logic,
      formData,
      formComponent,
      continueWithForm,
      hideContent,
      productTypeOptions,
      categoryOptions,
      cuisineCountryOptions,
      initializeCountries,
      loadCategories,
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
