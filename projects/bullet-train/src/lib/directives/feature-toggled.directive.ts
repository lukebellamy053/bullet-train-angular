import {Directive, ElementRef, Input, TemplateRef, ViewContainerRef} from '@angular/core';
import {BulletTrainService} from '../services/bullet-train.service';
import {Subscription} from 'rxjs';

@Directive({
	selector: '[featureToggled]'
})
export class FeatureToggledDirective {

	private toggleObservable: Subscription;
	private notEnabledElementRef: TemplateRef<any>;
	private isEnabled: boolean = false;
	private elementAdded: boolean = false;

	constructor(
		private element: ElementRef,
		private templateRef: TemplateRef<any>,
		private viewContainer: ViewContainerRef,
		private btService: BulletTrainService
	) {
	}

	@Input()
	set featureToggled(toggle_key) {
		this.removeListener();
		this.listenForChanges(toggle_key);
	}

	@Input()
	set featureToggledElse(templateRef) {
		this.notEnabledElementRef = templateRef;
		this.redrawElements();
	}

	private redrawElements() {
		this.clearView();
		if (this.isEnabled) {
			this.createView();
		} else {
			this.notEnabled();
		}
	}

	private removeListener() {
		if (this.toggleObservable != null) {
			this.toggleObservable.unsubscribe();
			this.toggleObservable = null;
		}
	}

	private listenForChanges(key: string) {
		this.toggleObservable = this.btService.hasFeature$(key, false).subscribe((enabled) => {
			this.isEnabled = enabled;
			this.redrawElements();
		});
	}

	private createView() {
		if (!this.elementAdded) {
			this.viewContainer.createEmbeddedView(this.templateRef);
			this.elementAdded = true;
		}
	}

	private notEnabled() {
		if (this.notEnabledElementRef) {
			this.viewContainer.createEmbeddedView(this.notEnabledElementRef);
		}
	}

	private clearView() {
		this.viewContainer.clear();
		this.elementAdded = false;
	}

}
