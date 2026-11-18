# 🏆 Official Rules & Regulations
### Annual Intra-College Carrom & Chess Championship 2026
**Nexcore Institute of Technology • Department of Physical Education & Sports**  
*Centralized Championship Platform & Tournament Management System*

---

## 📋 Table of Contents
1. [General Tournament Overview](#1-general-tournament-overview)
2. [Carrom Championship Regulations](#2-carrom-championship-regulations)
   - [2.1 Divisions & Eligibility](#21-divisions--eligibility)
   - [2.2 Registration & Mutual Partner Nomination](#22-registration--mutual-partner-nomination)
   - [2.3 Dynamic Knockout Bracket & Bye Formula](#23-dynamic-knockout-bracket--bye-formula)
   - [2.4 Centralized Main Board & FIFO Match Queue](#24-centralized-main-board--fifo-match-queue)
   - [2.5 Match Play & Duration](#25-match-play--duration)
   - [2.6 Coin Valuation & Scoring Matrix](#26-coin-valuation--scoring-matrix)
   - [2.7 Queen Pocketing & Covering Rules](#27-queen-pocketing--covering-rules)
   - [2.8 Fouls, Penalties & Striker Infractions](#28-fouls-penalties--striker-infractions)
   - [2.9 Digital Referee Adjudication & Scoresheets](#29-digital-referee-adjudication--scoresheets)
   - [2.10 Punctuality, Walkovers & Code of Conduct](#210-punctuality-walkovers--code-of-conduct)
3. [Chess Championship Regulations](#3-chess-championship-regulations)
   - [3.1 Match Format & 10-Minute Rapid Clock](#31-match-format--10-minute-rapid-clock)
   - [3.2 Piece Valuation & Material Scoring](#32-piece-valuation--material-scoring)
   - [3.3 Touch-Move Rule & Piece Adjustment](#33-touch-move-rule--piece-adjustment)
   - [3.4 Legal Moves, Check & Checkmate](#34-legal-moves-check--checkmate)
   - [3.5 Draws & Adjudication](#35-draws--adjudication)
   - [3.6 Fair Play & Electronic Devices Ban](#36-fair-play--electronic-devices-ban)
4. [Administrative Controls & System Directives](#4-administrative-controls--system-directives)
5. [Dispute Resolution & Appeals](#5-dispute-resolution--appeals)

---

## 1. General Tournament Overview

The **Annual Intra-College Championship** brings together collegiate student-athletes to compete in standardized, single-elimination tournament draws. All tournament fixtures, bracket seedings, match queues, live scores, and referee scorecards are governed centrally through the digital Tournament Management Platform.

- **Sanctioning Body**: Tournament Organizing Committee & Sports Council
- **Platform Architecture**: Centralized Real-Time Digital Scoring, Dynamic Bracket Engine, and Multi-Division Scheduling
- **Tournament Status States**:
  - `registration_open`: Participant registrations and partner nominations accepted.
  - `registration_closed`: Rosters locked; draw brackets generated and published.
  - `ongoing`: Sequential matches active on championship boards.
  - `completed`: Medals and tournament trophies awarded; historical archives stored.

---

## 2. Carrom Championship Regulations

### 2.1 Divisions & Eligibility
Competitors are eligible to participate across five official championship categories:

| Division Code | Division Title | Format | Squad Size | Eligibility |
| :--- | :--- | :--- | :--- | :--- |
| `boys_singles` | Boys Singles | 1 vs 1 | 1 Athlete | Male bona-fide students |
| `girls_singles` | Girls Singles | 1 vs 1 | 1 Athlete | Female bona-fide students |
| `boys_doubles` | Boys Doubles | 2 vs 2 | 2 Athletes | Male bona-fide students |
| `girls_doubles` | Girls Doubles | 2 vs 2 | 2 Athletes | Female bona-fide students *(Optional if partner unavailable)* |
| `mixed_doubles` | Mixed Doubles | 2 vs 2 | 1 Male + 1 Female | Multi-gender squad |

> [!NOTE]
> Registered athletes participate across Singles, Doubles, and Mixed Doubles, providing a comprehensive multi-category championship experience.

---

### 2.2 Registration & Mutual Partner Nomination
To guarantee transparent squad formation, all doubles teams must be formed through **Independent Mutual Nomination**:

1. **Independent Entry**: Each participant submits their own registration profile containing their Full Name, Student ID, Institutional Email, Contact Number, and Academic Department.
2. **Mutual Nomination Match**:
   - Partner A must select and submit Partner B's registered name.
   - Partner B must select and submit Partner A's registered name.
3. **Automated Team Lock**:
   - The validation engine automatically confirms the mutual match and generates a unified `Team` entry.
   - Unmatched or one-sided nominations are flagged for resolution before draw generation.

---

### 2.3 Dynamic Knockout Bracket & Bye Formula
The championship is contested under a strict **Single-Elimination Knockout** format powered by an automated mathematical draw engine.

#### The Mathematical Bye Formula ($N \pmod 2$)
For any category with $N$ approved entries:
- **Playable Matches in Round**:
  $$\text{Matches} = \lfloor N / 2 \rfloor$$
- **Byes Awarded in Round**:
  $$\text{Byes} = N \pmod 2$$
  - If $N$ is **even** ($N \pmod 2 = 0$): **Zero (0) byes**. All participants compete in Round 1.
  - If $N$ is **odd** ($N \pmod 2 = 1$): **Exactly one (1) bye** is randomly assigned in that round.
- **Advancing Entries to Next Round**:
  $$\text{Advancing} = \lfloor N / 2 \rfloor + (N \pmod 2)$$

```
Sample Odd Bracket Progression (e.g., N = 9 Entries):
Round 1: 9 entries  -> 4 Playable Matches + 1 Random Bye -> 5 Advancing
Round 2: 5 entries  -> 2 Playable Matches + 1 Random Bye -> 3 Advancing (Semi-Finals)
Round 3: 3 entries  -> 1 Playable Match   + 1 Random Bye -> 2 Advancing (Finals)
Round 4: 2 entries  -> 1 Championship Match -> 1 Champion 🏆
```

- **Seeding & Bye Placement**: Byes are placed randomly into the tree to eliminate administrative bias. An entry receiving a bye automatically bypasses the active round and advances into the corresponding next-round fixture.
- **Bracket Lock**: Once draws are published and locked by the Tournament Director, no bracket alterations or late replacements are permitted.

---

### 2.4 Centralized Main Board & FIFO Match Queue
All official fixtures across all 5 divisions are contested exclusively on the **Championship Main Carrom Board**.

```
[ Scheduled Matches ] ────────► [ READY Queue (FIFO) ] ────────► [ LIVE on Main Board ] ────────► [ Completed & Verified ]
                                 (Opponents Confirmed)             (Single Active Match)             (Advances in Tree)
```

1. **Single Arena Concurrency**: Exactly **one (1) match is LIVE** at any given moment.
2. **First-In, First-Out (FIFO) Dispatch**:
   - As upstream matches conclude, downstream matches with both opponents confirmed enter the `READY` state.
   - `READY` matches are assigned to the Main Board in sequential order.
3. **Live Public Board Display**: The match order and live coin scores are broadcast on the public display screen and web portal in real time.

---

### 2.5 Match Play & Duration
1. **Primary Knockout Format**: Single-Game Knockout (**1 Match = 1 Game**). The winner of the single game immediately advances in the bracket.
2. **Championship Final / Multi-Board Format (When Configured)**:
   - When set to **Best of 3 Boards** by tournament directors for semi-finals or finals:
     - The first player/team to win **2 boards** wins the match (2–0 or 2–1).
     - Board 3 is played strictly if the first two boards result in a 1–1 tie.
3. **Round Duration**: Standard official round duration is **20 minutes** (configurable up to 30 minutes in arena settings).
4. **Break Time**: A standard **5-minute intermission** is scheduled between consecutive round calls.

---

### 2.6 Coin Valuation & Scoring Matrix

| Element | Description | Point Value | Rules & Conditions |
| :--- | :--- | :---: | :--- |
| **White Carrom Man** | Standard White Coin | **+1 pt** | Successfully pocketed legally by the active player/team. |
| **Black Carrom Man** | Standard Black Coin | **+1 pt** | Successfully pocketed legally by the active player/team. |
| **The Queen (Red Coin)** | Red Center Piece | **+3 pts** | Awarded **ONLY** if legally pocketed **and** covered in the immediate follow-up shot. |
| **Foul / Striker In** | Striker pocketed or penalty | **-1 pt** | 1 point deducted; 1 penalty coin returned to center circle; turn terminates. |
| **Maximum Board Score** | Ceiling limit | **25 pts** | The maximum score achievable by any single player/team in one board is capped at 25. |

---

### 2.7 Queen Pocketing & Covering Rules
The Queen (Red coin) represents the highest strategic value on the board:

1. **Right to Pocket**: A player may pocket the Queen at any time during their turn, provided at least one of their own carrom men has already been pocketed or is pocketed in the same shot.
2. **Covering Requirement**:
   - To successfully secure the Queen (3 points), the player must pocket one of their designated coins (white or black according to assignment) in the **very next stroke** (the cover shot).
   - If the player pockets the Queen and subsequently pockets a valid cover coin in the immediate next shot, the Queen is officially covered and scored.
3. **Failed Cover**:
   - If the player fails to pocket a designated coin in the immediate stroke following the Queen, the Queen is deemed **uncovered**.
   - The referee immediately retrieves the Queen and places it in the center circle (center circle concentric ring). Play proceeds to the next competitor.
4. **Pocketing Queen and Cover Simultaneously**:
   - If the Queen and a designated coin are pocketed in the identical single strike, the Queen is automatically counted as covered.

---

### 2.8 Fouls, Penalties & Striker Infractions
A foul occurs when a player violates mechanical or technical rules of play. Each foul incurs a **-1 point penalty** and forfeits the turn:

1. **Striker Pocketed (Due)**:
   - If only the striker is pocketed, a penalty of -1 point is assessed, and one previously pocketed coin belonging to that player is returned to the center circle by the referee.
   - If the player has pocketed zero coins so far, the penalty remains on credit ("due") and must be placed on the board as soon as a coin is pocketed.
2. **Striker & Coin Pocketed Together**:
   - If the striker and the player's own coin are pocketed in the same shot, the coin is returned to the center along with an additional penalty coin. The turn ends.
   - If the striker and an opponent's coin are pocketed in the same shot, the opponent's coin stays pocketed, the striker penalty is assessed, and a penalty coin of the striking player is returned.
3. **Positioning Violations**:
   - The striker must touch both baselines (inner and outer) simultaneously or completely cover the baseline circle at either end.
   - The striker must not touch the diagonal arrow line or boundary lines improperly.
4. **Pushing / Slicing Violations**:
   - The striker must be struck cleanly with a finger or thumb flick. Pushing ("dragging") the striker is strictly prohibited and ruled a foul.
5. **Physical Interferences**:
   - Touching any coin on the board with fingers, clothing, or jewellery before all coins have come to a complete rest is an immediate foul.
   - Changing chairs or rising from the seated position while striking is prohibited. At least one part of the player's body or thigh must remain seated on the assigned seat.

---

### 2.9 Digital Referee Adjudication & Scoresheets
1. **Certified Scorekeeper**: An official tournament referee is stationed at the Main Carrom Board for all fixtures.
2. **Direct Digital Entry**: The referee enters points, Queen status, and fouls live into the official digital console.
3. **Winner Confirmation**: The match result must be reviewed and officially confirmed by the referee before downstream knockout brackets are updated.
4. **Immutable Audit Trail**: Every score entry, modification, and confirmation timestamp is logged with the referee's credentials in the system audit log.

---

### 2.10 Punctuality, Walkovers & Code of Conduct
1. **Reporting Window**: Players must report to the Main Carrom Board within **5 minutes** of their match being summoned or broadcast on the live screen.
2. **Official Walkover (Forfeit)**:
   - If a competitor or doubles pair fails to appear within **10 minutes** of the second official call, the referee reserves the right to declare a walkover.
   - The opponent present is awarded the victory and immediately advances.
3. **Sportsmanship & Decorum**:
   - Verbal abuse, distracting body gestures, intentional table vibration, or disrespect toward referees or opponents will result in an immediate warning.
   - A second warning in the same fixture results in immediate disqualification.
4. **Equipment**:
   - Only the tournament-approved championship board, coins, official powder, and standard-weight strikers may be used.
   - Personal strikers must be submitted to the chief referee for weight and dimension verification prior to the opening round.

---

## 3. Chess Championship Regulations

The Chess division runs concurrently under standardized collegiate rapid rules governed by the integrated Chess Arena system.

```
       CHESS DIVISION MATCH SPECIFICATIONS
┌────────────────────────────────────────────────────────┐
│  • Format: 1v1 Rapid Swiss / Knockout                  │
│  • Match Clock: 10 Minutes Flat Per Game               │
│  • Movement: FIDE Rapid Compliant                      │
│  • Deciding Factor: Checkmate OR Captured Material Pts │
│  • Standings Pts: Win = 3 pts | Draw = 1 pt | Loss = 0 │
└────────────────────────────────────────────────────────┘
```

---

### 3.1 Match Format & 10-Minute Rapid Clock
1. **Reporting & Setup**: Players must report to their assigned chess board 10 minutes prior to scheduled round start. White pieces move first.
2. **10-Minute Rapid Timer**:
   - Each match is contested with an official **10-minute match timer** (or digital chess clock).
   - Players must execute moves without deliberate stalling or unnecessary delay.
3. **Expiration of Time**:
   - If neither player achieves checkmate before the 10-minute clock expires, the referee stops play and scores the game according to **Highest Material Points**.

---

### 3.2 Piece Valuation & Material Scoring
When a match reaches the 10-minute time limit without checkmate, the winner is decided by calculating total material value of pieces captured from the opponent:

| Chess Piece | Symbol | Material Value | Tactical Role |
| :--- | :---: | :---: | :--- |
| **Pawn** | ♙ / ♟ | **1 pt** | Baseline frontline unit; eligible for promotion upon reaching the 8th rank. |
| **Knight** | ♘ / ♞ | **3 pts** | Minor piece; capable of leaping over occupied squares in an 'L' shape. |
| **Bishop** | ♗ / ♝ | **3 pts** | Minor piece; operates along open diagonals of a single square color. |
| **Rook** | ♖ / ♜ | **5 pts** | Major piece; operates along vertical files and horizontal ranks. |
| **Queen** | ♕ / ♛ | **9 pts** | Most powerful piece; combines rook and bishop movement capabilities. |
| **King** | ♔ / ♚ | **$\infty$ (Game)** | Royal piece; cannot be captured. Checkmate instantly wins the match. |

- **Tournament Standings Points**:
  - **Match Win**: **3 points**
  - **Match Draw**: **1 point**
  - **Match Loss**: **0 points**

---

### 3.3 Touch-Move Rule & Piece Adjustment
1. **Strict Touch-Move Protocol**:
   - If a player deliberately touches their own piece, they must move that piece if a legal move exists.
   - If a player deliberately touches an opponent's piece, they must capture that piece if legally possible.
   - Once a piece is released onto a legal square, the move is completed and cannot be retracted.
2. **Piece Adjustment ("J'adoube / Adjust")**:
   - If a player wishes merely to center or adjust a piece on its square, they must distinctly announce **"Adjust"** or **"J'adoube"** *before* touching the piece.
   - Adjustments may only be performed on the player's own turn.

---

### 3.4 Legal Moves, Check & Checkmate
1. **Standard Movement**: Standard FIDE rules apply to piece moves, en passant captures, castling, and pawn promotion.
2. **Check**: A player whose King is placed under direct attack must escape check immediately (by moving the King, capturing the attacking piece, or interposing a piece). Leaving one's own King in check is illegal.
3. **Checkmate**: When a King is placed in check and has no legal escape, **checkmate is declared immediately**, ending the match in favor of the attacking player regardless of remaining clock time or captured material count.

---

### 3.5 Draws & Adjudication
A game is declared a draw under any of the following recognized conditions:
1. **Stalemate**: The player to move has no legal moves and their King is not in check.
2. **Mutual Agreement**: Both competitors mutually agree to a draw during active play with referee acknowledgement.
3. **Insufficient Material**: Neither player possesses sufficient pieces to force checkmate (e.g., King vs King, King & Bishop vs King, King & Knight vs King).
4. **Referee Adjudication**: When deadlocked positions cannot progress within the rapid match window.

---

### 3.6 Fair Play & Electronic Devices Ban
1. **Electronic Device Prohibition**: Mobile phones, smartwatches, fitness trackers, and electronic devices are strictly banned in the playing hall during matches.
2. **Zero Outside Assistance**: Players may not seek advice from coaches, peers, spectators, or chess engines.
3. **Spectator Conduct**: Spectators must remain behind the designated barrier line and maintain complete silence. Any spectator offering hints or comments will be ejected from the arena immediately.

---

## 4. Administrative Controls & System Directives

Tournament administrators manage all operational parameters through the authenticated `/admin/rules` dashboard:

```
                            ADMINISTRATIVE CONTROLS CONSOLE
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  • Tournament Status: [ Registration Open | Registration Closed | Ongoing | Completed ]│
│  • Round Duration: Configurable (Default: 20 min Carrom, 10 min Chess)                 │
│  • Board Arena Management: Single Main Carrom Board FIFO Allocation                    │
│  • Draw Publishing & Locking: Individual toggle per division                           │
│  • Automated Bracket Advancement: Triggered immediately upon referee score commit      │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

1. **Draw Generation**: Admin generates draws strictly after registration closes. The dynamic bye algorithm allocates single byes for odd entry pools.
2. **Publishing Draws**: Brackets become visible to students only after being marked as `Published`.
3. **Score Correction & Overrides**: If a score was submitted in error, only an authorized Tournament Administrator may unlock the match record, correct the score tally, and update downstream pairings.

---

## 5. Dispute Resolution & Appeals

1. **On-Board Referee Authority**: The decision of the assigned board referee on physical fouls, striker handling, and coin legality is immediate during gameplay.
2. **Formal Appeal**: If a team disputes a technical interpretation or scoring record, a formal verbal protest must be registered with the **Chief Tournament Director** within **10 minutes** of match conclusion.
3. **Committee Decision**: The Tournament Organizing Committee's decision on all protests, conduct violations, and eligibility matters is **final and binding on all parties**.

---

### 🏅 Motto of the Games
> *"True sportsmanship lies not only in striking the Queen or executing the checkmate, but in playing with honour, integrity, and respect for every opponent."*

**Nexcore Sports Council • 2026 Edition**  
*For questions, draw clarifications, or referee inquiries, contact the Tournament Helpdesk or visit the Admin Control Office.*
