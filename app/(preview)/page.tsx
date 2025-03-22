"use client";

import { useEffect, useState } from "react";
import { Question, questionsSchema } from "@/lib/schemas";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Quiz from "@/components/quiz";
import Papa from "papaparse";

interface QuizData {
  "Quiz title": string;
  "HTML of the question": string;
  Answer: string;
  Options: string;
  "HTML of the explanation": string;
  "Question Type": string;
}

export default function Files() {
  const [files, setFiles] = useState<File[]>([]);
  const [questions, setQuestions] = useState<z.infer<typeof questionsSchema>>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [csvChecked, setCsvChecked] = useState(false);

  const [quizTitles, setQuizTitles] = useState<string[]>([]);
  const [selectedTitles, setSelectedTitles] = useState<string[]>([]);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [numberOfQuestions, setNumberOfQuestions] = useState(1);
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [shuffleAnswers, setShuffleAnswers] = useState(true);
  const [showAnswer, setShowAnswer] = useState(true);
  const [quizReady, setQuizReady] = useState(false); // Track quiz rendering
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);

  useEffect(() => {
    setSelectedTitles(quizTitles); // Set all titles as selected on mount
  }, [quizTitles]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter(
      (file) => file.type === "text/csv" && file.size <= 5 * 1024 * 1024
    );

    if (validFiles.length !== selectedFiles.length) {
      toast.error("Only CSV files under 5MB are allowed.");
    }

    setFiles(validFiles);
    setCsvChecked(false);
  };

  const parseCSV = (file: File) => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        complete: (result) => resolve(result.data),
        error: (error) => reject(error),
        header: true,
      });
    });
  };

  const clearCSV = () => {
    setFiles([]);
    setQuestions([]);
    setIsLoading(false);
    setSelectedTitles([]);
    setCsvChecked(false);
    setQuizTitles([]);
    setQuizReady(false);
  };

  const handleCheckCSV = async (file: File) => {
    setIsLoading(true);
    setCsvChecked(false);

    const parsedData = (await parseCSV(file)) as QuizData[];
    const formattedQuestions = parsedData
      .map((row: any) => {
        const title = row["Quiz title"]?.trim();
        const question = row["HTML of the question"]?.trim();
        const answer = row["Answer"]?.trim();
        const options = row["Options, separated by |"]
          ?.match(/(?:\\.|[^|])+/g) // Splits by "|" only if it is NOT escaped
          ?.map((option: string) => option.replace(/\\\|/g, "|").trim()); // Remove "\" before "|"
        const explanation =
          row["HTML of the explanation to the answer"]?.trim();
        const type = row["Question type"]?.trim();

        // Return null if required fields are missing
        if (
          !title ||
          !question ||
          !answer ||
          !options ||
          !explanation ||
          !type
        ) {
          return null;
        }

        return {
          title,
          question,
          answer,
          options,
          explanation,
          type,
        };
      })
      .filter((question) => question !== null); // Filter out null values
    // Assuming setQuizTitles expects an array of strings
    const uniqueTitles = [
      ...new Set(
        (formattedQuestions as { title: string }[]).map((q) => q.title)
      ),
    ];

    setQuizTitles(uniqueTitles);
    setIsLoading(false);

    if (formattedQuestions.length === 0) {
      toast.error(
        "No questions found in the CSV. The format might be incorrect. Please check again or use our template."
      );
    } else {
      toast.success(
        `CSV checked: ${formattedQuestions.length} question(s) found.`
      );
      setQuestions(
        formattedQuestions as {
          title: string;
          question: string;
          options: string[];
          type: string;
          answer: string;
          explanation: string;
        }[]
      );
      setShowSettingsDialog(true);
    }
  };

  const handleCheckCSVClick = async () => {
    if (files.length === 0) {
      // Use the template file if no file is selected
      const response = await fetch("/template.csv");
      const fileBlob = await response.blob();
      const file = new File([fileBlob], "template.csv", { type: "text/csv" });
      handleCheckCSV(file);
    } else {
      handleCheckCSV(files[0]);
    }
  };

  const handleGenerateQuiz = () => {
    const filteredQuestions = questions.filter((q) =>
      selectedTitles.includes(q.title)
    );

    if (filteredQuestions.length === 0) {
      toast.error(
        "No questions selected. Please check at least one quiz title."
      );
      return; // Do not close the settings dialog
    }

    // Apply settings and pass the questions and settings to the Quiz component
    const randomizedQuestions = [...filteredQuestions];

    if (shuffleQuestions) {
      randomizedQuestions.sort(() => Math.random() - 0.5);
    }
    if (shuffleAnswers) {
      randomizedQuestions.forEach((question) => {
        const correctAnswerIndex = ["A", "B", "C", "D"].indexOf(
          question.answer
        );
        const shuffledOptions = [...question.options].sort(
          () => Math.random() - 0.5
        );
        const newCorrectAnswerIndex = shuffledOptions.indexOf(
          question.options[correctAnswerIndex]
        );
        question.options = shuffledOptions;
        question.answer = ["A", "B", "C", "D"][newCorrectAnswerIndex];
      });
    }

    const selectedQuestions = randomizedQuestions.slice(0, numberOfQuestions);

    setSelectedQuestions(selectedQuestions);
    setQuizReady(true);
    setShowSettingsDialog(false); // Close only if questions are selected
  };
  if (quizReady) {
    return (
      <Quiz
        questions={selectedQuestions}
        clearCSV={clearCSV}
        showAnswer={showAnswer}
      />
    );
  }

  return (
    <div className="min-h-[100dvh] w-full flex justify-center">
      <Card className="w-full max-w-4xl h-full border-0 sm:border sm:h-fit mt-12 p-6 shadow-lg rounded-lg">
        <CardHeader className="text-center space-y-4">
          <CardTitle className="text-2xl font-bold">
            📂 Quiz Generator
          </CardTitle>
          <CardDescription>
            Upload a CSV to generate an interactive quiz.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 p-4 rounded-lg text-left text-sm text-gray-700">
            <p className="font-semibold mb-2">📌 Expected CSV Format:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <b>Quiz title:</b> The title of the quiz.
              </li>
              <li>
                <b>HTML of the question:</b> The question text, possibly with
                HTML formatting.
              </li>
              <li>
                <b>Options (separated by |):</b> Possible answer choices. If
                there is a "|" inside the options, add a "\" before the
                character to escape it.
              </li>
              <li>
                <b>Answer:</b> The correct answer.
              </li>
              <li>
                <b>HTML of the explanation:</b> A detailed explanation of the
                correct answer.
              </li>
              <li>
                <b>Question type:</b> Type of question (mc14 for 1 of 4 multiple
                choices).
              </li>
            </ul>
          </div>
          <div className="text-center text-sm text-gray-200 mt-6">
            You may also try our template with basic maths and English
            questions.
          </div>
          <div className="mt-4">
            <a
              href="/template.csv"
              download
              className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-all text-center block"
            >
              📥 Download Template
            </a>
          </div>
          <form className="space-y-4 mt-4">
            <label className="block">
              <input
                type="file"
                onChange={handleFileChange}
                accept=".csv"
                className="w-full p-2 border rounded-lg focus:ring focus:ring-blue-300"
              />
            </label>
            <Button
              type="button"
              className="w-full bg-blue-600 text-white hover:bg-blue-700 transition-all"
              onClick={handleCheckCSVClick}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                `Analyse ${files.length > 0 ? files[0].name : "template.csv"}`
              )}
            </Button>
          </form>
        </CardContent>
        {isLoading && (
          <CardFooter>
            <Progress value={50} className="h-2 bg-blue-300" />
          </CardFooter>
        )}
      </Card>
      {showSettingsDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-10">
          <Card className="w-128 p-6 bg-white rounded-lg shadow-xl max-h-[80vh] overflow-y-scroll">
            <CardTitle className="text-2xl mb-4 text-black">
              Quiz Settings
            </CardTitle>
            <div className="space-y-4 text-gray-900">
              <div>
                <label className="block">Number of Questions</label>
                <input
                  type="range"
                  min="1"
                  max={questions.length}
                  value={numberOfQuestions}
                  onChange={(e) => setNumberOfQuestions(Number(e.target.value))}
                  className="w-full"
                />
                <span>{numberOfQuestions} questions</span>
              </div>
              <div>
                <input
                  type="checkbox"
                  checked={shuffleQuestions}
                  onChange={() => setShuffleQuestions(!shuffleQuestions)}
                  className="mr-2"
                />
                Shuffle questions
              </div>
              <div>
                <input
                  type="checkbox"
                  checked={shuffleAnswers}
                  onChange={() => setShuffleAnswers(!shuffleAnswers)}
                  className="mr-2"
                />
                Shuffle answer options
              </div>
              <div>
                <input
                  type="checkbox"
                  checked={showAnswer}
                  onChange={() => setShowAnswer(!showAnswer)}
                  className="mr-2"
                />
                Show answer and explanation after each question
              </div>
              <h3 className="text-lg font-bold">Select Quizzes</h3>
              <div className="flex space-x-2 mb-2">
                <Button
                  onClick={() => setSelectedTitles(quizTitles)}
                  className="bg-blue-500 text-white px-2 py-1 rounded"
                >
                  Select All
                </Button>
                <Button
                  onClick={() => setSelectedTitles([])}
                  className="bg-gray-500 text-white px-2 py-1 rounded"
                >
                  Unselect All
                </Button>
              </div>
              {quizTitles.map((title) => (
                <div key={title} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedTitles.includes(title)}
                    onChange={() =>
                      setSelectedTitles((prev) =>
                        prev.includes(title)
                          ? prev.filter((t) => t !== title)
                          : [...prev, title]
                      )
                    }
                    className="mr-2"
                  />
                  {title}
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-between">
              <Button
                onClick={() => setShowSettingsDialog(false)}
                variant="secondary"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowSettingsDialog(false);
                  handleGenerateQuiz(); // Generate quiz after settings
                }}
              >
                Apply & Start Quiz
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
