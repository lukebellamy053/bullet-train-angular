import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {ModuleOptions} from '../interfaces/module-options';
import {IndividualFeatures} from '../interfaces/individual-features';
import {Flag} from '../interfaces/flag';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {Trait} from '../interfaces/trait';
import {distinctUntilChanged, map} from 'rxjs/operators';
import {FeatureToggle} from '../interfaces/feature-toggle';
import {Config} from '../interfaces/config';

@Injectable({
	providedIn: 'root'
})
export class BulletTrainServiceOptions implements ModuleOptions {
	public apiURL?: string;
	public environmentId: string;
}


interface RequestHeaders {
	headers?: HttpHeaders | {
		[header: string]: string | string[];
	};
}

@Injectable({
	providedIn: 'root'
})
export class BulletTrainService {

	private readonly baseURL: string = 'https://api.bullet-train.io/api/v1/';
	private readonly environmentId: string;
	private identifier: string;
	private toggles: Array<FeatureToggle> = [];
	private traits: Array<Trait> = [];
	private flagsUpdated: Subject<Array<Flag>> = new BehaviorSubject([]);
	private traitsUpdated: Subject<Array<Trait>> = new BehaviorSubject([]);

	public get features(): Observable<Array<FeatureToggle>> {
		return this.flagsUpdated
			.asObservable()
			.pipe(map((flags: Array<Flag>) => flags.filter(flag => flag.feature.type == 'FLAG')))
			.pipe(map((flags: Array<Flag>) => {
				return flags.map(flag => <FeatureToggle>{name: flag.feature.name, enabled: flag.enabled})
			}))
			.pipe(distinctUntilChanged());
	}

	public get config(): Observable<Array<Config>> {
		return this.flagsUpdated
			.asObservable()
			.pipe(map((flags: Array<Flag>) => flags.filter(flag => flag.feature.type == 'CONFIG')))
			.pipe(map((flags: Array<Flag>) => {
				return flags.map(flag => <Config>{name: flag.feature.name, value: flag.feature.initial_value})
			}))
			.pipe(distinctUntilChanged());
	}

	public get userTraits(): Observable<Array<Trait>> {
		return this.traitsUpdated
			.asObservable()
			.pipe(distinctUntilChanged());
	}

	/**
	 * Check if the current flags mark the given feature as enabled
	 * @param name
	 * @param defVal
	 */
	public hasFeature(name: string, defVal: boolean): boolean {
		const toggle = this.toggles.filter(toggle => toggle.name == name);
		return toggle.length > 0 ? toggle[0].enabled : defVal;
	}

	public hasFeature$(name: string, defValue: boolean): Observable<boolean> {
		return this.features
			.pipe(
				map((toggles: Array<FeatureToggle>) => toggles.filter(toggle => toggle.name == name)),
				map((toggles) => toggles.length > 0 ? toggles[0] : null),
				map(toggle => toggle ? toggle.enabled : defValue),
				distinctUntilChanged()
			)
	}

	constructor(private http: HttpClient, private options: BulletTrainServiceOptions) {
		this.environmentId = options.environmentId;

		if (options.apiURL) {
			this.baseURL = options.apiURL;
		}

		this.userTraits.subscribe((traits) => {
			this.traits = traits;
		});

		this.features.subscribe((features) => {
			this.toggles = features;
		});

	}

	public set userIdentity(id: string) {
		this.identifier = id;
		this.userUpdated();
	}

	private userUpdated() {
		if (this.identifier) {
			this.fetchFlagsForUser().then((response: IndividualFeatures) => {
				this.flagsUpdated.next(response.flags);
				this.traitsUpdated.next(response.traits);
			});
		} else {
			// Make sure there are no traits set
			this.traitsUpdated.next([]);
			this.fetchFlagsForProject().then((response: Array<Flag>) => {
				this.flagsUpdated.next(response);
			})
		}
	}

	private fetchFlagsForUser() {
		if (!this.identifier) {
			throw new Error('no-identifier-set');
		}
		return this.getData(`identities/?identifier=${this.identifier}`)
	}

	private fetchFlagsForProject() {
		return this.getData(`flags/`)
	}

	private makeUrl(url) {
		return `${this.baseURL}${url}`;
	}

	private makeHeaders(headers: any): RequestHeaders {
		return {
			headers: headers
		}
	}

	private getHeaders() {
		return {
			'x-environment-key': this.environmentId
		}
	}

	private getData(url): Promise<any> {
		return this.http.get(this.makeUrl(url), this.makeHeaders(this.getHeaders())).toPromise()
	}

	private postData(url, body): Promise<any> {
		return this.http.post(this.makeUrl(url), body, this.makeHeaders(this.getHeaders())).toPromise()
	}


}
