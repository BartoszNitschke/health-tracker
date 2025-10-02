# Health Tracker - Gamifikowana Aplikacja Zdrowotna 🎮💪

Health Tracker to nowoczesna aplikacja webowa, która przekształca zarządzanie zdrowiem w angażującą grę RPG. Aplikacja pomaga użytkownikom budować zdrowe nawyki poprzez system questów, poziomów, atrybutów postaci i odznak osiągnięć.

## 🌟 Funkcjonalności

### Główne cechy aplikacji:

- **Gamifikacja zdrowia** - Twoja postać rozwija się wraz z Twoimi zdrowymi nawykami
- **System atrybutów** - Śledź 5 kluczowych wskaźników: Siła, Głód, Energia, Nawodnienie, Luz
- **Dzienne cele** - Interaktywne śledzenie wody, kalorii, kroków, przerw, posiłków i medytacji
- **System questów** - Główne i dzienne zadania z nagrodami XP
- **Poziomy i odznaki** - Progresja postaci i kolekcjonowanie osiągnięć
- **Responsywny design** - Nowoczesny interfejs z animacjami i hover efektami

### Kluczowe funkcje:

- 📊 **Dashboard z podsumowaniem** - Przegląd wszystkich statystyk w jednym miejscu
- 🎯 **Śledzenie celów** - Wizualne paski postępu dla dziennych celów
- 🏆 **System nagród** - Zdobywaj XP i odznaki za wykonane zadania
- 📈 **Wizualizacje** - Kolorowe wykresy i animowane elementy UI
- 🔧 **Tooltips i popupy** - Interaktywne podpowiedzi i dodatkowe informacje


## 📸 Demo Aplikacji


https://github.com/user-attachments/assets/cc9aa2e7-c019-472f-b58b-3e29f5019d50



## 🛠️ Technologie

### Frontend Framework:

- **Angular 20** - Najnowsza wersja frameworka z najnowszymi features
- **TypeScript** - Silne typowanie i nowoczesny JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Angular Signals** - Reaktywne zarządzanie stanem

### Architektura i Narzędzia:

- **Standalone Components** - Nowoczesna architektura Angular bez modułów
- **Angular CDK** - Komponenty i narzędzia UI
- **Custom Directives** - Własne dyrektywy (np. tooltip)
- **Service-based Architecture** - Separacja logiki biznesowej
- **Computed Properties** - Reaktywne obliczenia bazujące na signalach

## 📁 Struktura Projektu

```
src/
├── app/
│   ├── components/          # Komponenty UI
│   │   ├── dashboard/       # Główny dashboard
│   │   ├── header/          # Nagłówek aplikacji
│   │   ├── sidebar/         # Panel boczny
│   │   ├── popup/           # Okna modalne
│   │   └── tooltip/         # Komponenty tooltipów
│   ├── services/            # Logika biznesowa
│   │   ├── user-data.service.ts    # Zarządzanie danymi użytkownika
│   │   └── popup.service.ts        # Obsługa popupów
│   ├── models/              # Definicje typów TypeScript
│   │   └── user-profile.model.ts   # Modele danych
│   ├── directives/          # Własne dyrektywy
│   │   └── tooltip.directive.ts    # Dyrektywa tooltipów
│   └── app.routes.ts        # Routing aplikacji
├── assets/
│   └── data/
│       └── user-profile.json       # Dane użytkownika (mock)
└── public/                  # Zasoby statyczne
    ├── activities/          # Ikony aktywności
    └── profile-picture.webp # Zdjęcie profilowe
```

## 🔥 Ciekawsze Fragmenty Kodu

### 1. Reactive State Management z Angular Signals

```typescript
// services/user-data.service.ts
private readonly profileSignal = signal<UserProfile>(userProfileJson);

readonly profile = computed(() => this.profileSignal());
readonly mainQuest = computed(() => {
  const profile = this.profileSignal();
  const quest = profile.mainQuest;

  // Dynamiczne linkowanie questów z dziennymi celami
  if (quest.linkedDailyTargetType) {
    const target = profile.dailyTargets.find(t => t.type === quest.linkedDailyTargetType);
    if (target) {
      return {
        ...quest,
        progressCurrent: target.current,
        progressGoal: target.goal,
        status: target.current >= target.goal ? 'completed' : 'in_progress',
      };
    }
  }
  return quest;
});
```

### 2. Custom Tooltip Directive

```typescript
// directives/tooltip.directive.ts - Własna dyrektywa do tooltipów
@Directive({
  selector: '[appTooltip]',
  standalone: true,
})
export class TooltipDirective {
  @Input() appTooltip = '';
  @Input() tooltipPosition: 'top' | 'bottom' | 'left' | 'right' = 'top';

  // Implementacja dynamicznych tooltipów z pozycjonowaniem
}
```

### 3. Zaawansowane Computed Properties

```typescript
// Automatyczne obliczanie postępu questów na podstawie celów dziennych
readonly dailyQuests = computed(() => {
  return profile.dailyQuests.map((quest) => {
    if (quest.linkedDailyTargetType) {
      const target = profile.dailyTargets.find(t => t.type === quest.linkedDailyTargetType);
      if (target) {
        return {
          ...quest,
          progressCurrent: target.current,
          progressGoal: target.goal,
          status: target.current >= target.goal ? 'completed' : 'in_progress',
        };
      }
    }
    return quest;
  });
});
```

### 4. Dynamiczne Style i Animacje

- Gradient progress bars z animacjami CSS
- Hover effects z transform i transition
- Responsywne layout z Tailwind CSS Grid/Flexbox
- Custom color palette dla różnych elementów UI

## 🚀 Instalacja i Uruchomienie

### Wymagania:

- Node.js (v18+)
- Angular CLI (v20+)

### Kroki instalacji:

1. **Klonowanie repozytorium:**

```bash
git clone <repository-url>
cd health-tracker
```

2. **Instalacja zależności:**

```bash
npm install
```

3. **Uruchomienie serwera deweloperskiego:**

```bash
ng serve
```

4. **Otwórz aplikację:**
   Przejdź do `http://localhost:4200/`

### Inne komendy:

```bash
# Build produkcyjny
ng build

# Testy jednostkowe
ng test

# Linting kodu
ng lint
```

## 💡 Najciekawsze Rozwiązania Techniczne

1. **Unified State Management** - Użycie Angular Signals do reaktywnego zarządzania stanem bez external libraries
2. **Component Architecture** - Standalone components z klarownym podziałem odpowiedzialności
3. **Dynamic Quest System** - Automatyczne linkowanie questów z dziennymi celami
4. **Custom Directives** - Własne dyrektywy dla tooltipów i innych interakcji
5. **Type Safety** - Kompletne typowanie TypeScript dla wszystkich danych i API
6. **Performance Optimization** - Computed properties dla efektywnych kalkulacji

## 🎨 Design System

Aplikacja wykorzystuje spójny design system oparty o:

- **Kolory**: Custom palette z Tailwind CSS
- **Typografia**: Font Fredoka dla headingów, system fonts dla tekstu
- **Spacing**: Konsystentny system odstępów
- **Animations**: Subtle hover effects i transitions
- **Responsive Design**: Mobile-first approach

---
