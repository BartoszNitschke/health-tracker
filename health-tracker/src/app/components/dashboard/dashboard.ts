import { Component, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { HeaderComponent } from '../header/header';
import { PopupComponent } from '../popup/popup';
import { PopupContentComponent } from '../popup-content/popup-content';
import EmblaCarousel, { EmblaCarouselType } from 'embla-carousel';
import { CommonModule } from '@angular/common';
import { UserDataService } from '../../services/user-data.service';
import { PopupService } from '../../services/popup.service';
import { TooltipDirective } from '../../directives/tooltip.directive';

@Component({
  selector: 'app-dashboard',
  imports: [
    HeaderComponent,
    MatIconModule,
    CommonModule,
    PopupComponent,
    PopupContentComponent,
    TooltipDirective,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  standalone: true,
})
export class DashboardComponent implements AfterViewInit, OnDestroy {
  @ViewChild('emblaViewport', { static: false }) emblaViewport!: ElementRef<HTMLElement>;
  private embla!: EmblaCarouselType;
  constructor(
    public readonly userData: UserDataService,
    public readonly popupService: PopupService
  ) {}

  // Computed property for main quest progress percentage
  get mainQuestProgressPercentage(): number {
    const mainQuest = this.userData.mainQuest();
    return Math.round((mainQuest.progressCurrent / mainQuest.progressGoal) * 100);
  }

  // Computed property for screen breaks quest progress percentage
  get screenBreaksQuestProgressPercentage(): number {
    const screenBreaksQuest = this.userData
      .dailyQuests()
      .find((q) => q.id === 'dq-screen-breaks-5');
    if (!screenBreaksQuest) return 0;
    return Math.round((screenBreaksQuest.progressCurrent / screenBreaksQuest.progressGoal) * 100);
  }

  // Computed property for training quest progress percentage
  get trainingQuestProgressPercentage(): number {
    const trainingQuest = this.userData.dailyQuests().find((q) => q.id === 'dq-train-30');
    if (!trainingQuest) return 0;
    return Math.round((trainingQuest.progressCurrent / trainingQuest.progressGoal) * 100);
  }

  // Computed property for steps quest progress percentage
  get stepsQuestProgressPercentage(): number {
    const stepsQuest = this.userData.dailyQuests().find((q) => q.id === 'dq-steps-10k');
    if (!stepsQuest) return 0;
    return Math.round((stepsQuest.progressCurrent / stepsQuest.progressGoal) * 100);
  }

  // Computed property for meditation quest progress percentage
  get meditationQuestProgressPercentage(): number {
    const meditationQuest = this.userData.dailyQuests().find((q) => q.id === 'dq-meditation-15');
    if (!meditationQuest) return 0;
    return Math.round((meditationQuest.progressCurrent / meditationQuest.progressGoal) * 100);
  }

  // Computed properties for progress circles
  get dailyQuestsStrokeDashoffset(): number {
    const completed = this.userData.dailyQuestsCompletedIncludingMain();
    const total = this.userData.dailyQuestsTotalIncludingMain();
    const circumference = 175.929; // 2 * π * r where r=28
    const progress = total > 0 ? completed / total : 0;
    return circumference * (1 - progress);
  }

  get weeklyQuestsStrokeDashoffset(): number {
    const completed = this.userData.summary().weeklyCompleted;
    const total = this.userData.summary().weeklyTotal;
    const circumference = 175.929; // 2 * π * r where r=28
    const progress = total > 0 ? completed / total : 0;
    return circumference * (1 - progress);
  }

  get levelProgressStrokeDashoffset(): number {
    const progress = this.userData.levelProgress();
    const circumference = 175.929; // 2 * π * r where r=28
    return circumference * (1 - progress);
  }

  ngAfterViewInit() {
    if (this.emblaViewport?.nativeElement) {
      console.log('Initializing Embla carousel...', this.emblaViewport.nativeElement);

      try {
        this.embla = EmblaCarousel(this.emblaViewport.nativeElement, {
          align: 'start',
          loop: false,
          dragFree: false,
          containScroll: 'trimSnaps',
        });

        this.embla.on('init', () => {
          console.log('Embla carousel initialized successfully');
        });

        this.embla.on('select', () => {
          console.log('Slide selected');
        });

        this.embla.on('scroll', () => {
          console.log('Scrolling...');
        });

        console.log('Embla instance created:', this.embla);
      } catch (error) {
        console.error('Error initializing Embla:', error);
      }
    } else {
      console.error('Embla viewport not found');
    }
  }

  ngOnDestroy() {
    if (this.embla) {
      this.embla.destroy();
    }
  }

  scrollPrev() {
    if (this.embla) {
      this.embla.scrollPrev();
    }
  }

  scrollNext() {
    if (this.embla) {
      this.embla.scrollNext();
    }
  }

  // Increment methods for daily targets
  incrementWater(amount: number = 1): void {
    this.userData.updateDailyTargetProgress('water', amount);
  }

  incrementCalories(amount: number = 100): void {
    this.userData.updateDailyTargetProgress('calories', amount);
  }

  incrementSteps(amount: number = 1000): void {
    this.userData.updateDailyTargetProgress('steps', amount);
  }

  incrementBreaks(amount: number = 1): void {
    this.userData.updateDailyTargetProgress('breaks', amount);
  }

  // Popup handlers for daily targets
  openTargetPopup(targetType: string): void {
    const targets = this.userData.orderedDailyTargets();
    let target = targets.find((t) => t.type === targetType);

    // If target not found in existing targets, create mock target
    if (!target) {
      target = this.createMockTarget(targetType);
    }

    if (!target) return;

    switch (targetType) {
      case 'water':
        this.popupService.openWaterIncrement(target.current, target.goal);
        break;
      case 'calories':
        this.popupService.openCaloriesIncrement(target.current, target.goal);
        break;
      case 'steps':
        this.popupService.openStepsIncrement(target.current, target.goal);
        break;
      case 'breaks':
        this.popupService.openBreaksIncrement(target.current, target.goal);
        break;
      case 'meals':
        this.popupService.openMealsIncrement(target.current, target.goal);
        break;
      case 'meditation':
        this.popupService.openMeditationIncrement(target.current, target.goal);
        break;
    }
  }

  // Legacy methods for backward compatibility
  openWaterPopup(): void {
    this.openTargetPopup('water');
  }

  openCaloriesPopup(): void {
    this.openTargetPopup('calories');
  }

  openStepsPopup(): void {
    this.openTargetPopup('steps');
  }

  openBreaksPopup(): void {
    this.openTargetPopup('breaks');
  }

  // Helper methods for ordered targets display
  getOrderedTarget(index: number): any {
    const orderedTargets = this.userData.orderedDailyTargets();
    return orderedTargets[index] || { current: 0, goal: 1, unit: '', label: '' };
  }

  getTargetIcon(target: any): string {
    const iconMap: { [key: string]: string } = {
      water: 'water_drop',
      calories: 'local_fire_department',
      steps: 'directions_walk',
      breaks: 'phone_android',
      meals: 'restaurant',
      meditation: 'self_improvement',
    };
    return iconMap[target.type] || 'help';
  }

  openTargetPopupByIndex(index: number): void {
    const target = this.getOrderedTarget(index);
    if (target.type) {
      this.openTargetPopup(target.type);
    }
  }

  openTargetPopupByType(targetType: string): void {
    this.openTargetPopup(targetType);
  }

  getVisibleTargets(): any[] {
    const customLayout = this.userData.getCustomTargetLayout();
    if (customLayout.length === 0) {
      // Default: show first 4 targets
      return this.userData.orderedDailyTargets().slice(0, 4);
    }

    // Show targets based on custom layout
    const allTargets = this.userData.orderedDailyTargets();
    return customLayout
      .map((targetType) => {
        return allTargets.find((t) => t.type === targetType) || this.createMockTarget(targetType);
      })
      .filter((target) => target !== null);
  }

  private createMockTarget(targetType: string): any {
    const mockTargets: { [key: string]: any } = {
      meals: { type: 'meals', label: 'Posiłki', current: 0, goal: 3, unit: 'posiłków' },
      meditation: {
        type: 'meditation',
        label: 'Medytacja',
        current: 0,
        goal: 15,
        unit: 'minut medytacji',
      },
    };
    return mockTargets[targetType] || null;
  }

  // Handle popup actions
  onPopupAction(event: { type: string; value: any }): void {
    const currentPopup = this.popupService.currentPopup();
    if (!currentPopup) return;

    switch (event.type) {
      case 'increment':
        this.handleIncrement(currentPopup.type, event.value);
        this.popupService.closePopup();
        break;
      case 'exercise-submit':
        this.handleExerciseSubmit(event.value);
        // Don't close popup - handleExerciseSubmit will show results
        break;
      case 'meditation-submit':
        this.handleMeditationSubmit(event.value);
        // Don't close popup - handleMeditationSubmit will show results
        break;
      case 'eating-submit':
        this.handleEatingSubmit(event.value);
        this.popupService.closePopup();
        break;
      case 'sleep-submit':
        this.handleSleepSubmit(event.value);
        this.popupService.closePopup();
        break;
      case 'save-targets':
        this.handleSaveTargets(event.value);
        this.popupService.closePopup();
        break;
      case 'close':
        this.popupService.closePopup();
        break;
    }
  }

  private handleIncrement(popupType: string | null, amount: number): void {
    switch (popupType) {
      case 'water-increment':
        this.incrementWater(amount);
        break;
      case 'calories-increment':
        this.incrementCalories(amount);
        break;
      case 'steps-increment':
        this.incrementSteps(amount);
        break;
      case 'breaks-increment':
        this.incrementBreaks(amount);
        break;
      case 'meals-increment':
        this.incrementMeals(amount);
        break;
      case 'meditation-increment':
        this.incrementMeditation(amount);
        break;
    }
  }

  incrementMeals(amount: number = 1): void {
    this.userData.updateDailyTargetProgress('meals', amount);
  }

  incrementMeditation(amount: number = 5): void {
    this.userData.updateDailyTargetProgress('meditation', amount);
  }

  private handleExerciseSubmit(data: { type: string; duration: number }): void {
    console.log('Exercise started:', data);

    // Calculate bonuses/losses
    const strengthBonus = Math.floor(data.duration / 10) * 10; // 10% per 10 minutes
    const energyLoss = Math.floor(data.duration / 10) * 10; // 10% per 10 minutes
    const hungerLoss = Math.floor(data.duration / 10) * 5; // 5% per 10 minutes
    const hydrationLoss = Math.floor(data.duration / 10) * 10; // 10% per 10 minutes

    // Update exercise quest progress
    this.userData.updateQuestProgress('dq-train-30', data.duration);

    // Apply attribute changes
    if (strengthBonus > 0) {
      this.userData.updateAttributeProgress('Siła', strengthBonus);
    }
    if (energyLoss > 0) {
      this.userData.updateAttributeProgress('Energia', -energyLoss);
    }
    if (hungerLoss > 0) {
      this.userData.updateAttributeProgress('Głód', -hungerLoss);
    }
    if (hydrationLoss > 0) {
      this.userData.updateAttributeProgress('Nawodnienie', -hydrationLoss);
    }

    // Show results popup
    const gains = [];
    const losses = [];

    if (strengthBonus > 0) {
      gains.push({ name: 'Siła', emoji: '💪', value: `+${strengthBonus}%` });
    }
    if (energyLoss > 0) {
      losses.push({ name: 'Energia', emoji: '🌙', value: `-${energyLoss}%` });
    }
    if (hungerLoss > 0) {
      losses.push({ name: 'Głód', emoji: '🍖', value: `-${hungerLoss}%` });
    }
    if (hydrationLoss > 0) {
      losses.push({ name: 'Nawodnienie', emoji: '💧', value: `-${hydrationLoss}%` });
    }

    const results = {
      activityType: 'Trening',
      duration: data.duration,
      gains: gains,
      losses: losses,
    };

    this.popupService.openActivityResults(results);
  }
  private handleMeditationSubmit(data: { type: string; duration: number }): void {
    console.log('Meditation started:', data);

    // Calculate bonuses
    const luzBonus = Math.floor(data.duration / 10) * 10; // 10% per 10 minutes
    const energyRecovery = Math.floor(data.duration / 10) * 5; // 5% per 10 minutes

    // Update meditation daily target progress (this will automatically update linked meditation quest)
    this.userData.updateDailyTargetProgress('meditation', data.duration);

    // Apply attribute changes
    if (luzBonus > 0) {
      this.userData.updateAttributeProgress('Luz', luzBonus);
    }
    if (energyRecovery > 0) {
      this.userData.updateAttributeProgress('Energia', energyRecovery);
    }

    // Show results popup
    const gains: { name: string; emoji: string; value: string }[] = [];
    const losses: { name: string; emoji: string; value: string }[] = [];

    if (luzBonus > 0) {
      gains.push({ name: 'Luz', emoji: '☀️', value: `+${luzBonus}%` });
    }
    if (energyRecovery > 0) {
      gains.push({ name: 'Energia', emoji: '🌙', value: `+${energyRecovery}%` });
    }

    const results = {
      activityType: 'Medytacja',
      duration: data.duration,
      gains: gains,
      losses: losses,
    };

    this.popupService.openActivityResults(results);
  }

  private handleEatingSubmit(data: { mealType: string; calories: number }): void {
    console.log('Meal logged:', data);
    this.incrementCalories(data.calories);
  }

  private handleSleepSubmit(data: { type: string; hours: number }): void {
    console.log('Sleep logged:', data);

    // Log sleep/nap and update energy
    this.userData.updateSleep(data.hours, data.type === 'nap');
  }

  // Badge popup methods
  openBadgeInfo(badge: any): void {
    this.popupService.openBadgeInfo(badge);
  }

  getBadgeIconColor(shieldColor: string): string {
    // Determine icon color based for badge icons
    // Gold and silver backgrounds use dark icons, bronze uses white
    if (shieldColor.includes('#ffd700') || shieldColor.includes('#c0c0c0')) {
      return '#333'; // Dark color for gold and silver
    }
    return '#fff'; // White color for bronze
  }

  getLevelTooltip(): string {
    const summary = this.userData.summary();
    const levelProgress = this.userData.levelProgress();

    // Calculate XP needed for next level: level * 100
    const nextLevel = summary.level + 1;
    const xpNeededForNextLevel = nextLevel * 100;
    const xpToNextLevel = xpNeededForNextLevel - summary.currentXp;

    return `${summary.currentXp}/${xpNeededForNextLevel} XP (jeszcze ${xpToNextLevel} XP do poziomu ${nextLevel})`;
  }

  openCustomizeTargetsPopup(): void {
    // Get currently visible targets (those that are shown in dashboard)
    const visibleTargets = this.getVisibleTargets();
    this.popupService.openCustomizeTargets(visibleTargets);
  }

  private handleSaveTargets(selectedTargets: any[]): void {
    console.log('Saving custom targets:', selectedTargets);

    // Create custom layout mapping
    const customLayout = selectedTargets.map((target) => target.id);

    // Save to localStorage and update UserDataService
    localStorage.setItem('customDailyTargets', JSON.stringify(customLayout));
    this.userData.setCustomTargetLayout(customLayout);
  }
}
