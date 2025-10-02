import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sidebar',
  imports: [MatIconModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
  standalone: true,
})
export class SidebarComponent {
  userName = 'Jacek Soplica';
  userLevel = 23;
  userAvatar = '/profile-picture.webp';
}
