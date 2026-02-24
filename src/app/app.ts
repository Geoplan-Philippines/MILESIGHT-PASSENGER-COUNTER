import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CounterPage } from "./counter-page/counter-page";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CounterPage],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('passenger-counter');
}
