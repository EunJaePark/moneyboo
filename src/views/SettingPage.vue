<template>
  <div class="setting-page-wrap no-header">
    <SetAsset class="set-asset"></SetAsset>
    <SetCategory class="set-category"></SetCategory>
  </div>
</template>

<script>
import SetAsset from '@/components/setting/SetAsset.vue';
import SetCategory from '@/components/setting/SetCategory.vue';
import listMixins from '@/mixins/listMixins.js';
export default {
  components: {
    SetAsset,
    SetCategory,
  },
  mixins: [listMixins],
};
</script>

<style></style>
