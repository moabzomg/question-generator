"use client";

import { useEffect, useState } from "react";
import { questionsSchema } from "@/lib/schemas";
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

export default function Files() {
  const [files, setFiles] = useState<File[]>([]);
  const [questions, setQuestions] = useState<z.infer<typeof questionsSchema>>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [csvChecked, setCsvChecked] = useState(false);

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
    setCsvChecked(false);
  };

  if (questions.length !== 0) {
    return <Quiz title="Quiz" questions={questions} clearCSV={clearCSV} />;
  }

  const handleCheckCSV = async (file: File) => {
    setIsLoading(true);
    setCsvChecked(false);

    const parsedData = await parseCSV(file);
    const formattedQuestions = parsedData
      .map((row: any) => {
        const title = row["Quiz title"]?.trim();
        const question = row["HTML of the question"]?.trim();
        const answer = row["Answer"]?.trim();
        const options = row["Options, separated by |"]
          ?.split("|")
          .map((option) => option.trim());
        const explanation =
          row["HTML of the explanation to the answer"]?.trim();
        const type = row["Question type"]?.trim();

        if (
          !title ||
          !question ||
          !answer ||
          !options ||
          options.length !== 4 ||
          !explanation ||
          !type
        ) {
          return null; // Skip invalid questions
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
      .filter(Boolean); // Remove null values

    setIsLoading(false);

    if (formattedQuestions.length === 0) {
      toast.error(
        "No questions found in the CSV. The format might be incorrect. Please check again or use our template."
      );
    } else {
      toast.success(
        `CSV checked: ${formattedQuestions.length} question(s) found.`
      );
      setQuestions(formattedQuestions);
      setCsvChecked(true);
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

  return (
    <div className="min-h-[100dvh] w-full flex justify-center">
      <Card className="w-full max-w-md h-full border-0 sm:border sm:h-fit mt-12 p-6 shadow-lg rounded-lg">
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
                <b>Options (separated by |):</b> Four possible answer choices.
              </li>
              <li>
                <b>Answer:</b> The correct answer (A, B, C, or D).
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
    </div>
  );
}
