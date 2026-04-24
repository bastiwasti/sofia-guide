export const bottomSheetStyles = `
  .bottom-sheet-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 4000;
    display: flex;
    align-items: flex-end;
    animation: fadeIn 0.2s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .bottom-sheet {
    width: 100%;
    max-height: 70vh;
    background: var(--color-white);
    border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
    box-shadow: 0 -4px 32px rgba(0, 0, 0, 0.2);
    animation: slideUp 0.3s ease;
    overflow-y: auto;
    position: relative;
  }

  @keyframes slideUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }

  .bottom-sheet-handle {
    width: 40px;
    height: 4px;
    background: var(--color-gray-light);
    border-radius: 2px;
    margin: 12px auto;
  }

  .close-button {
    position: absolute;
    top: 12px;
    right: 16px;
    background: transparent;
    color: var(--color-gray-medium);
    padding: 8px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s ease;
  }

  .close-button:active {
    background: var(--color-gray-light);
  }

  .bottom-sheet-content {
    padding: 0 var(--spacing-md) calc(var(--spacing-lg) + 80px);
  }

  .category-badge {
    display: inline-block;
    color: white;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: var(--spacing-sm);
  }

  .meta {
    color: var(--color-gray-dark);
    font-size: 15px;
    line-height: 1.6;
    margin-bottom: var(--spacing-md);
  }

  .meta-section {
    background: #f8fafc;
    padding: var(--spacing-md);
    border-radius: var(--border-radius-md);
    margin-bottom: var(--spacing-md);
    border-left: 3px solid var(--color-craft);
  }

  .meta-title {
    font-family: var(--font-heading);
    font-size: 14px;
    color: var(--color-text);
    margin: 0 0 var(--spacing-xs) 0;
    font-weight: 600;
  }

  .meta-content {
    font-family: var(--font-body);
    font-size: 14px;
    color: var(--color-text);
    line-height: 1.6;
    margin: 0;
  }

  .bottom-sheet-content h2 {
    margin: 0 0 var(--spacing-sm);
    font-size: 24px;
  }

  /* Section Styles */
  .section {
    margin-bottom: var(--spacing-sm);
    border-bottom: 1px solid var(--color-gray-light);
  }

  .section-header {
    width: 100%;
    padding: var(--spacing-sm) 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: none;
    border: none;
    cursor: pointer;
    transition: background 0.2s ease;
  }

  .section-header:active {
    background: var(--color-gray-light);
  }

  .section-title {
    font-weight: 600;
    font-size: 15px;
    color: var(--color-text);
    flex: 1;
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
  }

  .section-content {
    padding: var(--spacing-sm) 0;
  }

  /* Beer Menu */
  .beer-list {
    display: grid;
    gap: var(--spacing-sm);
    grid-template-columns: 1fr auto;
  }

  .beer-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-xs) 0;
  }

  .beer-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .beer-name {
    font-weight: 600;
    font-size: 14px;
    color: var(--color-text);
  }

  .beer-brewery {
    font-size: 12px;
    color: var(--color-gray-medium);
  }

  .beer-style {
    font-size: 11px;
    color: var(--color-gray-medium);
    font-style: italic;
  }

  .beer-price {
    font-weight: 600;
    font-size: 14px;
    color: var(--color-text);
  }

  .expand-button {
    width: 100%;
    padding: 8px;
    margin-top: var(--spacing-sm);
    background: var(--color-kneipen);
    color: white;
    border: none;
    border-radius: var(--border-radius-sm);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s ease;
  }

  .expand-button:active {
    background: var(--color-craft);
  }

  /* Cocktails */
  .cocktail-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .cocktail-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-xs) 0;
  }

  .cocktail-name {
    font-weight: 600;
    font-size: 14px;
    color: var(--color-text);
  }

  .cocktail-price {
    font-weight: 600;
    font-size: 14px;
    color: var(--color-text);
  }

  .cocktail-ingredients {
    font-size: 11px;
    color: var(--color-gray-medium);
  }

  /* Food Menu */
  .food-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .food-item {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
    padding: var(--spacing-xs) 0;
  }

  .food-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .food-name {
    font-weight: 600;
    font-size: 14px;
    color: var(--color-text);
  }

  .food-price {
    font-weight: 600;
    font-size: 14px;
    color: var(--color-text);
  }

  .food-description {
    font-size: 12px;
    color: var(--color-gray-dark);
    line-height: 1.5;
    margin: 0;
  }

  /* Local Specialties */
  .specialties-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .specialty-item {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
    padding: var(--spacing-xs) 0;
  }

  .specialty-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .specialty-name {
    font-weight: 600;
    font-size: 14px;
    color: var(--color-text);
  }

  .specialty-price {
    font-weight: 600;
    font-size: 14px;
    color: var(--color-text);
  }

  .specialty-description {
    font-size: 12px;
    color: var(--color-gray-dark);
    line-height: 1.5;
    margin: 0;
  }

  /* Key Features */
  .key-features-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .key-feature-item {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-xs);
    padding: var(--spacing-xs) 0;
  }

  .key-feature-bullet {
    color: var(--color-sights);
    font-weight: 700;
    font-size: 16px;
  }

  .key-feature-text {
    font-size: 14px;
    color: var(--color-text);
    line-height: 1.5;
  }

  /* Pro Tips & Fun Facts */
  .pro-tips {
    background: #f0fdf4;
    padding: var(--spacing-sm);
    border-radius: var(--border-radius-sm);
    margin-bottom: var(--spacing-sm);
  }

  .pro-tips-header {
    font-weight: 600;
    font-size: 13px;
    color: var(--color-kneipen);
    margin-bottom: var(--spacing-xs);
  }

  .pro-tips p {
    margin: 0;
    font-size: 13px;
    color: var(--color-text);
    line-height: 1.5;
  }

  .fun-facts {
    background: #fff3e0;
    padding: var(--spacing-sm);
    border-radius: var(--border-radius-sm);
    margin-bottom: var(--spacing-sm);
  }

  .fun-facts-header {
    font-weight: 600;
    font-size: 13px;
    color: var(--color-nightlife);
    margin-bottom: var(--spacing-xs);
  }

  .fun-facts p {
    margin: 0;
    font-size: 13px;
    color: var(--color-text);
    line-height: 1.5;
  }

  /* Info Rows */
  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-sm) 0;
    border-bottom: 1px solid var(--color-gray-light);
  }

  .info-row:last-of-type {
    border-bottom: none;
  }

  .label {
    font-size: 14px;
    color: var(--color-gray-medium);
    font-weight: 500;
  }

  .value {
    font-size: 14px;
    color: var(--color-text);
    font-weight: 600;
  }

  .value-link {
    color: var(--color-kneipen);
    text-decoration: none;
  }

  .value-link:hover {
    text-decoration: underline;
  }

  /* Empty State */
  .no-details-hint {
    text-align: center;
    padding: var(--spacing-xl) var(--spacing-md);
    color: var(--color-gray-medium);
  }

  .no-details-hint p {
    margin: var(--spacing-sm) 0 0 0;
    font-size: 14px;
  }

  /* Delete Button */
  .delete-button {
    width: 100%;
    padding: 12px;
    margin-top: var(--spacing-md);
    background: #ffebee;
    color: #c62828;
    border: none;
    border-radius: var(--border-radius-sm);
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: background 0.2s ease;
  }

  .delete-button:active {
    background: #ffcdd2;
  }
`
