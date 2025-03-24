import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface QuizScoreProps {
  correctAnswers: number;
  totalQuestions: number;
}

export default function QuizScore({
  correctAnswers,
  totalQuestions,
}: QuizScoreProps) {
  const score = (correctAnswers / totalQuestions) * 100;
  const roundedScore = Math.round(score);

  const getMessage = () => {
    if (roundedScore === 100) return "Perfect score! Congratulations!";
    if (roundedScore >= 80) return "Great job! You did excellently!";
    if (roundedScore >= 60) return "Good effort! You're on the right track.";
    if (roundedScore >= 40) return "Not bad, but there's room for improvement.";
    return "Keep practicing, you'll get better!";
  };

  return (
    <Card className="w-full">
      <CardContent className="space-y-4 p-8">
        <div className="text-center">
          <p className="text-4xl font-bold">{roundedScore}%</p>
          <p className="text-sm text-muted-foreground">
            {correctAnswers} out of {totalQuestions} correct
          </p>
        </div>
        <p className="text-center font-medium">{getMessage()}</p>
      </CardContent>
    </Card>
  );
}
