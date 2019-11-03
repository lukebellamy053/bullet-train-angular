import {Feature} from './feature';

export interface Flag {
	enabled: boolean;
	environment: number;
	feature: Feature;
	feature_segment: any;
	feature_state_value: any;
	id: number;
	identity: number;
}