<script setup lang="ts">
  import { onLaunch, onShow, onHide } from '@dcloudio/uni-app';

  onLaunch(() => {
    // oxlint-disable-next-line no-console
    console.log('App Launch');
  });
  onShow(() => {
    // oxlint-disable-next-line no-console
    console.log('App Show');
  });
  onHide(() => {
    // oxlint-disable-next-line no-console
    console.log('App Hide');
  });
</script>
<style></style>
