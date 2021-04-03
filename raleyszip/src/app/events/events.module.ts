import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventsRoutingModule } from './events-routing.module';
import { EventListComponent } from './event-list/event-list.component';
import { AgGridModule } from 'ag-grid-angular';
import { PixelKitModule } from 'pixel-kit';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@app/shared/shared.module';
import { PopoverModule } from 'ngx-popover';

@NgModule({
  imports: [
    CommonModule,
    EventsRoutingModule,
    AgGridModule.withComponents([]),
    PixelKitModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    PopoverModule
  ],
  declarations: [EventListComponent]
})
export class EventsModule {}
