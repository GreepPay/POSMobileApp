<template>
  <app-wrapper mobilePadding="!pt-0">
    <default-page-layout
      :title="'Shop'"
      :photoUrl="
        AuthUser?.profile?.business?.logo || '/images/profile-image.svg'
      "
    >
      <div
        class="w-full flex flex-col items-center h-[80%] justify-start !space-y-[20px]"
      >
        <div class="h-full flex flex-col items-center justify-center">
          <app-empty-state
            icon="empty-products"
            title="List Products"
            description="Your shop is empty; add first product to start selling, attract customers, and grow your shop on the marketplace."
            class="!border-none"
            :buttonData="{
              label: 'Add Product',
              action: () => {
                Logic.Common.GoToRoute('/shop/products/add');
              },
            }"
          />
        </div>
      </div>
    </default-page-layout>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { DefaultPageLayout, AppEmptyState } from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { User } from "@greep/logic/src/gql/graphql";

export default defineComponent({
  name: "ShopIndexPage",
  components: {
    DefaultPageLayout,
    AppEmptyState,
  },
  layout: "Dashboard",
  middlewares: {
    fetchRules: [],
  },
  setup() {
    const AuthUser = ref<User>(Logic.Auth.AuthUser);

    return {
      Logic,
      AuthUser,
    };
  },
});
</script>
<style scoped></style>
