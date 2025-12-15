import {TrackObject} from "./TrackObject"; 
import {RecommendationSeedObject} from "./RecommendationSeedObject"; 
export type RecommendationsObject = {
seeds: RecommendationSeedObject[];
tracks: TrackObject[];
};