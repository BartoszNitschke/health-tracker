import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { UserDataService } from '../../services/user-data.service';

@Component({
  selector: 'app-header',
  imports: [MatIconModule, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
  standalone: true,
})
export class HeaderComponent {
  constructor(public readonly userData: UserDataService) {}

  trackByAttr(index: number, attr: any): string {
    return attr.name;
  }
}
