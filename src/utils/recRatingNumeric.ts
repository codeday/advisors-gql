import { RecommendationRating } from '../enums';

export function recRatingNumeric(rating?: RecommendationRating | null): number | null {
  if (!rating) return null;
  return {
    [RecommendationRating.INTERN_BELOW]: 0,
    [RecommendationRating.INTERN_MEETS]: 0.5,
    [RecommendationRating.INTERN_EXCEEDS]: 0.8,
    [RecommendationRating.NEW_GRAD]: 1,
    [RecommendationRating.NEW_GRAD_EXCEEDS]: 1.1,
  }[rating];
}
