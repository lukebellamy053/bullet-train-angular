import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-toggle-wrapper',
  templateUrl: './toggle-wrapper.component.html',
  styleUrls: ['./toggle-wrapper.component.scss']
})
export class ToggleWrapperComponent implements OnInit {

  @Input() toggleName: string;

  constructor() { }

  ngOnInit() {
  }

}
