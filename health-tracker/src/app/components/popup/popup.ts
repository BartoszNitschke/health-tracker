import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { trigger, transition, style, animate } from '@angular/animations';
import { PopupService } from '../../services/popup.service';

@Component({
  selector: 'app-popup',
  imports: [CommonModule, MatIconModule],
  templateUrl: './popup.html',
  styleUrl: './popup.css',
  standalone: true,
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-out', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        style({ opacity: 1 }),
        animate('150ms ease-in', style({ opacity: 0 })),
      ]),
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95) translateY(-10px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'scale(1) translateY(0)' })),
      ]),
      transition(':leave', [
        style({ opacity: 1, transform: 'scale(1) translateY(0)' }),
        animate('150ms ease-in', style({ opacity: 0, transform: 'scale(0.95) translateY(-10px)' })),
      ]),
    ]),
  ],
})
export class PopupComponent implements OnInit, OnDestroy {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() showCloseButton = true;
  @Output() close = new EventEmitter<void>();

  constructor(public readonly popupService: PopupService) {}

  ngOnInit() {
    // Prevent body scroll when popup is open
    if (this.isOpen) {
      document.body.style.overflow = 'hidden';
    }
  }

  ngOnDestroy() {
    // Restore body scroll
    document.body.style.overflow = 'auto';
  }

  onBackdropClick(event: MouseEvent) {
    // Close popup when clicking outside the content area
    if (event.target === event.currentTarget) {
      this.closePopup();
    }
  }

  onCloseClick() {
    this.closePopup();
  }

  private closePopup() {
    document.body.style.overflow = 'auto';
    this.close.emit();
  }

  // Handle escape key
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.closePopup();
    }
  }
}
