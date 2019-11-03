import { TestBed } from '@angular/core/testing';

import { BulletTrainService } from './bullet-train.service';
import {BulletTrainModule} from '../bullet-train.module';

describe('BulletTrainService', () => {
  beforeEach(() => TestBed.configureTestingModule(BulletTrainModule.forRoot({environmentId: '12345'})));

  it('should be created', () => {
    const service: BulletTrainService = TestBed.get(BulletTrainService);
    expect(service).toBeTruthy();
  });
});
