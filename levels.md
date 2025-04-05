# Guide - Math Game Levels

This document describes all the currently implemented levels in the Guide math game.

## Achievement System

Players can earn stars based on their performance:
- 🌟🌟🌟👑 **Crown (4 stars)**: 100% accuracy, average time ≤ 3.0 seconds
- 🌟🌟🌟 **3 stars**: ≥90% accuracy, average time ≤ 3.5 seconds
- 🌟🌟 **2 stars**: ≥85% accuracy, average time ≤ 4.0 seconds
- 🌟 **1 star**: ≥80% accuracy, average time ≤ 5.0 seconds

Each level consists of 20 questions.

## Stage A: Fundamentos da Adição (Addition Fundamentals)

This stage focuses on mastering basic addition with numbers 1-10.

### A1: +1
- Fixed operand: 1
- Range: 1-9
- Examples: 1+5, 8+1
- Time threshold: 3000ms (fast)

### A2: +2
- Fixed operand: 2
- Range: 1-9
- Examples: 2+7, 3+2
- Time threshold: 3000ms (fast)

### A3: +3
- Fixed operand: 3
- Range: 1-9
- Examples: 3+6, 9+3
- Time threshold: 4000ms (default)

### A4: +4
- Fixed operand: 4
- Range: 1-9
- Examples: 4+5, 2+4
- Time threshold: 4000ms (default)

### A5: +5
- Fixed operand: 5
- Range: 1-9
- Examples: 5+4, 7+5
- Time threshold: 4000ms (default)

### A6: +6
- Fixed operand: 6
- Range: 1-9
- Examples: 6+3, 9+6
- Time threshold: 4000ms (default)

### A7: +7
- Fixed operand: 7
- Range: 1-9
- Examples: 7+2, 5+7
- Time threshold: 4000ms (default)

### A8: +8
- Fixed operand: 8
- Range: 1-9
- Examples: 8+1, 4+8
- Time threshold: 4000ms (default)

### A9: +9
- Fixed operand: 9
- Range: 1-9
- Examples: 9+2, 5+9
- Time threshold: 4000ms (default)

### A10: 10 + n
- Fixed operand: 10
- Range: 1-9
- Examples: 10+5, 10+9
- Time threshold: 3000ms (fast)

### A11: Teste (1-10)
- Mixed addition test
- First operand range: 1-10
- Second operand range: 1-9
- Contains 40 random pairs (longer level)
- Examples: 2+7, 10+3, 5+8
- Time threshold: 5000ms (extended)

## Stage B: Dezenas e Unidades (Tens and Units)

This stage focuses on adding tens and units, gradually introducing more complex operations.

### B1: Dezenas + Unidades (sem "vai um")
- First operand range: 10-19 (teens only)
- Second operand range: 1-9
- Only includes problems that don't carry (sum ≤ 19)
- Examples: 11+5=16 ✓, 15+5=20 ✗ (would carry)
- Time threshold: 4000ms (default)

### B2: Dezenas + Dezenas
- First operand: Multiples of 10 (10-90)
- Second operand: Multiples of 10 (10-90)
- Examples: 10+50=60, 20+70=90
- Time threshold: 4000ms (default)

### B3: Dezenas + Dezenas (sem "vai um")
- Two-digit numbers (10-99)
- Only includes problems where neither the units nor tens places carry
- Rules: units digits sum ≤ 9, tens digits sum ≤ 9
- Examples: 25+32=57 ✓, 18+61=79 ✓, 23+48=71 ✗ (would carry)
- Time threshold: 5000ms (extended)

### B4: Dezenas (10-19) + Unidades (com "vai um")
- Concept: Introduce units carry, starting with teens. Result will be in the 20s.
- First operand range: 10-19
- Second operand range: 1-9
- Rule: unidade1 + unidade2 > 9
- Examples: 14+6=20, 17+5=22
- Time threshold: 4500ms (default+)

### B5: Dezenas (20-99) + Unidades (com "vai um")
- Concept: Generalize units carry (Tens + Unit), result < 100.
- First operand range: 20-99
- Second operand range: 1-9
- Rule: unidade1 + unidade2 > 9 AND dezena1 + 1 <= 9
- Examples: 25+7=32, 87+6=93
- Time threshold: 5000ms (extended)

### B6: Dezenas Múltiplas + Dezenas Múltiplas (com "vai um")
- Concept: Introduce tens carry & sums ≥ 100 using only multiples of 10.
- Operands: Multiples of 10 (10-90)
- Rule: dezena1 + dezena2 >= 10
- Examples: 40+70=110, 80+50=130, 90+60=150
- Time threshold: 4500ms (default+)

### B7: Dezenas (10-19) + Dezenas (10-99) (com "vai um" nas unidades)
- Concept: Units carry when adding two-digit numbers (starting with teens). Tens place does not carry.
- First operand range: 10-19
- Second operand range: 10-99
- Rule: unidade1 + unidade2 > 9 AND dezena1 (which is 1) + dezena2 + 1 <= 9
- Examples: 18+25=43, 17+76=93
- Time threshold: 5000ms (extended)

### B8: Dezenas (20-99) + Dezenas (10-99) (com "vai um" nas unidades)
- Concept: Generalize units carry between two two-digit numbers. Tens place does not carry.
- First operand range: 20-99
- Second operand range: 10-99
- Rule: unidade1 + unidade2 > 9 AND dezena1 + dezena2 + 1 <= 9
- Examples: 25+37=62, 48+25=73
- Time threshold: 5500ms (extended+)

### B9: Dezenas + Dezenas (com "vai um" nas dezenas, sem "vai um" nas unidades)
- Concept: Tens carry only. Builds upon B6 by adding non-zero units that don't carry.
- Operands: 10-99
- Rule: unidade1 + unidade2 <= 9 AND dezena1 + dezena2 >= 10
- Examples: 52+61=113, 74+83=157, 45+71=116
- Time threshold: 5500ms (extended+)

### B10: Dezenas + Dezenas (com "vai um" em ambos)
- Concept: Both units and tens carry. Combines skills from previous levels.
- Operands: 10-99
- Rule: unidade1 + unidade2 > 9 AND dezena1 + dezena2 + 1 >= 10
- Examples: 47+58=105, 69+85=154
- Time threshold: 6000ms (slow)

### B11: Teste (Dezenas - com e sem "vai um")
- Concept: Consolidation of all Stage B concepts (B1-B10)
- Mixed problems covering all rules from Stage B
- Contains 40 random pairs
- Time threshold: 6000ms (slow)

## Progression Path
The current level progression follows this path:
A1 → A2 → A3 → A4 → A5 → A6 → A7 → A8 → A9 → A10 → A11 →
→ B1 → B2 → B3 → B4 → B5 → B6 → B7 → B8 → B9 → B10 → B11