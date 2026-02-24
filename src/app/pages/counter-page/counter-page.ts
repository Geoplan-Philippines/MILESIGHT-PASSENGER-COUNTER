import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-counter-page',
  imports: [FormsModule],
  templateUrl: './counter-page.html',
  styleUrl: './counter-page.css',
})
export class CounterPage {
  count: number = 0;
  plateNumber: string = '';

  increment(): void {
    this.count++;
  }

  decrement(): void {
    if (this.count > 0) {
      this.count--;
    }
  }

  reset(): void {
    this.count = 0;
  }
}
