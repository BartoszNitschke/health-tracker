import { Injectable, signal, computed } from '@angular/core';
import type { UserProfile, DailyTarget, Quest } from '../models/user-profile.model';
import userProfileJson from '../../assets/data/user-profile.json';

@Injectable({ providedIn: 'root' })
export class UserDataService {
  private readonly profileSignal = signal<UserProfile>(userProfileJson as unknown as UserProfile);

  readonly profile = computed(() => this.profileSignal());
  readonly attributes = computed(() => this.profileSignal().attributes);
  readonly summary = computed(() => this.profileSignal().summary);
  readonly dailyTargets = computed(() => this.profileSignal().dailyTargets);
  readonly mainQuest = computed(() => {
    const profile = this.profileSignal();
    const quest = profile.mainQuest;

    // Link main quest progress with daily targets if specified
    if (quest.linkedDailyTargetType) {
      const target = profile.dailyTargets.find((t) => t.type === quest.linkedDailyTargetType);
      if (target) {
        return {
          ...quest,
          progressCurrent: target.current,
          progressGoal: target.goal,
          status: target.current >= target.goal ? ('completed' as const) : ('in_progress' as const),
        };
      }
    }

    return quest;
  });

  readonly dailyQuests = computed(() => {
    const profile = this.profileSignal();

    return profile.dailyQuests.map((quest) => {
      // Link quest progress with daily targets if specified
      if (quest.linkedDailyTargetType) {
        const target = profile.dailyTargets.find((t) => t.type === quest.linkedDailyTargetType);
        if (target) {
          return {
            ...quest,
            progressCurrent: target.current,
            progressGoal: target.goal,
            status:
              target.current >= target.goal ? ('completed' as const) : ('in_progress' as const),
          };
        }
      }

      return quest;
    });
  });
  readonly badges = computed(() => this.profileSignal().badges);
  readonly exerciseBonuses = computed(() => this.profileSignal().exerciseBonuses);

  // Dzienny progres questów obliczany dynamicznie
  readonly dailyQuestsCompleted = computed(
    () => this.profileSignal().dailyQuests.filter((q) => q.status === 'completed').length
  );
  readonly dailyQuestsTotal = computed(() => this.profileSignal().dailyQuests.length);

  // Wersje liczące także quest główny
  readonly dailyQuestsCompletedIncludingMain = computed(() => {
    const completedDaily = this.profileSignal().dailyQuests.filter(
      (q) => q.status === 'completed'
    ).length;
    const mainCompleted = this.profileSignal().mainQuest.status === 'completed' ? 1 : 0;
    return completedDaily + mainCompleted;
  });
  readonly dailyQuestsTotalIncludingMain = computed(
    () => this.profileSignal().dailyQuests.length + 1
  );

  // Progres do następnego levelu: każdy kolejny wymaga 100 * (następny level) XP.
  // Dla level=23, aby wejść na 24 potrzeba 2400 XP. Mamy np. 1925 XP.
  // Zwracamy wartość 0..1.
  readonly levelProgress = computed(() => {
    const s = this.profileSignal().summary;
    const nextLevelRequirement = (s.level + 1) * 100;
    const safeCurrent = Math.max(0, Math.min(nextLevelRequirement, s.currentXp));
    return safeCurrent / nextLevelRequirement;
  });

  // Computed properties for attributes based on daily targets
  readonly attributesWithDynamicProgress = computed(() => {
    const profile = this.profileSignal();
    const dailyTargets = profile.dailyTargets;

    const result = profile.attributes.map((attr) => {
      let progress = attr.progress; // Default to static value

      switch (attr.name) {
        case 'Nawodnienie':
          const waterTarget = dailyTargets.find((t) => t.type === 'water');
          if (waterTarget) {
            const baseProgress = Math.round((waterTarget.current / waterTarget.goal) * 100);
            const hydrationBonus = profile.exerciseBonuses.hydration;
            progress = Math.max(0, Math.min(100, baseProgress + hydrationBonus));
          }
          break;
        case 'Głód':
          const caloriesTarget = dailyTargets.find((t) => t.type === 'calories');
          if (caloriesTarget) {
            const baseProgress = Math.round((caloriesTarget.current / caloriesTarget.goal) * 100);
            const hungerBonus = profile.exerciseBonuses.hunger;
            progress = Math.max(0, Math.min(100, baseProgress + hungerBonus));
          }
          break;
        case 'Siła':
          // Use base value from JSON + exercise bonus instead of 100% steps-based calculation
          const exerciseBonus = profile.exerciseBonuses.strength;
          progress = Math.min(100, attr.progress + exerciseBonus);
          break;
        case 'Luz':
          const breaksTarget = dailyTargets.find((t) => t.type === 'breaks');
          if (breaksTarget) {
            const breaksProgress = Math.round((breaksTarget.current / breaksTarget.goal) * 100);
            const meditationBonus = profile.exerciseBonuses.luz;
            progress = Math.min(100, breaksProgress + meditationBonus);
          }
          break;
        case 'Energia':
          // Energia starts at static value and is modified by activities
          const energyBonus = profile.exerciseBonuses.energy;
          progress = Math.max(0, Math.min(100, attr.progress + energyBonus));
          break;
      }

      return { ...attr, progress };
    });

    console.log('Attributes with dynamic progress:', result);
    return result;
  });

  updateDailyTargetProgress(targetType: DailyTarget['type'], amount: number = 1): void {
    console.log('Updating daily target progress:', targetType, amount);
    const profile = this.profileSignal();

    // Check if target exists, if not create it
    const existingTarget = profile.dailyTargets.find(t => t.type === targetType);
    let updatedDailyTargets: DailyTarget[];

    if (existingTarget) {
      // Update existing target
      updatedDailyTargets = profile.dailyTargets.map((t) =>
        t.type === targetType ? { ...t, current: t.current + amount } : t
      );
    } else {
      // Create new target if it doesn't exist (for meals and meditation)
      const newTarget = this.createDefaultTarget(targetType);
      newTarget.current = amount; // Set initial value to the increment amount
      updatedDailyTargets = [...profile.dailyTargets, newTarget];
    }

    // Check if this target type is linked to any quest
    const isLinkedToQuest =
      profile.mainQuest.linkedDailyTargetType === targetType ||
      profile.dailyQuests.some((q) => q.linkedDailyTargetType === targetType);

    console.log('Is linked to quest:', isLinkedToQuest, 'for target type:', targetType);

    // Only update quest progress if this target type is linked to quests
    if (!isLinkedToQuest) {
      // Just update the daily target, no quest/XP/level changes
      this.profileSignal.set({
        ...profile,
        dailyTargets: updatedDailyTargets,
      });
      return;
    }

    // Track quest completions for weekly progress and XP rewards
    let newlyCompletedQuests = 0;
    let totalXpGained = 0;

    const updateQuestByType = (q: Quest): Quest => {
      if (q.linkedDailyTargetType === targetType && q.status !== 'completed') {
        const next = Math.min(q.progressGoal, q.progressCurrent + amount);
        const newStatus = next >= q.progressGoal ? 'completed' : 'in_progress';

        // Count newly completed quests and add XP reward
        if (newStatus === 'completed') {
          newlyCompletedQuests++;
          totalXpGained += q.rewardXp;
        }

        return { ...q, progressCurrent: next, status: newStatus };
      }
      return q;
    };

    const updatedMainQuest: Quest = updateQuestByType(profile.mainQuest);
    const updatedDailyQuests: Quest[] = profile.dailyQuests.map(updateQuestByType);

    // Calculate new XP and level
    let newCurrentXp = profile.summary.currentXp + totalXpGained;
    let newLevel = profile.summary.level;

    // Level up logic: each level requires 100 * level XP
    while (newCurrentXp >= (newLevel + 1) * 100) {
      newCurrentXp -= (newLevel + 1) * 100;
      newLevel++;
    }

    // Update weekly progress and XP/level
    const updatedSummary = {
      ...profile.summary,
      level: newLevel,
      currentXp: newCurrentXp,
      weeklyCompleted: Math.min(
        profile.summary.weeklyTotal,
        profile.summary.weeklyCompleted + newlyCompletedQuests
      ),
    };

    this.profileSignal.set({
      ...profile,
      dailyTargets: updatedDailyTargets,
      mainQuest: updatedMainQuest,
      dailyQuests: updatedDailyQuests,
      summary: updatedSummary,
    });
  }

  // Update quest progress directly by quest ID
  updateQuestProgress(questId: string, amount: number): void {
    console.log('Updating quest progress:', questId, amount);
    const profile = this.profileSignal();

    let updatedMainQuest = profile.mainQuest;
    let updatedDailyQuests = profile.dailyQuests;
    let totalXpGained = 0;
    let newlyCompletedQuests = 0;

    // Check if it's the main quest
    if (profile.mainQuest.id === questId && profile.mainQuest.status !== 'completed') {
      const nextProgress = Math.min(
        profile.mainQuest.progressGoal,
        profile.mainQuest.progressCurrent + amount
      );
      const newStatus: 'not_started' | 'in_progress' | 'completed' =
        nextProgress >= profile.mainQuest.progressGoal ? 'completed' : 'in_progress';

      if (newStatus === 'completed') {
        totalXpGained += profile.mainQuest.rewardXp;
        newlyCompletedQuests += 1;
      }

      updatedMainQuest = {
        ...profile.mainQuest,
        progressCurrent: nextProgress,
        status: newStatus,
      };
    }

    // Check daily quests
    updatedDailyQuests = profile.dailyQuests.map((quest) => {
      if (quest.id === questId && quest.status !== 'completed') {
        const nextProgress = Math.min(quest.progressGoal, quest.progressCurrent + amount);
        const newStatus: 'not_started' | 'in_progress' | 'completed' =
          nextProgress >= quest.progressGoal ? 'completed' : 'in_progress';

        if (newStatus === 'completed') {
          totalXpGained += quest.rewardXp;
          newlyCompletedQuests += 1;
        }

        return {
          ...quest,
          progressCurrent: nextProgress,
          status: newStatus,
        };
      }
      return quest;
    });

    // Update summary with XP, level, and quest completion count
    const updatedSummary = { ...profile.summary };

    // Update XP and level
    if (totalXpGained > 0) {
      updatedSummary.currentXp += totalXpGained;

      // Check for level up
      const nextLevelRequirement = (updatedSummary.level + 1) * 100;
      if (updatedSummary.currentXp >= nextLevelRequirement) {
        updatedSummary.level += 1;
        updatedSummary.currentXp -= nextLevelRequirement;
      }
    }

    // Update weekly completed count - add only newly completed quests
    if (newlyCompletedQuests > 0) {
      updatedSummary.weeklyCompleted = Math.min(
        profile.summary.weeklyTotal,
        profile.summary.weeklyCompleted + newlyCompletedQuests
      );
    }

    this.profileSignal.set({
      ...profile,
      mainQuest: updatedMainQuest,
      dailyQuests: updatedDailyQuests,
      summary: updatedSummary,
    });
  }

  // Update attribute progress directly (for bonuses like exercise)
  updateAttributeProgress(attributeName: string, bonusPercent: number): void {
    console.log('Updating attribute progress:', attributeName, bonusPercent);
    const profile = this.profileSignal();

    if (attributeName === 'Siła') {
      // Add bonus to exercise strength bonus
      const updatedExerciseBonuses = {
        ...profile.exerciseBonuses,
        strength: Math.min(100, profile.exerciseBonuses.strength + bonusPercent),
      };

      this.profileSignal.set({
        ...profile,
        exerciseBonuses: updatedExerciseBonuses,
      });
    } else if (attributeName === 'Luz') {
      // Add bonus to meditation luz bonus
      const updatedExerciseBonuses = {
        ...profile.exerciseBonuses,
        luz: Math.min(100, profile.exerciseBonuses.luz + bonusPercent),
      };

      this.profileSignal.set({
        ...profile,
        exerciseBonuses: updatedExerciseBonuses,
      });
    } else if (attributeName === 'Energia') {
      // Add/subtract energy bonus (can be negative from exercise)
      const currentEnergyBonus = profile.exerciseBonuses.energy;
      const newEnergyBonus = currentEnergyBonus + bonusPercent;
      // Don't let total energy go below 0% or above 100%
      const baseEnergy = profile.attributes.find((a) => a.name === 'Energia')?.progress || 85;
      const clampedBonus = Math.max(-baseEnergy, Math.min(100 - baseEnergy, newEnergyBonus));

      const updatedExerciseBonuses = {
        ...profile.exerciseBonuses,
        energy: clampedBonus,
      };

      this.profileSignal.set({
        ...profile,
        exerciseBonuses: updatedExerciseBonuses,
      });
    } else if (attributeName === 'Głód') {
      // Add/subtract hunger bonus (negative from exercise)
      const updatedExerciseBonuses = {
        ...profile.exerciseBonuses,
        hunger: profile.exerciseBonuses.hunger + bonusPercent,
      };

      this.profileSignal.set({
        ...profile,
        exerciseBonuses: updatedExerciseBonuses,
      });
    } else if (attributeName === 'Nawodnienie') {
      // Add/subtract hydration bonus (negative from exercise)
      const updatedExerciseBonuses = {
        ...profile.exerciseBonuses,
        hydration: profile.exerciseBonuses.hydration + bonusPercent,
      };

      this.profileSignal.set({
        ...profile,
        exerciseBonuses: updatedExerciseBonuses,
      });
    }
    // For other attributes, we could add more bonus types in the future
  }

  // Handle sleep/nap - sets energy based on hours slept
  updateSleep(hours: number, isNap: boolean = false): void {
    console.log('Sleep/nap logged:', hours, 'hours, isNap:', isNap);

    if (isNap) {
      // Nap recovery: same rate as sleep (12.5% per hour)
      const energyRecovery = Math.round((hours / 8) * 100); // 8 hours = 100%
      this.updateAttributeProgress('Energia', energyRecovery);
    } else {
      // Full sleep: reset energy bonus to represent fresh start
      // 8 hours = 100% energy (so it matches original 85% + 15% = 100%)
      const profile = this.profileSignal();
      const baseEnergy = profile.attributes.find((a) => a.name === 'Energia')?.progress || 85;
      const targetEnergy = Math.min(100, Math.round((hours / 8) * 100));
      const newEnergyBonus = targetEnergy - baseEnergy;

      const updatedExerciseBonuses = {
        ...profile.exerciseBonuses,
        energy: newEnergyBonus,
      };

      this.profileSignal.set({
        ...profile,
        exerciseBonuses: updatedExerciseBonuses,
      });
    }
  }

  // Zachowane dla kompatybilności wywołań – deleguje do metody generycznej
  addWaterGlass(amount: number = 1): void {
    this.updateDailyTargetProgress('water', amount);
  }

  // Custom target layout management
  private customTargetLayoutSignal = signal<string[]>(this.loadCustomTargetLayout());

  private loadCustomTargetLayout(): string[] {
    try {
      const saved = localStorage.getItem('customDailyTargets');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  setCustomTargetLayout(layout: string[]): void {
    this.customTargetLayoutSignal.set(layout);
    localStorage.setItem('customDailyTargets', JSON.stringify(layout));
  }

  getCustomTargetLayout(): string[] {
    return this.customTargetLayoutSignal();
  }

  // Computed property for ordered daily targets based on custom layout
  readonly orderedDailyTargets = computed(() => {
    const allTargets = this.profileSignal().dailyTargets;
    const customLayout = this.customTargetLayoutSignal();
    
    if (customLayout.length === 0) {
      // No custom layout, return default order
      return allTargets;
    }
    
    // Reorder based on custom layout
    const orderedTargets: any[] = [];
    customLayout.forEach(targetType => {
      const target = allTargets.find(t => t.type === targetType);
      if (target) {
        orderedTargets.push(target);
      }
    });
    
    // Add any remaining targets not in custom layout
    allTargets.forEach(target => {
      if (!customLayout.includes(target.type)) {
        orderedTargets.push(target);
      }
    });
    
    return orderedTargets;
  });

  private createDefaultTarget(targetType: DailyTarget['type']): DailyTarget {
    const targetDefaults = {
      'meals': { label: 'Posiłki', current: 0, goal: 3, unit: 'posiłków' },
      'meditation': { label: 'Medytacja', current: 0, goal: 15, unit: 'minut medytacji' },
      'water': { label: 'Nawodnienie', current: 0, goal: 8, unit: 'szklanek wody' },
      'calories': { label: 'Kalorie', current: 0, goal: 2000, unit: 'kcal' },
      'steps': { label: 'Kroki', current: 0, goal: 10000, unit: 'kroków' },
      'breaks': { label: 'Przerwy', current: 0, goal: 5, unit: 'przerw od ekranu' }
    };

    const defaults = targetDefaults[targetType];
    return {
      type: targetType,
      label: defaults.label,
      current: defaults.current,
      goal: defaults.goal,
      unit: defaults.unit
    };
  }
}
