import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  RefreshCw,
  FileText,
} from "lucide-react";
import QuizScore from "./score";
import QuizReview from "./quiz-overview";
import { Question } from "@/lib/schemas";

type QuizProps = {
  questions: Question[];
  clearCSV: () => void;
  showAnswer: boolean;
};

const QuestionCard: React.FC<{
  question: Question;
  selectedAnswer: string | null;
  onSelectAnswer: (answer: string) => void;
  isChecked: boolean;
}> = ({ question, selectedAnswer, onSelectAnswer, isChecked }) => {
  const answerLabels = ["A", "B", "C", "D"];

  return (
    <div className="space-y-6">
      <h2
        className="text-lg font-semibold leading-tight"
        dangerouslySetInnerHTML={{ __html: question.question }}
      />
      <div className="grid grid-cols-1 gap-4">
        {question.options.map((option, index) => {
          const isCorrect = answerLabels[index] === question.answer;
          const isSelected = selectedAnswer === answerLabels[index];

          return (
            <Button
              key={index}
              variant={isSelected ? "secondary" : "outline"}
              className={`h-auto py-6 px-4 justify-start text-left whitespace-normal ${
                isChecked && isCorrect ? "bg-green-600 hover:bg-green-700" : ""
              } ${
                isChecked && isSelected && !isCorrect
                  ? "bg-red-600 hover:bg-red-700"
                  : ""
              }`}
              onClick={() => onSelectAnswer(answerLabels[index])}
              disabled={isChecked} // Disable selection after checking
            >
              <span className="text-lg font-medium mr-4 shrink-0">
                {answerLabels[index]}
              </span>
              <span className="flex-grow">{option}</span>

              {isChecked && isCorrect && (
                <Check className="ml-2 text-white" size={20} />
              )}
              {isChecked && isSelected && !isCorrect && (
                <X className="ml-2 text-white" size={20} />
              )}
            </Button>
          );
        })}
      </div>
      {isChecked && (
        <div className="mt-4 p-4 border border-gray-300 rounded bg-gray-100">
          <h3 className="font-semibold text-lg text-gray-700">Explanation:</h3>
          <p
            className="text-gray-600"
            dangerouslySetInnerHTML={{ __html: question.explanation }}
          />
        </div>
      )}
    </div>
  );
};

export default function Quiz({ questions, clearCSV, showAnswer }: QuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>(
    Array(questions.length).fill(null)
  );
  const [isChecked, setIsChecked] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress((currentQuestionIndex / questions.length) * 100);
  }, [currentQuestionIndex, questions.length]);

  const handleSelectAnswer = (answer: string) => {
    if (!isChecked) {
      const newAnswers = [...answers];
      newAnswers[currentQuestionIndex] = answer;
      setAnswers(newAnswers);
    }
  };

  const handleCheckAnswer = () => {
    setIsChecked(true);
  };

  const handleNextQuestion = () => {
    if (!isChecked) {
      handleCheckAnswer();
    } else {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setIsChecked(false);
      } else {
        handleSubmit();
      }
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setIsChecked(false);
    }
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    const correctAnswers = questions.reduce((acc, question, index) => {
      return acc + (question.answer === answers[index] ? 1 : 0);
    }, 0);
    setScore(correctAnswers);
  };

  const handleReset = () => {
    setAnswers(Array(questions.length).fill(null));
    setIsChecked(false);
    setIsSubmitted(false);
    setScore(null);
    setCurrentQuestionIndex(0);
    setProgress(0);
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {!isSubmitted && (
          <>
            <h1 className="text-3xl font-bold mb-8 text-center text-foreground">
              Question {currentQuestionIndex + 1}: {currentQuestion.title}
            </h1>
            <div className="text-center mb-4">
              {currentQuestion.type === "mc14" && (
                <div>Choose 1 answer from the available options</div>
              )}
            </div>
          </>
        )}

        <div className="relative">
          {!isSubmitted && <Progress value={progress} className="h-1 mb-8" />}
          <div className="min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={isSubmitted ? "results" : currentQuestionIndex}
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {!isSubmitted ? (
                  <div className="space-y-8">
                    <QuestionCard
                      question={currentQuestion}
                      selectedAnswer={answers[currentQuestionIndex]}
                      onSelectAnswer={handleSelectAnswer}
                      isChecked={isChecked}
                    />
                    <div className="flex justify-between items-center pt-4">
                      <Button
                        onClick={handlePreviousQuestion}
                        disabled={currentQuestionIndex === 0}
                        variant="ghost"
                      >
                        <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                      </Button>
                      <span className="text-sm font-medium">
                        {currentQuestionIndex + 1} / {questions.length}
                      </span>
                      <Button
                        onClick={handleNextQuestion}
                        disabled={answers[currentQuestionIndex] === null}
                        variant="ghost"
                      >
                        {isChecked
                          ? currentQuestionIndex === questions.length - 1
                            ? "Submit"
                            : "Next"
                          : "Check Answer"}
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <QuizScore
                    correctAnswers={score ?? 0}
                    totalQuestions={questions.length}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
