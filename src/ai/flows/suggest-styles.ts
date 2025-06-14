// This file holds the Genkit flow for suggesting styling options for text.

'use server';

/**
 * @fileOverview An AI agent that suggests styling options (font, size, weight, color) for selected text.
 *
 * - suggestStyles - A function that suggests styling options for a given text input.
 * - SuggestStylesInput - The input type for the suggestStyles function.
 * - SuggestStylesOutput - The return type for the suggestStyles function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestStylesInputSchema = z.object({
  text: z.string().describe('The text for which to suggest styling options.'),
  context: z.string().describe('The context of the text (e.g., a title, a paragraph, a quote).').optional(),
});
export type SuggestStylesInput = z.infer<typeof SuggestStylesInputSchema>;

const SuggestStylesOutputSchema = z.object({
  fontFamily: z.string().describe('The suggested font family.'),
  fontSize: z.string().describe('The suggested font size (e.g., 12px, 1.2em).'),
  fontWeight: z.string().describe('The suggested font weight (e.g., normal, bold, 600).'),
  color: z.string().describe('The suggested text color (e.g., #333, rgba(0, 0, 0, 0.8)).'),
  emphasis: z.string().describe('The reason for the suggested styling, whether it is for emphasis, or visual appeal')
});
export type SuggestStylesOutput = z.infer<typeof SuggestStylesOutputSchema>;

export async function suggestStyles(input: SuggestStylesInput): Promise<SuggestStylesOutput> {
  return suggestStylesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestStylesPrompt',
  input: {schema: SuggestStylesInputSchema},
  output: {schema: SuggestStylesOutputSchema},
  prompt: `You are a design expert who knows what styles look great for different kinds of text.

  Given the following text and its context, suggest styling options to improve its visual appeal and emphasis.

  Text: {{{text}}}
  Context: {{{context}}}

  Consider the context of the text when making your suggestions. For example, if the text is a title, you might suggest a larger font size and a bold font weight. If the text is a quote, you might suggest an italic font style and a different font family.

  Respond using JSON format.
  `,
});

const suggestStylesFlow = ai.defineFlow(
  {
    name: 'suggestStylesFlow',
    inputSchema: SuggestStylesInputSchema,
    outputSchema: SuggestStylesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
