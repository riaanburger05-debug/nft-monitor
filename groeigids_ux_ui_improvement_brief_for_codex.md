# GroeiGids UX/UI Improvement Brief for Codex

## 1. Product Direction

GroeiGids should move from a “hydroponic monitoring app” to a **guided NFT hydroponics coach**.

The core product promise:

> Help a beginner, learner, teacher, or small grower get from planting day to a successful harvest with simple daily guidance.

The dashboard should not primarily answer:

> What are all my readings?

It should answer:

> Is my system healthy, what should I do today, and what needs attention?

---

## 2. Main UX Problem to Solve

The current system contains strong functionality and content, but the first user experience can feel too busy.

Current strengths:
- Tank monitoring
- Crop-specific EC/pH/TDS/temp ranges
- History and graphs
- Dosing calculator
- Growth diary
- Harvest tracking
- Learner mode
- Full GroeiGids guide
- Afrikaans and English support

Main issue:
- Too much data is visible too early.
- Beginners may not know what to do first.
- The app currently feels more like a technical dashboard than a coach.

Design goal:
- Keep all powerful functionality.
- Reveal it progressively.
- Make the first screen calm, clear, and action-oriented.

---

## 3. New Product Structure

Recommended top-level structure:

```text
Dashboard
Coach
Grow
Learn
History
More
```

### 3.1 Dashboard

Purpose: show today’s status and actions.

Should include:
- NFT Health Score
- Coach message
- Today’s tasks
- Current crop stage
- Active warnings only
- Quick reading entry

Should not include:
- Long charts
- ORP details
- Full history tables
- Sales details
- Advanced dosing unless needed

### 3.2 Coach

Purpose: explain what is happening and what to do.

Should include:
- Daily guidance
- Reading interpretation
- Problem diagnosis
- Growth-stage advice
- Suggested next action

### 3.3 Grow

Purpose: manage the crop cycle.

Should include:
- Crop
- Plant date
- Growth stage
- Expected harvest date
- Growth photos
- Root photos
- Harvest records

### 3.4 Learn

Purpose: educational content.

Should include:
- NFT basics
- EC/pH/TDS explanations
- Root health
- Nutrient deficiencies
- Pest and disease guides
- Crop reference tables

### 3.5 History

Purpose: deeper analysis.

Should include:
- Readings table
- Charts
- Trend analysis
- Downloadable CSV

### 3.6 More

Purpose: advanced or lower-frequency functions.

Should include:
- Dosing calculator
- Settings
- Crop database
- Language toggle
- ORP/flow advanced views
- Water cost
- Sales and profit tracking

---

## 4. Core Dashboard Concept

The dashboard should be called **Today** or **Dashboard**.

Recommended first screen order:

```text
1. Coach greeting
2. NFT Health Score
3. Today’s Tasks
4. Current crop progress
5. Readings summary
6. Warnings, only if needed
7. Quick actions
```

---

## 5. Dashboard Wireframe

### Mobile-first layout

```text
┌─────────────────────────────┐
│ Good morning, Erwee          │
│ Your lettuce is on day 18.   │
│ Everything looks mostly good │
└─────────────────────────────┘

┌─────────────────────────────┐
│ NFT Health Score             │
│ 🟢 92 / 100                  │
│ 4 of 5 readings are optimal  │
└─────────────────────────────┘

┌─────────────────────────────┐
│ Today’s Tasks                │
│ ☐ Measure EC and pH          │
│ ☐ Check water level          │
│ ☐ Take root photo            │
└─────────────────────────────┘

┌─────────────────────────────┐
│ Current Crop                 │
│ 🥬 Lettuce                   │
│ Day 18 of 42                 │
│ ████████░░░░░░░              │
│ Estimated harvest: 24 days   │
└─────────────────────────────┘

┌─────────────────────────────┐
│ Latest Readings              │
│ EC          1.6      ✅       │
│ pH          6.2      ✅       │
│ Water Temp  21°C     ✅       │
│ TDS         790      ✅       │
└─────────────────────────────┘

┌─────────────────────────────┐
│ Quick Actions                │
│ [Add Reading] [Open Coach]   │
└─────────────────────────────┘
```

### Warning state

If something is wrong, the warning should move near the top.

```text
┌─────────────────────────────┐
│ ⚠️ Attention Needed          │
│ pH is too high               │
│ Current: 7.4                 │
│ Target: 5.8–6.5              │
│ Action: Lower pH gradually   │
└─────────────────────────────┘
```

---

## 6. NFT Health Score

Add a simple score out of 100.

### 6.1 Purpose

Users should immediately understand whether the system is healthy.

```text
90–100 = Excellent / green
75–89  = Good / green
60–74  = Warning / amber
0–59   = Problem / red
```

### 6.2 Suggested Calculation

Use available readings and crop-specific targets.

Example weighting:

```text
EC:              25 points
pH:              30 points
Water temp:      20 points
Flow:            10 points
Root/photo check 10 points
Recent data:      5 points
```

If flow or photo data is unavailable, redistribute points across available readings.

### 6.3 Simple Scoring Logic

```js
function scoreRange(value, min, max, warnMargin = 0.15) {
  if (value == null || isNaN(value)) return null;

  if (value >= min && value <= max) return 1;

  const range = max - min;
  const lowerWarn = min - range * warnMargin;
  const upperWarn = max + range * warnMargin;

  if (value >= lowerWarn && value <= upperWarn) return 0.6;

  return 0.2;
}
```

Then multiply each score by its weighting.

---

## 7. NFT Coach Role

The Coach should exist from day 0, even before the first reading.

### 7.1 Day 0: Setup Coaching

When the user selects crop and planting date, the Coach can already generate guidance.

Example:

```text
Welcome. You are growing lettuce in an NFT system.

Today’s setup priorities:
1. Confirm water is flowing through all channels.
2. Measure starting EC and pH.
3. Add your first plant photo.
```

### 7.2 After First Reading

Example:

```text
Your lettuce is on day 1.

EC is 1.0 and pH is 6.4.
These values are suitable for young lettuce seedlings.

Next step:
Check again tomorrow and make sure the roots stay white.
```

### 7.3 Mid-cycle Coaching

Example:

```text
Your EC has dropped from 1.6 to 1.1 over the last three readings.

This usually means the plants are actively taking up nutrients.

Recommended action:
Bring EC back toward the target range for this growth stage.
```

### 7.4 Problem Coaching

Example:

```text
pH is too high.

Current pH: 7.4
Target pH: 5.8–6.5

Why it matters:
At high pH, iron and other nutrients become harder for plants to absorb.

Recommended action:
Lower pH gradually. Mix, wait, and measure again.
```

---

## 8. Today’s Tasks Engine

Add a task generator.

Tasks should be based on:
- Crop
- Growth day
- Last reading date
- Last photo date
- Active warnings
- Water temperature
- EC/pH status
- Days to harvest

### 8.1 Task Examples

#### Day 1

```text
Measure EC and pH
Take first plant photo
Check water flow
```

#### Day 4–7

```text
Check if roots are visible below the net pot
Measure EC and pH
Check water level
```

#### Day 14+

```text
Check roots for browning
Measure EC and pH
Compare plant growth photo with previous week
```

#### Late Stage

```text
Prepare for harvest
Record estimated yield
Take final growth photo
```

### 8.2 Task Object

```js
{
  id: "check-ph",
  label: "Measure pH",
  priority: "normal", // normal | important | urgent
  category: "measurement", // measurement | photo | maintenance | harvest | learning
  completed: false,
  due: "today"
}
```

---

## 9. Progressive Disclosure

Do not remove advanced functionality.

Hide it behind:
- “View details”
- “Advanced”
- “More”
- “Open full graph”
- “Why does this matter?”

### Example Reading Card

Default:

```text
EC: 1.6 ✅
```

Expanded:

```text
EC: 1.6 mS/cm
Target for lettuce: 1.2–1.8
Meaning: nutrient strength is currently suitable.
Trend: stable over last 3 readings.
```

---

## 10. Learner Mode UX

Learner mode should be more visual and less technical.

### 10.1 Learner Dashboard

Learners should see:

```text
Today’s learning question:
Why does pH affect nutrient uptake?

System status:
The lettuce tank is healthy today.

Observe:
Look at the latest root photo. Are the roots white or brown?
```

### 10.2 Replace Some Technical Language

Use simpler phrasing:

| Technical | Learner-friendly |
|---|---|
| EC | Food strength in the water |
| pH | How acidic or alkaline the water is |
| TDS | All dissolved particles |
| ORP | Water cleanliness indicator |
| Nutrient lockout | Plant cannot absorb food properly |

Keep the technical term visible, but explain it in plain language.

---

## 11. Visual Design Direction

### 11.1 Style

Target feel:
- Clean
- Calm
- Educational
- Modern
- Trustworthy
- Less “engineering dashboard”
- More “guided learning app”

### 11.2 Colours

Recommended design tokens:

```css
:root {
  --bg: #F6F8F4;
  --surface: #FFFFFF;
  --surface-soft: #EEF5EA;

  --primary: #2E7D32;
  --primary-soft: #E8F5E9;

  --secondary: #1565C0;
  --secondary-soft: #E3F2FD;

  --warning: #F9A825;
  --warning-soft: #FFF8E1;

  --danger: #C62828;
  --danger-soft: #FFEBEE;

  --text: #1F2933;
  --muted: #6B7280;
  --border: #DDE5D8;

  --radius-card: 18px;
  --radius-button: 14px;
}
```

### 11.3 Typography

Keep Montserrat for headings and Inter for body text.

Use fewer font sizes:
- Page title: 28–32px
- Card title: 16–18px
- Body: 14–16px
- Metadata: 12px

### 11.4 Spacing

Use consistent spacing:
- Card padding: 16–20px
- Card gap: 12–16px
- Section gap: 24px
- Minimum touch target: 44px

---

## 12. Component List

Codex should create or refactor toward reusable components.

### 12.1 Core Components

```text
CoachCard
HealthScoreCard
TodayTasksCard
CropProgressCard
ReadingsSummaryCard
WarningCard
QuickActionsCard
ReadingInputModal
StatusBadge
ProgressBar
ExpandableInfoCard
```

### 12.2 Advanced Components

```text
TankSwitcher
TrendChartCard
GrowthPhotoCard
HarvestSummaryCard
DoseCalculatorCard
LearningPromptCard
```

---

## 13. Suggested Component Behaviour

### CoachCard

Props:

```ts
type CoachCardProps = {
  greeting: string;
  message: string;
  severity: "good" | "warning" | "danger" | "neutral";
  actionLabel?: string;
  onAction?: () => void;
};
```

Example:

```text
Good morning.
Your lettuce is on day 18.
EC is slightly low today. Add a reading or open the dosing guide.
```

### HealthScoreCard

Props:

```ts
type HealthScoreCardProps = {
  score: number;
  label: string;
  summary: string;
  status: "green" | "amber" | "red";
};
```

### TodayTasksCard

Props:

```ts
type Task = {
  id: string;
  label: string;
  priority: "normal" | "important" | "urgent";
  completed: boolean;
};
```

### ReadingsSummaryCard

Should show only the most important readings first:

```text
EC
pH
Water Temperature
Flow
```

TDS and ORP can be available in expanded mode.

---

## 14. Recommended User Flows

### 14.1 First-time Setup

```text
1. Welcome
2. Choose role: Teacher / Learner / Grower
3. Choose language
4. Add first tank
5. Choose crop
6. Add plant date
7. Coach explains first tasks
8. Dashboard opens
```

### 14.2 Daily Use

```text
1. User opens dashboard
2. Sees Coach message
3. Completes today’s tasks
4. Adds reading
5. App recalculates health score
6. Coach gives next action
```

### 14.3 Problem Flow

```text
1. User adds high pH reading
2. Warning card appears
3. Coach explains risk
4. User opens dosing/help action
5. User records correction
6. App asks user to re-measure
```

### 14.4 Learner Flow

```text
1. Learner opens dashboard
2. Sees latest tank status
3. Reads one learning prompt
4. Observes latest photo or graph
5. Answers/records observation
```

---

## 15. Dashboard Priority Rules

Use this order:

1. Critical warning
2. Coach card
3. Health score
4. Today’s tasks
5. Crop progress
6. Latest readings
7. Quick actions
8. Optional charts

Do not show charts before today’s tasks.

---

## 16. Suggested Data Model Additions

Add these derived or stored fields.

```ts
type TankCycle = {
  tankId: string;
  cropId: string;
  plantDate: string;
  expectedHarvestDays: number;
  currentDay: number;
  status: "active" | "harvested" | "paused";
};

type CoachInsight = {
  id: string;
  tankId: string;
  severity: "good" | "warning" | "danger" | "info";
  title: string;
  message: string;
  recommendedAction?: string;
  createdAt: string;
};

type HealthScore = {
  tankId: string;
  score: number;
  status: "green" | "amber" | "red";
  reasons: string[];
  calculatedAt: string;
};

type DailyTask = {
  id: string;
  tankId: string;
  label: string;
  category: "measurement" | "photo" | "maintenance" | "learning" | "harvest";
  priority: "normal" | "important" | "urgent";
  completed: boolean;
  dueDate: string;
};
```

---

## 17. MVP Scope for UX Refactor

### Phase 1: Dashboard Refactor

Build:
- CoachCard
- HealthScoreCard
- TodayTasksCard
- CropProgressCard
- ReadingsSummaryCard
- WarningCard

Do not build new complex backend features yet.

Use existing local data and existing crop ranges.

### Phase 2: Coach Rules

Implement rules-based coach messages.

Examples:
- No reading yet
- pH too high
- pH too low
- EC too low
- EC too high
- Water temperature too high
- No photo this week
- Harvest approaching

### Phase 3: Learner Simplification

Simplify learner dashboard:
- Latest tank status
- One learning prompt
- Current crop progress
- Observation task

### Phase 4: Visual Polish

Apply:
- Lighter background
- Cleaner cards
- Larger spacing
- Fewer items per screen
- Consistent button styles
- Better empty states

---

## 18. Rules-Based Coach Examples

### 18.1 No Reading Yet

```js
if (!latestReading) {
  return {
    severity: "info",
    title: "Add your first reading",
    message: "Measure EC, pH and water temperature so I can give you personalised guidance.",
    action: "Add reading"
  };
}
```

### 18.2 pH High

```js
if (ph > crop.phMax) {
  return {
    severity: "danger",
    title: "pH is too high",
    message: `Current pH is ${ph}. Target for ${crop.name} is ${crop.phMin}-${crop.phMax}. High pH can reduce nutrient uptake.`,
    action: "Lower pH gradually and re-measure"
  };
}
```

### 18.3 EC Low

```js
if (ec < crop.ecMin) {
  return {
    severity: "warning",
    title: "EC is low",
    message: `The nutrient strength is below the target range for ${crop.name}. Plants may need more nutrients.`,
    action: "Use the dosing calculator"
  };
}
```

### 18.4 Water Temperature High

```js
if (waterTemp > 24) {
  return {
    severity: "danger",
    title: "Water is too warm",
    message: "Warm water holds less oxygen and increases root disease risk.",
    action: "Cool the reservoir and check root health"
  };
}
```

### 18.5 Weekly Photo Reminder

```js
if (daysSinceLastPhoto > 7) {
  return {
    severity: "info",
    title: "Take a growth photo",
    message: "A weekly photo helps track growth and spot problems early.",
    action: "Open growth diary"
  };
}
```

---

## 19. UX Copy Guidelines

Use simple, direct language.

Prefer:

```text
pH is too high.
Lower it slowly and measure again.
```

Avoid:

```text
The pH parameter exceeds the upper threshold for the selected crop profile.
```

Use explanations only after the action.

Good structure:

```text
What happened?
Why does it matter?
What should I do?
```

Example:

```text
pH is too high.

Why it matters:
Plants may struggle to absorb iron and other nutrients.

What to do:
Lower pH gradually. Mix well, wait a few minutes, and measure again.
```

---

## 20. Acceptance Criteria

The refactor is successful if:

### Dashboard
- A first-time user can identify system status within 5 seconds.
- User sees no more than 5 main cards on initial screen.
- Critical warnings are visible without scrolling.
- Today’s tasks are visible without opening another tab.
- Advanced data is hidden behind details or More.

### Coach
- Coach gives useful guidance before the first reading.
- Coach changes message after readings are added.
- Coach explains both problem and action.
- Coach uses crop-specific targets.

### Learner Mode
- Learner dashboard uses simple language.
- Learner sees one clear learning prompt at a time.
- Learner can connect readings to meaning.

### Visual Design
- Cards have consistent spacing and styling.
- Colours are used for meaning, not decoration only.
- Interface feels calm and educational.
- Mobile layout works without horizontal scrolling.

---

## 21. What Not To Do

Do not:
- Add more dashboard widgets before simplifying the layout.
- Put charts above tasks.
- Show every parameter at once.
- Make the Coach a generic chatbot only.
- Remove existing advanced features.
- Hide critical warnings too deeply.
- Use long paragraphs on the dashboard.
- Make the learner experience look like the teacher experience.

---

## 22. Suggested Implementation Order for Codex

1. Identify current dashboard rendering functions.
2. Extract current reading summary logic.
3. Create derived health score function.
4. Create coach insight generator.
5. Create daily task generator.
6. Build new dashboard layout using reusable cards.
7. Move advanced cards into More or details views.
8. Simplify learner dashboard separately.
9. Apply shared design tokens.
10. Test with 3 scenarios:
    - No data yet
    - Healthy tank
    - Problem tank

---

## 23. Test Scenarios

### Scenario A: New User, No Readings

Expected:
- Coach welcomes user.
- Dashboard asks for first reading.
- Health score shows “Not enough data yet”.
- Tasks show setup tasks.

### Scenario B: Healthy Lettuce Tank

Input:

```text
Crop: Lettuce
Day: 18
EC: 1.6
pH: 6.2
Water temp: 21°C
```

Expected:
- Health score green.
- Coach says system is healthy.
- Tasks remain routine.
- No warning card.

### Scenario C: High pH

Input:

```text
Crop: Lettuce
Day: 18
EC: 1.6
pH: 7.4
Water temp: 21°C
```

Expected:
- Health score amber or red.
- Warning card appears near top.
- Coach explains high pH risk.
- Suggested action is to lower pH gradually and re-measure.

### Scenario D: Low EC Trend

Input:

```text
Previous EC readings:
1.7 → 1.4 → 1.1
```

Expected:
- Coach identifies downward trend.
- Message explains active nutrient uptake.
- Suggested action: top up nutrients or use dosing calculator.

---

## 24. Strategic Design Principle

The product should feel less like this:

> Here are your hydroponic readings.

And more like this:

> I am helping you grow successfully today.

That is the core UX direction.
