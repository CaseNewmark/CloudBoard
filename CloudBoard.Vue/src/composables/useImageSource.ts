import { ref, type Ref, watch } from 'vue';
import { resolveImageUrl } from '@/services/imageService';

/** A displayable src for an image URL property, including images stored by the API. */
export function useImageSource(url: () => string | undefined): { src: Ref<string | undefined>; failed: Ref<boolean> } {
  const src = ref<string>();
  const failed = ref(false);
  watch(
    url,
    async (value) => {
      failed.value = false;
      if (!value) {
        src.value = undefined;
        return;
      }
      try {
        const resolved = await resolveImageUrl(value);
        if (url() === value) src.value = resolved;
      } catch {
        if (url() === value) {
          src.value = undefined;
          failed.value = true;
        }
      }
    },
    { immediate: true },
  );
  return { src, failed };
}
