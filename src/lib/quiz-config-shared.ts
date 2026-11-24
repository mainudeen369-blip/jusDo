export interface QuizConfig {
  questionsPerRound: number;
  secondsPerQuestion: number;
}

export const DEFAULT_QUIZ_CONFIG: QuizConfig = {
  questionsPerRound: 5,
  secondsPerQuestion: 5,
};
