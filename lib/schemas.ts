import { z } from "zod";
// Schema for individual question
export const questionSchema = z.object({
  title: z.string(), // Quiz title
  question: z.string(), // The question in HTML format
  options: z
    .array(z.string())
    .describe(
      "Four possible answers to the question. Only one should be correct. They should all be of equal lengths."
    ),
  answer: z
    .enum(["A", "B", "C", "D"]) // Correct answer option
    .describe(
      "The correct answer, where A is the first option, B is the second, and so on."
    ),
  explanation: z.string(), // Explanation in HTML format
  type: z.string().describe("The question type (e.g., multiple choice)."), // Question type
});

// Type for individual question
export type Question = z.infer<typeof questionSchema>;

// Schema for the entire quiz (array of questions)
export const questionsSchema = z.array(questionSchema);

