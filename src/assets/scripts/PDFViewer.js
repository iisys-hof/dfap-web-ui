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

var canvas;
var context;
var viewport;

var pdfFile;
var currPageNumber = 6;

var openNameDest = function(name) {

  pdfFile.getDestinations().then(function(s) {
    console.log(s);
  });
  pdfFile.getDestination("Test3").then(function(s){
    console.log("s0", s[0]);
    pdfFile.getPageIndex(s[0]).then(function(x) {
      console.log("index", x);
    });

  });
  pdfFile.getOutline().then(function(s) {
    console.log(s);
  });

};

var openNextPage = function() {
  var pageNumber = Math.min(pdfFile.numPages, currPageNumber + 1);
  if (pageNumber !== currPageNumber) {
    currPageNumber = pageNumber;
    openPage(pdfFile, currPageNumber);
  }
};

var openPrevPage = function() {
  var pageNumber = Math.max(1, currPageNumber - 1);
  if (pageNumber !== currPageNumber) {
    currPageNumber = pageNumber;
    openPage(pdfFile, currPageNumber);
  }
};

var openPage = function(pdfFile, pageNumber) {
  pdfFile.getPage(pageNumber).then(function(page) {
    viewport = page.getViewport(canvas.width / page.getViewport(1.0).width);

    var renderContext = {
      canvasContext: context,
      viewport: viewport
    };

    page.render(renderContext);
  });
};

var openPDF = function () {
  canvas = document.getElementById('canvas');
  context = canvas.getContext('2d');
  PDFJS.disableStream = true;
  PDFJS.getDocument('../assets/TestPDF.pdf').then(function(pdf) {
    pdfFile = pdf;

    openPage(pdf, currPageNumber, 1);
  });
}
