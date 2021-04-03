import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent implements OnInit {
  @Input() paginationData;

  // @Output() onSearch = new EventEmitter<any>();
  numbers = [];
  active = [];
  pageCount: number;
  totalCount: number;
  pageSize: number;
  minLimit: number;
  maxLimit: number;
  calculateCount: boolean;
  constructor() {}

  ngOnInit() {
    this.calculateCount = true;
    this.totalCount = this.paginationData.totalCount;
    this.pageSize = 20;
    this.calculatePagesCount();
  }
  calculatePagesCount() {
    if (this.calculateCount) {
      this.pageCount = this.totalCount / this.pageSize;
      for (let i = 1; i <= this.pageCount; i++) {
        this.numbers.push(i);
        this.active[i] = false;
      }
      this.active[1] = true;
    }
    this.calculateCount = false;
  }
  loadMore(param) {
    // this.dataLoad = true;
    let num = param;
    let indx;
    for (let i = 1; i <= this.pageCount; i++) {
      if (this.active[i] === true) {
        indx = i;
      }
    }
    if (param === 'prev') {
      num = indx - 1;
    }
    if (param === 'next') {
      num = indx + 1;
    }
    // if(param == 'prev'){

    // }
    for (let i = 1; i <= this.pageCount; i++) {
      this.active[i] = false;
    }
    this.active[num] = !this.active[num];
    // this.params.pageNumber = num;
    // this.getEvents();
  }
}
