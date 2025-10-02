import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { PopupType } from '../../services/popup.service';

@Component({
  selector: 'app-popup-content',
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './popup-content.html',
  styleUrl: './popup-content.css',
  standalone: true,
})
export class PopupContentComponent implements OnInit, OnChanges {
  @Input() type: PopupType = null;
  @Input() data: any = {};
  @Output() action = new EventEmitter<{ type: string; value: any }>();

  // Make Math available in template
  Math = Math;

  // For increment popups
  incrementValue = 1;

  // For exercise setup
  exerciseType = '';
  exerciseDuration = 30;

  // For meditation setup
  meditationType = 'mindfulness';
  meditationDuration = 15;

  // For eating log
  mealType = 'breakfast';
  calories = 0;

  // For sleep log
  sleepType = 'sleep'; // 'sleep' or 'nap'
  sleepHours = 8;

  // For activity results
  showResults = false;

  // For customize targets
  dropSlots: { item: any | null }[] = [
    { item: null },
    { item: null },
    { item: null },
    { item: null }
  ];

  availableItems = [
    { id: 'water', name: 'Nawodnienie', emoji: '💧', unit: 'szklanek wody' },
    { id: 'calories', name: 'Kalorie', emoji: '🥩', unit: 'kcal' },
    { id: 'steps', name: 'Kroki', emoji: '☁️', unit: 'kroków' },
    { id: 'breaks', name: 'Przerwy', emoji: '📱', unit: 'przerw od ekranu' },
    { id: 'meals', name: 'Posiłki', emoji: '🍽️', unit: 'posiłków' },
    { id: 'meditation', name: 'Medytacja', emoji: '🧘', unit: 'minut medytacji' }
  ];

  private draggedItem: any = null;

  ngOnInit(): void {
    // Initialize slots with current targets if in customize mode
    console.log('PopupContent ngOnInit - type:', this.type, 'data:', this.data);
    this.initializeTargetsIfNeeded();
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('PopupContent ngOnChanges - changes:', changes);
    if (changes['type'] || changes['data']) {
      console.log('Type or data changed - type:', this.type, 'data:', this.data);
      this.initializeTargetsIfNeeded();
    }
  }

  private initializeTargetsIfNeeded(): void {
    if (this.type === 'customize-targets' && this.data?.currentTargets) {
      console.log('Initializing with current targets:', this.data.currentTargets);
      this.initializeWithCurrentTargets(this.data.currentTargets);
    }
  }

  private initializeWithCurrentTargets(currentTargets: any[]): void {
    console.log('Initializing slots with current targets:', currentTargets.map(t => t.type));
    
    // Reset slots for up to 4 targets (2x2 grid) and available items first
    this.dropSlots = [
      { item: null }, { item: null }, { item: null }, { item: null }
    ];
    this.availableItems = [
      { id: 'water', name: 'Nawodnienie', emoji: '💧', unit: 'szklanek wody' },
      { id: 'calories', name: 'Kalorie', emoji: '🥩', unit: 'kcal' },
      { id: 'steps', name: 'Kroki', emoji: '☁️', unit: 'kroków' },
      { id: 'breaks', name: 'Przerwy', emoji: '📱', unit: 'przerw od ekranu' },
      { id: 'meals', name: 'Posiłki', emoji: '🍽️', unit: 'posiłków' },
      { id: 'meditation', name: 'Medytacja', emoji: '🧘', unit: 'minut medytacji' }
    ];
    
    // Map current targets to available items and place them in slots
    currentTargets.forEach((target, index) => {
      if (index < 4) { // Support up to 4 targets (2x2 grid)
        const availableItem = this.availableItems.find(item => item.id === target.type);
        if (availableItem) {
          // Place in slot
          this.dropSlots[index].item = { ...availableItem };
          // Remove from available items
          this.availableItems = this.availableItems.filter(item => item.id !== target.type);
        }
      }
    });
    
    console.log('Initialization complete - placed targets:', this.dropSlots.map(s => s.item?.name || 'empty'));
  }

  onIncrement(): void {
    this.action.emit({
      type: 'increment',
      value: this.incrementValue,
    });
  }

  onExerciseSubmit(): void {
    this.action.emit({
      type: 'exercise-submit',
      value: {
        type: this.exerciseType,
        duration: this.exerciseDuration,
      },
    });
  }

  onMeditationSubmit(): void {
    this.action.emit({
      type: 'meditation-submit',
      value: {
        type: this.meditationType,
        duration: this.meditationDuration,
      },
    });
  }

  onEatingSubmit(): void {
    this.action.emit({
      type: 'eating-submit',
      value: {
        mealType: this.mealType,
        calories: this.calories,
      },
    });
  }

  onSleepSubmit(): void {
    this.action.emit({
      type: 'sleep-submit',
      value: {
        type: this.sleepType,
        hours: this.sleepHours,
      },
    });
  }

  getIncrementOptions(): number[] {
    switch (this.type) {
      case 'water-increment':
        return [1, 2, 3, 4, 5];
      case 'calories-increment':
        return [50, 100, 200, 300, 500];
      case 'steps-increment':
        return [500, 1000, 2000, 3000, 5000];
      case 'breaks-increment':
        return [1, 2, 3];
      case 'meals-increment':
        return [1, 2, 3];
      case 'meditation-increment':
        return [5, 10, 15, 20, 30];
      default:
        return [1];
    }
  }

  getIncrementUnit(): string {
    switch (this.type) {
      case 'water-increment':
        return 'szklanek';
      case 'calories-increment':
        return 'kcal';
      case 'steps-increment':
        return 'kroków';
      case 'breaks-increment':
        return 'przerw';
      case 'meals-increment':
        return 'posiłków';
      case 'meditation-increment':
        return 'minut';
      default:
        return '';
    }
  }

  onClose(): void {
    this.action.emit({
      type: 'close',
      value: null,
    });
  }

  getBadgeIconColorForPopup(shieldColor: string): string {
    // Determine icon color based on shield background
    // Gold and silver backgrounds use dark icons, bronze uses white
    if (shieldColor.includes('#ffd700') || shieldColor.includes('#c0c0c0')) {
      return '#333'; // Dark color for gold and silver
    }
    return '#fff'; // White color for bronze
  }

  getBadgeAcquiredDate(badgeId: string): string {
    const badgeDates: { [key: string]: string } = {
      'b-water-bronze': '12.09.2025',
      'b-walking-silver': '28.09.2025',
      'b-meditation-gold': '30.09.2025',
      'b-fire-bronze': '16.09.2025',
      'b-sleep-silver': '22.09.2025',
      'b-heart-bronze': '10.09.2025',
    };

    return badgeDates[badgeId] || 'Nieznana data';
  }

  // Drag & Drop methods for customize targets
  draggedFromSlotIndex: number | null = null;

  onDragStart(event: DragEvent, item: any): void {
    this.draggedItem = item;
    this.draggedFromSlotIndex = null; // Coming from available items
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/html', item.id);
    }
  }

  onDragStartFromSlot(event: DragEvent, item: any, slotIndex: number): void {
    this.draggedItem = item;
    this.draggedFromSlotIndex = slotIndex; // Coming from a slot
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/html', item.id);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  onDrop(event: DragEvent, slotIndex: number): void {
    event.preventDefault();
    
    if (!this.draggedItem) return;

    // If dropping on the same slot, do nothing
    if (this.draggedFromSlotIndex === slotIndex) {
      this.draggedItem = null;
      this.draggedFromSlotIndex = null;
      return;
    }

    // If target slot is occupied, swap items
    if (this.dropSlots[slotIndex].item) {
      if (this.draggedFromSlotIndex !== null) {
        // Swap items between slots
        const targetItem = this.dropSlots[slotIndex].item;
        this.dropSlots[slotIndex].item = { ...this.draggedItem };
        this.dropSlots[this.draggedFromSlotIndex].item = targetItem;
      } else {
        // Can't drop from available items to occupied slot
        this.draggedItem = null;
        this.draggedFromSlotIndex = null;
        return;
      }
    } else {
      // Target slot is empty
      this.dropSlots[slotIndex].item = { ...this.draggedItem };
      
      if (this.draggedFromSlotIndex !== null) {
        // Moving from another slot - clear the source slot
        this.dropSlots[this.draggedFromSlotIndex].item = null;
      } else {
        // Moving from available items - remove from available list
        this.availableItems = this.availableItems.filter(item => item.id !== this.draggedItem.id);
      }
    }
    
    this.draggedItem = null;
    this.draggedFromSlotIndex = null;
  }

  removeFromSlot(slotIndex: number): void {
    const item = this.dropSlots[slotIndex].item;
    if (item) {
      // Remove from slot
      this.dropSlots[slotIndex].item = null;
      
      // Add back to available items
      this.availableItems.push(item);
      
      // Sort available items by original order
      this.availableItems.sort((a, b) => {
        const order = ['water', 'calories', 'steps', 'breaks', 'meals', 'meditation'];
        return order.indexOf(a.id) - order.indexOf(b.id);
      });
    }
  }

  saveCustomTargets(): void {
    const selectedTargets = this.dropSlots
      .filter(slot => slot.item)
      .map(slot => slot.item);
    
    console.log('Saved targets:', selectedTargets);
    
    this.action.emit({
      type: 'save-targets',
      value: selectedTargets,
    });
  }

  onDropToAvailable(event: DragEvent): void {
    event.preventDefault();
    
    if (this.draggedItem && this.draggedFromSlotIndex !== null) {
      // Remove item from slot
      this.dropSlots[this.draggedFromSlotIndex].item = null;
      
      // Add back to available items
      this.availableItems.push(this.draggedItem);
      
      // Sort available items by original order
      this.availableItems.sort((a, b) => {
        const order = ['water', 'calories', 'steps', 'breaks', 'meals', 'meditation'];
        return order.indexOf(a.id) - order.indexOf(b.id);
      });
      
      this.draggedItem = null;
      this.draggedFromSlotIndex = null;
    }
  }
}
