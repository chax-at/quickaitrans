import { Axios } from 'axios';
import 'dotenv/config';

export interface IAIClientChatCompletionOptions {
  /**
   * The messages to send
   */
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
    name?: string;
  }>;

  /**
   * The Model should stop generating once this sequence is generated.
   * E.g. useful to include a stop sequence as an instruction in your prompt and then add this sequence here.
   * You can provide a maximum of 4 stop sequence.
   */
  stop?: string | string[];

  /**
   * Maximum amount of tokens to generate. Default 16.
   * Estimate how big of a response you expect, add some leeway and make use of stop sequences to cut the response as short as possible.
   */
  maxTokens?: number;
}

export type OpenAIAzureClientConfig = {
  /**
   * Host of the API
   */
  host?: string;

  /**
   * API Key
   */
  apiKey?: string;

  /**
   * Deployment Name (=/= the model name, but the ID of the deployment made for that model)
   */
  deployment?: string;

  /**
   * The API version.
   * See your API's documentation to see what versions are supported.
   */
  version?: string;
};

const config: OpenAIAzureClientConfig = {
  apiKey: process.env.AI_API_KEY,
  deployment: process.env.AI_DEPLOYMENT,
  host: process.env.AI_HOST,
  version: process.env.AI_API_VERSION,
};

if (config.apiKey == null || config.deployment == null || config.host == null || config.version == null) {
  console.log('No AI Config present, you can use these keys in your .env file:');
  console.log(`
  AI_API_KEY=
  AI_DEPLOYMENT=
  AI_HOST=
  AI_API_VERSION=
`);
  process.exit(-1);
}

const axios = new Axios({
  responseType: 'json',
  baseURL: config.host,
  headers: {
    'api-key': config.apiKey,
    'Content-Type': 'application/json',
  },
});

export async function askChatGpt(options: IAIClientChatCompletionOptions): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const response = await axios.post(
      `/openai/deployments/${config.deployment}/chat/completions?api-version=${config.version}`,
      JSON.stringify({
        messages: options.messages,
        max_tokens: options.maxTokens,
        stop: options.stop,
      })
    );

    if (response.status !== 200) {
      console.warn('GPT API Error:', response.status, response.statusText, response.data);
      if (response.status === 429) {
        await new Promise((res) => setTimeout(res, 10000));
      } else {
        throw new Error('Bad API Response');
      }
    } else {
      return response.data;
    }
  }
  throw new Error('Bad API Response');
}
