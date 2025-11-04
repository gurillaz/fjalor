<template>
  <div class="page-layout">
    <!-- Header Section -->
    <div class="flex items-center justify-between mb-6 mt-2">
      <h1 class="text-xl font-bold">Translation Results</h1>
      <Button variant="outline" @click="goBack" title="Back to Translator">
        <ArrowLeft class="h-4 w-4" />
      </Button>
    </div>

    <!-- Current Translation Result -->
    <div v-if="currentTranslation" class="space-y-4 sm:space-y-6">
      <TranslationCard
        :source="currentTranslation.sourceText"
        :target1="currentTranslation.translation1"
        :target2="currentTranslation.translation2"
        :timestamp="currentTranslation.timestamp"
        :id="currentTranslation.id"
        :translationData="currentTranslation"
        :showDeleteButton="false"
        @saved="onTranslationSaved"
      />

      <!-- AI Generated Examples -->
      <div v-if="examples.length > 0" class="space-y-4">
        <h1 class="text-xl font-bold text-center mb-4 sm:text-2xl sm:mb-6">
          AI Generated Examples
        </h1>


        
              <TranslationCard
                v-for="example in examples"
                :key="example.id"
                :source="example.sourceText"
                :target1="example.translation1"
                :target2="example.translation2"
                :timestamp="example.timestamp"
                :id="example.id"
                :translationData="example"
                :showDeleteButton="false"
                @saved="onTranslationSaved"
              />

      </div>

      <!-- Loading Examples -->
      <div v-else-if="loadingExamples" class="text-center">
        <Card>
          <CardContent class="pt-6">
            <p class="text-muted-foreground">🤖 Generating AI examples...</p>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Empty State -->
    <Card v-else>
      <CardContent class="pt-6">
        <div class="text-center space-y-4">
          <Alert>
            <AlertTitle>No translation result available</AlertTitle>
            <AlertDescription>
              Please go back and translate some text.
            </AlertDescription>
          </Alert>
          <Button @click="goBack"> Back to Translator </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import TranslationCard from "@/components/TranslationCard.vue";
import { translationService } from "@/services/translationService";
import type { Translation as TranslationType, TranslationData } from "@/services/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft } from "lucide-vue-next";

const router = useRouter();

const currentTranslation = ref<TranslationType | null>(null);
const examples = ref<TranslationType[]>([]);
const loadingExamples = ref(false);

const goBack = () => {
  // Try to get the original translation context from router state
  const routerState = history.state as any;
  
  // If we have the original translation context, pass it back
  if (routerState?.translationContext) {
    router.push({
      path: "/",
      state: { translationContext: routerState.translationContext }
    });
  } else {
    // Fallback to simple navigation
    router.push("/");
  }
};

const onTranslationSaved = (translationData: any) => {
  // Translation saved - update the translation in our local data
  if (
    currentTranslation.value &&
    currentTranslation.value.id === translationData.id
  ) {
    currentTranslation.value.saved = translationData.saved;
  }
  examples.value.forEach((example) => {
    if (example.id === translationData.id) {
      example.saved = translationData.saved;
    }
  });
};

const loadCurrentTranslation = () => {
  // Try to get translation from router state first (temporary data)
  const routerState = history.state as any;
  if (routerState?.translationData) {
    currentTranslation.value = routerState.translationData;
    loadExamples();
    return;
  }

  // Fallback to localStorage if no router state (direct navigation)
  // In this case, we don't know the toggle state, so don't load examples
  examples.value = [];
  loadingExamples.value = false;
};

const loadExamples = async () => {
  if (!currentTranslation.value) return;

  // Check if examples should be generated for this translation
  const routerState = history.state as any;
  const shouldGenerateExamples = routerState?.translationContext?.generateExamples;
  
  console.log('Should generate examples:', shouldGenerateExamples);
  console.log('Translation context:', routerState?.translationContext);

  // If examples are disabled, don't load any
  if (shouldGenerateExamples === false) {
    examples.value = [];
    loadingExamples.value = false;
    return;
  }

  // Generate examples for the current translation
  loadingExamples.value = true;
  
  try {
    const generatedExamples = await translationService.generateExamplesForTranslation(
      currentTranslation.value as TranslationData
    );
    examples.value = generatedExamples;
  } catch (error) {
    console.error('Failed to generate examples:', error);
    examples.value = [];
  } finally {
    loadingExamples.value = false;
  }
};


onMounted(() => {
  // Load the current translation and its examples
  loadCurrentTranslation();
});
</script>
