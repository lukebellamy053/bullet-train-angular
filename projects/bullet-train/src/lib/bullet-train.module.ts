import {InjectionToken, NgModule} from '@angular/core';
import {HttpClientModule} from '@angular/common/http';
import {BulletTrainServiceOptions} from './services/bullet-train.service';
import {ModuleOptions} from './interfaces/module-options';
import {CommonModule} from '@angular/common';
import { FeatureToggledDirective } from './directives/feature-toggled.directive';
import { ToggleWrapperComponent } from './components/toggle-wrapper/toggle-wrapper.component';

@NgModule({
	declarations: [FeatureToggledDirective, ToggleWrapperComponent],
	imports: [
		CommonModule
	],
	exports: [FeatureToggledDirective, ToggleWrapperComponent]
})
export class BulletTrainModule {

	static forRoot(options: ModuleOptions) {
		return {
			ngModule: BulletTrainModule,
			providers: [
				{
					provide: FOR_ROOT_OPTIONS_TOKEN,
					useValue: options
				},
				{
					provide: BulletTrainServiceOptions,
					useFactory: provideServiceOptions,
					deps: [FOR_ROOT_OPTIONS_TOKEN]
				}
			],
			imports: [
				HttpClientModule
			]
		}
	}

}



export var FOR_ROOT_OPTIONS_TOKEN = new InjectionToken<ModuleOptions>('forRoot() BulletTrain configuration.');

export function provideServiceOptions(options: ModuleOptions): BulletTrainServiceOptions {
	const bulletTrainServiceOptions = new BulletTrainServiceOptions();
	bulletTrainServiceOptions.environmentId = options.environmentId;
	return (bulletTrainServiceOptions);
}
