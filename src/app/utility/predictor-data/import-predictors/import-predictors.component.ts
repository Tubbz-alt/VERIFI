import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { PredictordbService } from 'src/app/indexedDB/predictors-db.service';
import { IdbPredictorEntry, PredictorData } from 'src/app/models/idb';

@Component({
  selector: 'app-import-predictors',
  templateUrl: './import-predictors.component.html',
  styleUrls: ['./import-predictors.component.css']
})
export class ImportPredictorsComponent implements OnInit {
  @Output('emitClose')
  emitClose: EventEmitter<boolean> = new EventEmitter<boolean>();

  importError: string;
  quickView: Array<IdbPredictorEntry> = new Array();
  importArr: Array<IdbPredictorEntry> = new Array();
  missingPredictors: Array<PredictorData> = new Array();
  constructor(private predictorDbService: PredictordbService) { }

  ngOnInit(): void {
  }

  cancel() {
    this.emitClose.emit(true);
  }

  importData(files: FileList) {
    // Clear with each upload
    this.quickView = new Array();
    this.importError = undefined;
    this.importArr = new Array();
    this.missingPredictors = new Array();
    if (files && files.length > 0) {
      let file: File = files.item(0);

      let reader: FileReader = new FileReader();
      reader.readAsText(file);
      reader.onload = (e) => {
        let csv: string = reader.result as string;
        let lines = csv.split("\n");
        let headers: Array<string> = lines[0].replace('\r', '').split(",");

        let facilityPredictors: Array<PredictorData> = this.predictorDbService.facilityPredictors.getValue();
        //find predictors that don't exist
        let predictorNames: Array<string> = facilityPredictors.map(predictor => { return predictor.name });
        let missingPredictorNames: Array<string> = JSON.parse(JSON.stringify(headers)).filter(header => { return (!predictorNames.includes(header) && header != 'date' && header != 'Date') });
        missingPredictorNames.forEach(missingPredictorName => {
          let newPredictor: PredictorData = this.predictorDbService.getNewPredictor();
          newPredictor.name = missingPredictorName;
          this.missingPredictors.push(newPredictor);
        });
        //add predictor entries
        for (var i = 1; i < lines.length - 1; i++) {
          let currentline: Array<any> = lines[i].split(",");
          let newPredictorEntry: IdbPredictorEntry = this.predictorDbService.getNewImportPredictorEntry(headers, currentline, this.missingPredictors);
          // Read csv and push to obj array.
          this.importArr.push(newPredictorEntry);
          // Push the first 3 results to a quick view array
          if (i < 4) {
            this.quickView.push(newPredictorEntry);
          }
        }
      }
    }
  }

  addPredictors() {
    //add missing predictors
    this.missingPredictors.forEach(predictor => {
      this.predictorDbService.importNewPredictor(predictor);
    });
    //add predictor entries
    this.importArr.forEach(predictorEntry => {
      this.predictorDbService.add(predictorEntry);
    });
    this.cancel();
  }
}


