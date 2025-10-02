import { Component, Input, OnInit, OnDestroy, ElementRef, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tooltip',
  imports: [CommonModule],
  templateUrl: './tooltip.html',
  styleUrl: './tooltip.css',
  standalone: true,
})
export class TooltipComponent implements OnInit, OnDestroy {
  @Input() text: string = '';
  @Input() position: 'top' | 'bottom' | 'left' | 'right' = 'top';
  @Input() show: boolean = false;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    // Position tooltip relative to parent
    this.updatePosition();
  }

  ngOnDestroy() {
    // Cleanup if needed
  }

  private updatePosition() {
    const tooltip = this.elementRef.nativeElement;
    const positionClass = `tooltip-${this.position}`;
    this.renderer.addClass(tooltip, positionClass);
  }
}