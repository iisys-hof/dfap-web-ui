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

import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DocumentFolder} from '../models/DocumentFolder';
import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'orderByPipe'})
export class OrderByPipe implements PipeTransform{

  transform(array: Array<string>, args: string): Array<string> {

    if (!array || array === undefined || array.length === 0) {
      return null;
    }

    array.sort((a: any, b: any) => {
      if (a.title < b.title) {
        return -1;
      } else if (a.title > b.title) {
        return 1;
      } else {
        return 0;
      }
    });
    return array;
  }

}
@Component({
  selector: 'app-tree-view',
  templateUrl: './tree-view.component.html',
  styleUrls: ['./tree-view.component.scss']
})
export class TreeViewComponent implements OnInit {

  constructor() { }
  @Input() treeData;
  public isCollapsed = false;
  ngOnInit() {
  }

  @Output() onFolderClicked = new EventEmitter<DocumentFolder>();
  @Output() onFileClicked = new EventEmitter<string>();

  folderClicked(node: DocumentFolder) {
    this.onFolderClicked.emit(node);
  }
}
