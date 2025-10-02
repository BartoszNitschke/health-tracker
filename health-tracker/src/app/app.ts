import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './components/sidebar/sidebar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SidebarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected readonly title = signal('health-tracker');
  protected readonly title2 = signal('siema');
  protected readonly isLoading = signal(true);

  ngOnInit(): void {
    // Show loading screen for 2 seconds
    setTimeout(() => {
      this.isLoading.set(false);
    }, 2000);
  }
}
