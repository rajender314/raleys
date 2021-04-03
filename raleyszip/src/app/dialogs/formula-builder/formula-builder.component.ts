import { Component, OnInit, ViewChild, Input, ElementRef } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  FormControl
} from '@angular/forms';
import { SettingsService } from '@app/settings/settings.service';
import * as _ from 'lodash';
import { SnackbarComponent } from '@app/shared/component/snackbar/snackbar.component';

@Component({
  selector: 'app-formula-builder',
  templateUrl: './formula-builder.component.html',
  styleUrls: ['./formula-builder.component.scss']
})
export class FormulaBuilderComponent implements OnInit {
  public specsList = [];
  public mainFormula: any;
  public editFormula: any;
  public previouslyFormulaBuilder: any;
  public filteredSpecList = [];
  public submitted = false;
  public formValid = false;
  public hideActionButtons = true;
  public formulaBuilderForm: FormGroup;

  @Input('data') data;
  public selectedFormulaBuilderLabels: any; // holds formula builder info.

  public basicOperands = []; // label is formControl here and type is  to recognize the type of field.
  public basicOpertors = [
    { id: 'add', name: 'Addition ( + )', symbol: '+' },
    { id: 'mul', name: 'Multiplication ( * )', symbol: '*' },
    { id: 'sub', name: 'Subtraction ( - )', symbol: '-' },
    { id: 'divi', name: 'Division ( / )', symbol: '/' }
  ];

  public resultSpecType = new FormControl();

  public existingFormulas = [];
  public editMode = false;

  public params = {
    form_type: 2,
    pageNumber: 1,
    // pageSize: 20,
    search: '',
    sort: 'asc'
  };

  public search = {
    placeHolder: '',
    value: ''
  };

  public rowData = [];

  public showSpinner: boolean;
  @ViewChild('searchingBox') searchingBox: ElementRef;

  constructor(
    public fb: FormBuilder,
    public settingsService: SettingsService,
    private snackbar: MatSnackBar
  ) {}

  ngOnInit() {
    this.search.placeHolder = 'Search ';
    this.showSpinner = true;
    this.rowData = this.data;
    if (this.rowData.length) {
      this.selectedFormulaBuilderLabels = this.rowData[0];
      this.getExistingFormulas();
    } else {
      this.showSpinner = false;
    }
  }

  getExistingFormulas() {
    this.settingsService
      .sendOuput('getFormulas', {
        form_id: this.selectedFormulaBuilderLabels.id
      })
      .then(res => {
        if (res.result.success) {
          this.existingFormulas = res.result.data;
          if (this.existingFormulas.length) {
            this.editFormula = this.existingFormulas[0];
            this.configInitialSteps();
            this.editMode = true;
          } else {
            this.editFormula = null;
            this.editMode = false;
            this.existingFormulas = [];
            this.configInitialSteps();
          }
        }
      });
  }

  getSelectedFormulaBuilder(data) {
    if (
      this.previouslyFormulaBuilder &&
      this.previouslyFormulaBuilder.id === data.id
    ) {
      return;
    } else {
      this.previouslyFormulaBuilder = data;
      this.selectedFormulaBuilderLabels = data;
      this.showSpinner = true;
      this.getExistingFormulas();
    }
  }

  configInitialSteps() {
    this.showSpinner = true;
    this.submitted = false;
    this.mainFormula = '';
    this.resultSpecType.setValue('');
    this.getSpecsList();
    this.basicOperands = [];
    if (this.editFormula) {
      // if already formula available for this offer type.
      //  console.log(this.editFormula.formula);
      this.editFormula.formula.dynamicFields.forEach(element => {
        this.basicOperands.push({
          type: element.label,
          label: element.label,
          specType: 'specType'
        });
      });
      this.createForm();
      this.resultSpecType.setValue(this.editFormula.formula.result);
      this.mainFormula = this.editFormula.formula.syntax;
      setTimeout(() => {
        this.formulaBuilderForm.patchValue({
          result: this.editFormula.formula.result,
          dynamicFields: this.editFormula.formula.dynamicFields
        });
        this.hideActionButtons = true;
        this.showSpinner = false;
      }, 1000);
    } else {
      // if no formula for this offer type.
      this.assignFirstOperand();
      this.createForm();
      this.addOperatorAndOpeand();
      this.hideActionBtns();
      this.showSpinner = false;
    }
  }

  onSearch(event: any): void {
    this.search.value = event;
    this.params.search = this.search.value;
    this.settingsService.sendOuput('getOfferTypes', this.params).then(res => {
      if (res.result.data.data.length) {
        this.rowData = res.result.data.data;
        this.selectedFormulaBuilderLabels = this.rowData[0];
        this.getExistingFormulas();
      } else {
        this.rowData = [];
      }
    });
  }

  assignFirstOperand() {
    this.basicOperands = [];
    this.basicOperands = [
      { type: 'operand', label: 'operand', specType: 'specType' }
    ];
  }

  getSpecsList() {
    this.filteredSpecList = [];
    this.settingsService
      .getList([
        { url: 'formDetails' },
        { form_id: this.selectedFormulaBuilderLabels.id }
      ])
      .then(res => {
        if (res && res.result.success) {
          this.specsList = res.result.data.specsInfo;
          this.specsList.forEach(element => {
            if (element.key == 'number') {
              this.filteredSpecList.push(element);
            }
          });
        }
      });
  }

  onChanges(event): void {
    let formula = '';
    const dynamicArray = this.formulaBuilderForm.controls[
      'dynamicFields'
    ] as FormArray;
    dynamicArray.controls.forEach(element => {
      if (element.value.label === 'operand') {
        if (element.value.operand) {
          var spec = _.find(this.filteredSpecList, {
            id: element.value.operand
          });
          if (spec) {
            element.patchValue({
              specType: spec['id']
            });
          }
          formula = formula + spec['label'];
        }
      } else if (element.value.label === 'operator') {
        if (element.value.operator) {
          var opeatorUsed = _.find(this.basicOpertors, {
            id: element.value.operator
          });
          if (opeatorUsed) {
            element.patchValue({
              specType: opeatorUsed['name']
            });
            formula = formula + opeatorUsed['symbol'];
          }
        }
      }
    });
    this.mainFormula = formula;
    var resultVar = _.find(this.filteredSpecList, {
      id: this.formulaBuilderForm.value['result']
    });
    if (resultVar) {
      this.resultSpecType.setValue(resultVar.id);
      this.mainFormula = formula + ' = ' + resultVar['label'];
    }
  }

  createForm() {
    this.formulaBuilderForm = this.fb.group({
      result: new FormControl(['', Validators.required]),
      dynamicFields: this.fb.array([])
    });
    this.generateDynamicFields();
    this.formulaBuilderForm.valueChanges.subscribe(value => {
      this.hideActionButtons = false;
    });
  }

  generateDynamicFields() {
    let formArray = this.formulaBuilderForm.get('dynamicFields') as FormArray;
    formArray.controls = [];
    this.basicOperands.forEach(element => {
      formArray.push(
        this.fb.group({
          label: 'operand',
          [element.type]: ['', Validators.required],
          [element.specType]: ''
        })
      );
    });
  }

  public get formArray() {
    return this.formulaBuilderForm.get('dynamicFields') as FormArray;
  }

  addOperatorAndOpeand() {
    this.addOperator();
    this.addOperand();
  }

  addOperator() {
    let formArray = this.formulaBuilderForm.get('dynamicFields') as FormArray;
    this.basicOperands.push({
      type: 'operator',
      label: 'operator',
      specType: 'specType'
    });
    formArray.push(
      this.fb.group({
        label: 'operator',
        operator: ['', Validators.required],
        specType: ''
      })
    );
  }

  addOperand() {
    let formArray = this.formulaBuilderForm.get('dynamicFields') as FormArray;
    this.basicOperands.push({
      type: 'operand',
      label: 'operand',
      specType: 'specType'
    });
    formArray.push(
      this.fb.group({
        label: 'operand',
        operand: ['', Validators.required],
        specType: ['', Validators.required]
      })
    );
  }

  subtractOperatorAndOpeand() {
    let formArray = this.formulaBuilderForm.get('dynamicFields') as FormArray;
    if (formArray.controls.length > 4) {
      this.basicOperands.pop();
      formArray.controls.pop();
      this.basicOperands.pop();
      formArray.controls.pop();
      this.onChanges('');
    }
  }

  saveFormulaBuilder(form) {
    this.submitted = true;
    if (form.valid) {
      this.formValid = true;
      let saveFormulaBuilderObj = {
        formula: { ...form.value, syntax: this.mainFormula },
        id: this.editFormula ? this.editFormula._id : '',
        form_id: this.selectedFormulaBuilderLabels.id
      };
      this.settingsService
        .sendOuput('createFormula', saveFormulaBuilderObj)
        .then(res => {
          this.submitted = false;
          if (res.result.success) {
            let msg =
              this.editMode === true
                ? 'Formula Updated Successfully'
                : ' Formula Created Successfully';
            this.snackbar.openFromComponent(SnackbarComponent, {
              data: {
                status: 'success',
                msg: msg
              },
              verticalPosition: 'top',
              horizontalPosition: 'right'
            });
            this.hideActionButtons = true;
          } else {
            this.snackbar.openFromComponent(SnackbarComponent, {
              data: {
                status: 'fail',
                msg: res.result.data.data
              },
              verticalPosition: 'top',
              horizontalPosition: 'right'
            });
          }
        });
    } else {
      this.formValid = false;
    }
  }

  hideActionBtns() {
    this.hideActionButtons = true;
  }
}
