# Design Document

## Overview

This design document outlines the technical approach to fix the broken Business Tools in the Learner PWA application. The fixes involve creating a missing component (InventoryForecast), adding missing API methods to the businessApi service, and fixing form validation issues in the sales and expense tracking features.

## Architecture

The Business Tools module follows a standard React architecture with:
- **Frontend Components**: React components in `learner-pwa/src/components/` and `learner-pwa/src/pages/`
- **API Service**: `learner-pwa/src/services/businessApi.js` handles all API calls
- **Backend Routes**: `learner-pwa/backend/routes/business.js` provides REST endpoints
- **Local Storage**: Used for offline-first data persistence

```
┌─────────────────────────────────────────────────────────────┐
│                    BusinessTools.js                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐│
│  │InventoryTab │ │  SalesTab   │ │     ExpensesTab         ││
│  └─────────────┘ └─────────────┘ └─────────────────────────┘│
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐│
│  │InventoryForecast│FinancialReports│    BIDashboard      ││
│  └─────────────┘ └─────────────┘ └─────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │              ComplianceManager                           ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    businessApi.js                            │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ getFinancialReports() │ getBusinessIntelligence()       ││
│  │ getCompliance()       │ getInventoryForecast()          ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                Backend: /api/v1/business/*                   │
│  /reports/financial │ /analytics │ /compliance              │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. InventoryForecast Component (New)

Create a new React component that displays inventory forecasting data.

```javascript
// Interface
interface InventoryForecastItem {
  itemId: string;
  itemName: string;
  currentStock: number;
  avgDailySales: number;
  daysToStockout: number;
  recommendedReorder: number;
  forecastAccuracy: 'High' | 'Medium' | 'Low';
}

interface ForecastData {
  inventoryForecast: InventoryForecastItem[];
  cashFlowProjection: CashFlowItem[];
  recommendations: {
    lowStockAlerts: LowStockAlert[];
    overstockedItems: OverstockedItem[];
  };
}
```

### 2. BusinessApi Service Updates

Add missing methods to the businessApi service:

```javascript
// New methods to add
async getFinancialReports(params) {
  // Calls GET /api/v1/business/reports/financial
}

async getBusinessIntelligence(period) {
  // Calls GET /api/v1/business/analytics with type=overview
}

async getCompliance() {
  // Calls GET /api/v1/business/compliance
}

async getInventoryForecast(period) {
  // Calls GET /api/v1/business/analytics with type=forecasting
}
```

### 3. Component Fixes

#### FinancialReports.js
- Update to use `businessApi.getFinancialReports()` method
- Add fallback to localStorage data when API fails

#### BIDashboard.js
- Update to use `businessApi.getBusinessIntelligence()` method
- Add fallback to localStorage data when API fails

#### ComplianceManager.js
- Update to use `businessApi.getCompliance()` method
- Add fallback to localStorage data when API fails

## Data Models

### Inventory Forecast Data Model
```javascript
{
  inventoryForecast: [
    {
      itemId: "string",
      itemName: "string",
      currentStock: number,
      avgDailySales: number,
      daysToStockout: number,
      recommendedReorder: number,
      forecastAccuracy: "High" | "Medium" | "Low"
    }
  ],
  cashFlowProjection: [
    {
      month: "string",
      revenue: number,
      expenses: number,
      netCashFlow: number
    }
  ]
}
```

### Financial Report Data Model
```javascript
{
  reportType: "string",
  period: { startDate: "string", endDate: "string" },
  income: {
    totalRevenue: number,
    costOfGoodsSold: number,
    grossProfit: number
  },
  expenses: {
    totalExpenses: number,
    byCategory: { [category: string]: number }
  },
  profit: {
    netProfit: number,
    profitMargin: number
  },
  tax: {
    vatCollected: number,
    taxableAmount: number
  }
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Component Rendering Without Errors
*For any* business tool tab selection, the corresponding component SHALL render without throwing JavaScript errors.
**Validates: Requirements 1.1, 2.1, 3.1, 4.1**

### Property 2: API Method Existence
*For any* component that calls the businessApi service, the required API method SHALL exist and return a Promise.
**Validates: Requirements 2.2, 3.2, 4.2**

### Property 3: Sales Recording Integrity
*For any* valid sale submission, the sale SHALL be saved to localStorage AND the inventory quantities SHALL be decremented by the sold amounts.
**Validates: Requirements 5.3**

### Property 4: Expense Recording Integrity
*For any* valid expense submission with non-empty category, description, and positive amount, the expense SHALL be saved to localStorage.
**Validates: Requirements 6.2**

### Property 5: Graceful Error Handling
*For any* API call failure, the component SHALL display an error message and provide a retry option without crashing.
**Validates: Requirements 2.4, 3.4, 4.4**

## Error Handling

### API Error Handling Strategy
1. **Try-Catch Blocks**: All API calls wrapped in try-catch
2. **Loading States**: Show loading spinner during API calls
3. **Error States**: Display user-friendly error messages
4. **Retry Mechanism**: Provide retry button on error
5. **Fallback Data**: Use localStorage data when API fails

### Form Validation Error Handling
1. **Required Field Validation**: Check all required fields before submission
2. **Type Validation**: Ensure numeric fields contain valid numbers
3. **Visual Feedback**: Highlight invalid fields with error styling
4. **Error Messages**: Display specific error messages for each validation failure

## Testing Strategy

### Unit Tests
- Test each new API method in businessApi.js
- Test form validation logic in BusinessTools.js
- Test component rendering without errors

### Property-Based Tests
- Test that all business tool tabs render without errors
- Test that API methods return expected data structures
- Test that sales and expense recording maintains data integrity

### Integration Tests
- Test full flow of recording a sale
- Test full flow of adding an expense
- Test navigation between business tool tabs
