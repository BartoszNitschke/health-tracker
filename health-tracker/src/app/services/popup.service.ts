import { Injectable, signal } from '@angular/core';

export type PopupType =
  | 'water-increment'
  | 'calories-increment'
  | 'steps-increment'
  | 'breaks-increment'
  | 'meals-increment'
  | 'meditation-increment'
  | 'exercise-setup'
  | 'meditation-setup'
  | 'eating-log'
  | 'sleep-log'
  | 'activity-results'
  | 'badge-info'
  | 'customize-targets'
  | null;

export interface PopupConfig {
  type: PopupType;
  title: string;
  data?: any;
}

@Injectable({ providedIn: 'root' })
export class PopupService {
  private readonly popupSignal = signal<PopupConfig | null>(null);

  readonly currentPopup = this.popupSignal.asReadonly();
  readonly isOpen = signal(false);

  openPopup(config: PopupConfig): void {
    this.popupSignal.set(config);
    this.isOpen.set(true);
  }

  closePopup(): void {
    this.isOpen.set(false);
    // Small delay to allow animation to finish before clearing content
    setTimeout(() => {
      this.popupSignal.set(null);
    }, 200);
  }

  // Convenience methods for specific popup types
  openWaterIncrement(currentGlasses: number, goalGlasses: number): void {
    this.openPopup({
      type: 'water-increment',
      title: 'Nawodnienie',
      data: { current: currentGlasses, goal: goalGlasses },
    });
  }

  openCaloriesIncrement(currentCalories: number, goalCalories: number): void {
    this.openPopup({
      type: 'calories-increment',
      title: 'Kalorie',
      data: { current: currentCalories, goal: goalCalories },
    });
  }

  openStepsIncrement(currentSteps: number, goalSteps: number): void {
    this.openPopup({
      type: 'steps-increment',
      title: 'Kroki',
      data: { current: currentSteps, goal: goalSteps },
    });
  }

  openBreaksIncrement(currentBreaks: number, goalBreaks: number): void {
    this.openPopup({
      type: 'breaks-increment',
      title: 'Przerwy od ekranu',
      data: { current: currentBreaks, goal: goalBreaks },
    });
  }

  openMealsIncrement(currentMeals: number, goalMeals: number): void {
    this.openPopup({
      type: 'meals-increment',
      title: 'Posiłki',
      data: { current: currentMeals, goal: goalMeals },
    });
  }

  openMeditationIncrement(currentMeditation: number, goalMeditation: number): void {
    this.openPopup({
      type: 'meditation-increment',
      title: 'Medytacja',
      data: { current: currentMeditation, goal: goalMeditation },
    });
  }

  openExerciseSetup(): void {
    this.openPopup({
      type: 'exercise-setup',
      title: 'Trening',
      data: {},
    });
  }

  openMeditationSetup(): void {
    this.openPopup({
      type: 'meditation-setup',
      title: 'Medytacja',
      data: {},
    });
  }

  openEatingLog(): void {
    this.openPopup({
      type: 'eating-log',
      title: 'Jedzenie',
      data: {},
    });
  }

  openSleepLog(): void {
    this.openPopup({
      type: 'sleep-log',
      title: 'Sen',
      data: {},
    });
  }

  openActivityResults(results: any): void {
    this.openPopup({
      type: 'activity-results',
      title: 'Rezultaty',
      data: results,
    });
  }

  openBadgeInfo(badgeData: any): void {
    this.openPopup({
      type: 'badge-info',
      title: 'Odznaka',
      data: badgeData,
    });
  }

  openCustomizeTargets(currentTargets: any[] = []): void {
    this.openPopup({
      type: 'customize-targets' as const,
      title: 'Dostosuj dzienne cele',
      data: { currentTargets },
    });
  }
}
