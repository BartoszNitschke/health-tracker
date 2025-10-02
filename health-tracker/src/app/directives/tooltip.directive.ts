import { Directive, Input, ElementRef, Renderer2, HostListener, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appTooltip]',
  standalone: true,
})
export class TooltipDirective implements OnDestroy {
  @Input('appTooltip') tooltipText: string = '';
  @Input('tooltipPosition') position: 'top' | 'bottom' | 'left' | 'right' = 'top';

  private tooltipElement: HTMLElement | null = null;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {}

  @HostListener('mouseenter')
  onMouseEnter() {
    if (this.tooltipText) {
      this.showTooltip();
    }
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.hideTooltip();
  }

  private showTooltip() {
    if (this.tooltipElement) {
      this.hideTooltip();
    }

    // Add global styles first
    this.addTooltipStyles();

    // Create tooltip element
    this.tooltipElement = this.renderer.createElement('div');
    
    // Apply inline styles for tooltip container
    this.renderer.setStyle(this.tooltipElement, 'position', 'absolute');
    this.renderer.setStyle(this.tooltipElement, 'z-index', '1000');
    this.renderer.setStyle(this.tooltipElement, 'pointer-events', 'none');
    this.renderer.setStyle(this.tooltipElement, 'opacity', '1');
    this.renderer.setStyle(this.tooltipElement, 'visibility', 'visible');
    this.renderer.setStyle(this.tooltipElement, 'transition', 'opacity 0.2s ease-in-out');

    // Create content
    const contentElement = this.renderer.createElement('div');
    this.renderer.setStyle(contentElement, 'background-color', '#1f2937');
    this.renderer.setStyle(contentElement, 'color', 'white');
    this.renderer.setStyle(contentElement, 'padding', '8px 12px');
    this.renderer.setStyle(contentElement, 'border-radius', '8px');
    this.renderer.setStyle(contentElement, 'font-size', '12px');
    this.renderer.setStyle(contentElement, 'font-weight', '500');
    this.renderer.setStyle(contentElement, 'white-space', 'nowrap');
    this.renderer.setStyle(contentElement, 'box-shadow', '0 4px 12px rgba(0, 0, 0, 0.15)');
    this.renderer.setStyle(contentElement, 'font-family', 'Poppins, sans-serif');
    
    const textNode = this.renderer.createText(this.tooltipText);
    this.renderer.appendChild(contentElement, textNode);

    // Create arrow
    const arrowElement = this.renderer.createElement('div');
    this.renderer.setStyle(arrowElement, 'position', 'absolute');
    this.renderer.setStyle(arrowElement, 'width', '0');
    this.renderer.setStyle(arrowElement, 'height', '0');

    // Position tooltip based on position
    if (this.tooltipElement) {
      this.positionTooltip(this.tooltipElement, arrowElement);
    }

    // Append elements
    this.renderer.appendChild(this.tooltipElement, contentElement);
    this.renderer.appendChild(this.tooltipElement, arrowElement);

    // Position relative to host element
    const hostElement = this.elementRef.nativeElement;
    this.renderer.setStyle(hostElement, 'position', 'relative');
    this.renderer.appendChild(hostElement, this.tooltipElement);
  }

  private hideTooltip() {
    if (this.tooltipElement) {
      this.renderer.removeChild(this.elementRef.nativeElement, this.tooltipElement);
      this.tooltipElement = null;
    }
  }

  private positionTooltip(tooltip: HTMLElement, arrow: HTMLElement) {
    switch (this.position) {
      case 'top':
        this.renderer.setStyle(tooltip, 'bottom', '100%');
        this.renderer.setStyle(tooltip, 'left', '50%');
        this.renderer.setStyle(tooltip, 'transform', 'translateX(-50%)');
        this.renderer.setStyle(tooltip, 'margin-bottom', '8px');
        
        this.renderer.setStyle(arrow, 'top', '100%');
        this.renderer.setStyle(arrow, 'left', '50%');
        this.renderer.setStyle(arrow, 'transform', 'translateX(-50%)');
        this.renderer.setStyle(arrow, 'border-left', '6px solid transparent');
        this.renderer.setStyle(arrow, 'border-right', '6px solid transparent');
        this.renderer.setStyle(arrow, 'border-top', '6px solid #1f2937');
        break;
        
      case 'bottom':
        this.renderer.setStyle(tooltip, 'top', '100%');
        this.renderer.setStyle(tooltip, 'left', '50%');
        this.renderer.setStyle(tooltip, 'transform', 'translateX(-50%)');
        this.renderer.setStyle(tooltip, 'margin-top', '8px');
        
        this.renderer.setStyle(arrow, 'bottom', '100%');
        this.renderer.setStyle(arrow, 'left', '50%');
        this.renderer.setStyle(arrow, 'transform', 'translateX(-50%)');
        this.renderer.setStyle(arrow, 'border-left', '6px solid transparent');
        this.renderer.setStyle(arrow, 'border-right', '6px solid transparent');
        this.renderer.setStyle(arrow, 'border-bottom', '6px solid #1f2937');
        break;
        
      case 'left':
        this.renderer.setStyle(tooltip, 'right', '100%');
        this.renderer.setStyle(tooltip, 'top', '50%');
        this.renderer.setStyle(tooltip, 'transform', 'translateY(-50%)');
        this.renderer.setStyle(tooltip, 'margin-right', '8px');
        
        this.renderer.setStyle(arrow, 'left', '100%');
        this.renderer.setStyle(arrow, 'top', '50%');
        this.renderer.setStyle(arrow, 'transform', 'translateY(-50%)');
        this.renderer.setStyle(arrow, 'border-top', '6px solid transparent');
        this.renderer.setStyle(arrow, 'border-bottom', '6px solid transparent');
        this.renderer.setStyle(arrow, 'border-left', '6px solid #1f2937');
        break;
        
      case 'right':
        this.renderer.setStyle(tooltip, 'left', '100%');
        this.renderer.setStyle(tooltip, 'top', '50%');
        this.renderer.setStyle(tooltip, 'transform', 'translateY(-50%)');
        this.renderer.setStyle(tooltip, 'margin-left', '8px');
        
        this.renderer.setStyle(arrow, 'right', '100%');
        this.renderer.setStyle(arrow, 'top', '50%');
        this.renderer.setStyle(arrow, 'transform', 'translateY(-50%)');
        this.renderer.setStyle(arrow, 'border-top', '6px solid transparent');
        this.renderer.setStyle(arrow, 'border-bottom', '6px solid transparent');
        this.renderer.setStyle(arrow, 'border-right', '6px solid #1f2937');
        break;
    }
  }

  private addTooltipStyles() {
    // This method is now simplified since we use inline styles
    // No global styles needed anymore
  }

  ngOnDestroy() {
    this.hideTooltip();
  }
}