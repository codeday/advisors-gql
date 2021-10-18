import { RecommendationRating } from '../enums';

export function recRatingDescription(rating?: RecommendationRating | null): string {
  if (!rating) return 'N/A';
  return {
    [RecommendationRating.INTERN_BELOW]: 'Below intern-level',
    [RecommendationRating.INTERN_MEETS]: 'Intern-level',
    [RecommendationRating.INTERN_EXCEEDS]: 'Above intern-level',
    [RecommendationRating.NEW_GRAD]: 'New-grad hire level',
    [RecommendationRating.NEW_GRAD_EXCEEDS]: 'Exceeds new-grad hire level',
  }[rating];
}
