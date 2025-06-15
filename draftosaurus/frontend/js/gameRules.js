/**
 * Game Rules Validation for Draftosaurus
 * Validates dinosaur placement according to official game rules
 */

class GameRules {
    constructor() {
        this.penRules = {
            forest_of_sameness: {
                maxDinosaurs: 6,
                rule: 'same_species_only',
                fillOrder: 'left_to_right',
                description: {
                    es: 'Solo dinosaurios de la misma especie, llenado de izquierda a derecha',
                    en: 'Same species only, filled left to right'
                }
            },
            meadow_of_differences: {
                maxDinosaurs: 6,
                rule: 'different_species_only',
                fillOrder: 'left_to_right',
                description: {
                    es: 'Solo especies diferentes, llenado de izquierda a derecha', 
                    en: 'Different species only, filled left to right'
                }
            },
            prairie_of_love: {
                maxDinosaurs: 12,
                rule: 'any_species',
                fillOrder: 'any',
                description: {
                    es: 'Cualquier especie, 5 puntos por cada pareja',
                    en: 'Any species, 5 points per pair'
                }
            },
            woody_trio: {
                maxDinosaurs: 3,
                rule: 'any_species',
                fillOrder: 'any',
                description: {
                    es: 'Exactamente 3 dinosaurios = 7 puntos',
                    en: 'Exactly 3 dinosaurs = 7 points'
                }
            },
            king_of_jungle: {
                maxDinosaurs: 1,
                rule: 'single_dinosaur',
                fillOrder: 'any',
                description: {
                    es: '1 dinosaurio, 7 puntos si tienes más de esa especie',
                    en: '1 dinosaur, 7 points if you have most of that species'
                }
            },
            solitary_island: {
                maxDinosaurs: 1,
                rule: 'single_unique',
                fillOrder: 'any',
                description: {
                    es: '1 dinosaurio, 7 puntos si es el único de su especie en tu zoo',
                    en: '1 dinosaur, 7 points if only one of its species in your zoo'
                }
            },
            river: {
                maxDinosaurs: 20,
                rule: 'any_species',
                fillOrder: 'any',
                description: {
                    es: 'Cualquier cantidad, 1 punto cada uno',
                    en: 'Any amount, 1 point each'
                }
            }
        };

        this.diceRestrictions = {
            forest: ['forest_of_sameness', 'river'],
            grassland: ['meadow_of_differences', 'prairie_of_love', 'river'],
            mountain: ['woody_trio', 'king_of_jungle', 'river'],
            nest: ['solitary_island', 'river'],
            river: ['river'],
            free_choice: ['forest_of_sameness', 'meadow_of_differences', 'prairie_of_love', 'woody_trio', 'king_of_jungle', 'solitary_island', 'river']
        };
    }

    /**
     * Validate if a dinosaur can be placed in a specific pen
     */
    validatePlacement(penId, dinosaurSpecies, currentPenContents, allPenContents = null, diceFace = null) {
        const penRule = this.penRules[penId];
        if (!penRule) {
            return { valid: false, reason: 'Invalid pen' };
        }

        // Check dice restriction if dice face is provided
        if (diceFace && diceFace !== 'free_choice') {
            const allowedPens = this.diceRestrictions[diceFace];
            if (!allowedPens.includes(penId)) {
                return { 
                    valid: false, 
                    reason: `Dice restriction: ${diceFace} doesn't allow placement in ${penId}` 
                };
            }
        }

        // Check maximum capacity
        if (currentPenContents.length >= penRule.maxDinosaurs) {
            return { valid: false, reason: 'Pen is full' };
        }

        // Apply specific pen rules
        switch (penRule.rule) {
            case 'same_species_only':
                return this.validateSameSpeciesOnly(currentPenContents, dinosaurSpecies);
                
            case 'different_species_only':
                return this.validateDifferentSpeciesOnly(currentPenContents, dinosaurSpecies);
                
            case 'single_dinosaur':
                return this.validateSingleDinosaur(currentPenContents);
                
            case 'single_unique':
                return this.validateSingleUnique(currentPenContents, dinosaurSpecies, allPenContents);
                
            case 'any_species':
                return { valid: true };
                
            default:
                return { valid: true };
        }
    }

    validateSameSpeciesOnly(currentPenContents, dinosaurSpecies) {
        if (currentPenContents.length === 0) {
            return { valid: true };
        }
        
        const firstSpecies = currentPenContents[0];
        if (firstSpecies !== dinosaurSpecies) {
            return { 
                valid: false, 
                reason: 'Forest of Sameness requires all dinosaurs to be the same species' 
            };
        }
        
        return { valid: true };
    }

    validateDifferentSpeciesOnly(currentPenContents, dinosaurSpecies) {
        if (currentPenContents.includes(dinosaurSpecies)) {
            return { 
                valid: false, 
                reason: 'Meadow of Differences requires all dinosaurs to be different species' 
            };
        }
        
        return { valid: true };
    }

    validateSingleDinosaur(currentPenContents) {
        if (currentPenContents.length >= 1) {
            return { 
                valid: false, 
                reason: 'This pen can only hold one dinosaur' 
            };
        }
        
        return { valid: true };
    }

    validateSingleUnique(currentPenContents, dinosaurSpecies, allPenContents) {
        if (currentPenContents.length >= 1) {
            return { 
                valid: false, 
                reason: 'Solitary Island can only hold one dinosaur' 
            };
        }

        // If we have all pen contents, check if this species exists elsewhere
        if (allPenContents) {
            for (const [penId, contents] of Object.entries(allPenContents)) {
                if (penId !== 'solitary_island' && contents.includes(dinosaurSpecies)) {
                    return { 
                        valid: false, 
                        reason: 'For Solitary Island, this species must be unique in your entire zoo' 
                    };
                }
            }
        }
        
        return { valid: true };
    }

    /**
     * Get all valid pens for a dinosaur given dice restriction
     */
    getValidPens(diceFace = 'free_choice') {
        return this.diceRestrictions[diceFace] || [];
    }

    /**
     * Get pen description in specified language
     */
    getPenDescription(penId, language = 'en') {
        const penRule = this.penRules[penId];
        return penRule ? penRule.description[language] : '';
    }

    /**
     * Calculate theoretical maximum score for a pen configuration
     */
    calculateMaxScore(penId, dinosaurCount) {
        switch (penId) {
            case 'forest_of_sameness':
                const forestScores = [0, 2, 4, 8, 12, 18, 24];
                return forestScores[dinosaurCount] || 0;
                
            case 'meadow_of_differences':
                const meadowScores = [0, 1, 3, 6, 10, 15, 21];
                return meadowScores[dinosaurCount] || 0;
                
            case 'prairie_of_love':
                return Math.floor(dinosaurCount / 2) * 5;
                
            case 'woody_trio':
                return dinosaurCount === 3 ? 7 : 0;
                
            case 'king_of_jungle':
            case 'solitary_island':
                return dinosaurCount === 1 ? 7 : 0;
                
            case 'river':
                return dinosaurCount;
                
            default:
                return 0;
        }
    }

    /**
     * Provide strategic hints for optimal play
     */
    getStrategicHint(penId, currentContents, language = 'en') {
        const hints = {
            en: {
                forest_of_sameness: currentContents.length === 0 
                    ? "Start with any species - aim for 3+ of the same for good points"
                    : `Continue with ${currentContents[0]} - ${6 - currentContents.length} spots left`,
                meadow_of_differences: `Need different species - avoid: ${currentContents.join(', ')}`,
                prairie_of_love: "Any species works - pairs give 5 points each",
                woody_trio: currentContents.length < 3 
                    ? `Need exactly 3 dinosaurs total - ${3 - currentContents.length} more needed`
                    : "Full! Exactly 3 dinosaurs = 7 points",
                king_of_jungle: currentContents.length === 0
                    ? "Place your most common species for 7 points if you have the most"
                    : "Full! Will score 7 points if you have most of this species",
                solitary_island: currentContents.length === 0
                    ? "Place a species you have nowhere else for 7 points"
                    : "Full! Scores 7 points if this is your only one of this species",
                river: "1 point per dinosaur - good for unwanted dinosaurs"
            },
            es: {
                forest_of_sameness: currentContents.length === 0
                    ? "Comienza con cualquier especie - apunta a 3+ iguales para buenos puntos"
                    : `Continúa con ${currentContents[0]} - ${6 - currentContents.length} espacios restantes`,
                meadow_of_differences: `Necesitas especies diferentes - evita: ${currentContents.join(', ')}`,
                prairie_of_love: "Cualquier especie funciona - las parejas dan 5 puntos cada una",
                woody_trio: currentContents.length < 3
                    ? `Necesitas exactamente 3 dinosaurios - faltan ${3 - currentContents.length}`
                    : "¡Lleno! Exactamente 3 dinosaurios = 7 puntos",
                king_of_jungle: currentContents.length === 0
                    ? "Coloca tu especie más común para 7 puntos si tienes más"
                    : "¡Lleno! Dará 7 puntos si tienes más de esta especie",
                solitary_island: currentContents.length === 0
                    ? "Coloca una especie que no tengas en otro lugar para 7 puntos"
                    : "¡Lleno! Da 7 puntos si este es tu único de esta especie",
                river: "1 punto por dinosaurio - bueno para dinosaurios no deseados"
            }
        };

        return hints[language][penId] || '';
    }
}

// Export for use in main app
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameRules;
}