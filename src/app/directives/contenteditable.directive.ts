/*
 * Copyright 2018 Thomas Winkler
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {Directive, ElementRef, Input, Output, EventEmitter, SimpleChanges, HostListener} from '@angular/core';

@Directive({
  selector: '[appContenteditable]',
})

export class ContenteditableDirective{
  private lastViewModel: string;

  @HostListener('keyup') onKeyup() {
    const value = this.elRef.nativeElement.innerText;
    this.lastViewModel = value;
    this.update.emit(value);
    console.log('value', value);

  }
  @Input('contenteditableModel') model: string;
  @Output('contenteditableModelChange') update = new EventEmitter();

  constructor(private elRef: ElementRef) {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['model'] && changes['model'].currentValue !== this.lastViewModel) {
      this.lastViewModel = this.model;
      this.refreshView();
    }
  }

  private refreshView() {
    this.elRef.nativeElement.innerText = this.model;
  }
}
