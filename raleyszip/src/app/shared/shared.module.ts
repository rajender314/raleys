import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ComponentModule } from './component/component.module';
import { MaterialModule } from './material/material.module';

import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [CommonModule, ComponentModule, MaterialModule, HttpClientModule],
  declarations: [],
  exports: [ComponentModule, MaterialModule]
})
export class SharedModule {}
