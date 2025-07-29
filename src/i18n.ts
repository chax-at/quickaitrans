import { askChatGpt } from './AiHelper';

export type TranslationRecord = { [key: string]: string | TranslationRecord };
export type TranslationMap = Map<string, TranslationMap | string>;

export interface ILanguageOptions {
  baseLanguageCode: string;
  desiredLanguageCode: string;
}

export async function translate({
  source,
  sourceLanguage,
  destinationLanguage,
  breadcrumbs = [],
  appInfo = '',
}: {
  source: TranslationRecord;
  sourceLanguage: string;
  destinationLanguage: string;
  breadcrumbs?: Array<string>;
  appInfo?: string;
}): Promise<TranslationRecord> {
  let innerTranslation: TranslationRecord = {};
  const maxChunkSize = 4000;
  let currentChunk: TranslationRecord = {};
  let currentChunkSize = 0;

  async function handleChunk(): Promise<void> {
    console.log('- handling chunk');
    if (currentChunkSize === 0) {
      return;
    }
    try {
      const prompt = decorateWithPrompt(JSON.stringify(currentChunk), 'JSON', sourceLanguage, destinationLanguage, appInfo);
      const chatGptAnswer = await askChatGpt({
        maxTokens: 4000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });
      // const chatGptAnswer = JSON.stringify(currentChunk);
      const gptObject = JSON.parse(chatGptAnswer).choices[0].message.content;
      innerTranslation = { ...innerTranslation, ...JSON.parse(gptObject.replace(/```json/g, '').replace(/```/g, '')) };
    } catch (e) {
      console.error('Parse Error', e);
    }
    currentChunk = {};
    currentChunkSize = 0;
  }

  for (const [innerKey, innerContent] of Object.entries(source)) {
    if (breadcrumbs.length === 0) {
      console.log('Parsing', innerKey);
    }
    // console.log(breadcrumbs.join('->'), ':', innerKey);
    // console.group(innerKey);
    // console.log('Size:', JSON.stringify(innerContent).length);
    const innerContentSize = JSON.stringify(innerContent).length;
    if (innerContentSize > maxChunkSize) {
      // Here it gets compilcated, the current item is way too big
      // Process the current chunk
      await handleChunk();
      // If it is a translation we skip it ... why would there be such a long text?
      if (typeof innerContent == 'string') {
        console.error('Value of', innerKey, 'exceeds limit!');
        innerTranslation[innerKey] = innerContent;
      } else {
        // It it is an Object, we have to disect it otherwise
        innerTranslation = {
          ...innerTranslation,
          [innerKey]: await translate({
            source: innerContent,
            sourceLanguage,
            destinationLanguage,
            breadcrumbs: [...breadcrumbs, innerKey],
          }),
        };
      }
      continue;
    }
    if (currentChunkSize + innerContentSize < maxChunkSize) {
      currentChunkSize += innerContentSize;
      currentChunk[innerKey] = innerContent;
      console.groupEnd();
      continue;
    }
    await handleChunk();
    currentChunkSize += innerContentSize;
    currentChunk[innerKey] = innerContent;
  }
  await handleChunk();

  return innerTranslation;
}

function decorateWithPrompt(
  content: string,
  format: string,
  baseLanguageCode: string,
  desiredLanguageCode: string,
  appInfo?: string
): string {
  return `You are now a translator for an app."\n
${appInfo ? `${appInfo}\n` : ''}
\n
Please translate this ${format} from "${baseLanguageCode}" to "${desiredLanguageCode}":\n\`\`\`\n${content}\n\`\`\`\nOnly type the result itself.\nDo not translate the keys.`;
}
