# Assessment Ranking System

## Overview

The Assessment Ranking System automatically calculates and stores student rankings based on their performance in various assessments. This system helps recruiters and administrators identify top-performing candidates and filter users by their assessment performance.

## Features

### 1. Automatic Ranking Calculation
- Rankings are calculated automatically when students complete assessments
- Uses a weighted scoring algorithm: 70% best score + 30% average score
- Rankings are stored in the `user_rankings` collection in Firestore

### 2. Ranking Categories
- **Top 3**: Gold background (#ffd700)
- **Top 10**: Green background (#90EE90)
- **Top 25**: Light blue background (#87CEEB)
- **Top 50**: Light pink background (#FFB6C1)
- **Below 50**: Light orange background (#FFA07A)
- **No Assessment**: Gray background (#f0f0f0)

### 3. JD Master Panel Integration
- New "Assessment Ranking" column in the user records table
- Filter options:
  - No Assessment
  - Top 10
  - Top 25
  - Top 50
  - Below 50
- Sort candidates by ranking (ascending - lower rank is better)

### 4. Manual Ranking Calculator
- Accessible at `/myaccount/jdmasterpanel/calculate-rankings.html`
- Allows administrators to manually recalculate all rankings
- Shows current ranking statistics
- Progress tracking during calculation

## Technical Implementation

### Database Structure

#### Collection: `user_rankings`
Document: `assessment_rankings`
```json
{
  "rankings": [
    {
      "email": "user@example.com",
      "rank": 1,
      "averageScore": 85.5,
      "bestScore": 92,
      "weightedScore": 89.9,
      "totalAttempts": 3,
      "lastAssessmentDate": "2024-01-15T10:30:00Z"
    }
  ],
  "lastUpdated": "2024-01-15T10:30:00Z",
  "totalUsers": 150
}
```

#### Collection: `user_assessment_results`
Document: `{user_email}`
```json
{
  "results": [
    {
      "quizCode": "assessment_id",
      "score": 45,
      "percentage": 90,
      "timestamp": "2024-01-15T10:30:00Z",
      "user_questions_with_answers": [...]
    }
  ]
}
```

### Ranking Algorithm

1. **Data Collection**: Gather all assessment results for each user
2. **Score Calculation**:
   - Calculate average score across all attempts
   - Identify best score across all attempts
   - Apply weighted formula: `(bestScore * 0.7) + (averageScore * 0.3)`
3. **Ranking Assignment**: Sort users by weighted score (descending) and assign ranks
4. **Storage**: Save rankings to Firestore with metadata

### Files Modified

1. **`staticfiles/mainfiles/jdmasterpanel/users-record/script.js`**
   - Added ranking calculation functions
   - Added ranking filter functionality
   - Updated table population to include ranking data

2. **`myaccount/jdmasterpanel/users-record/index.html`**
   - Added ranking filter dropdown
   - Added ranking column to table
   - Added link to ranking calculator

3. **`staticfiles/mainfiles/jdmasterpanel/users-record/script.css`**
   - Added CSS styles for ranking display
   - Color-coded ranking categories

4. **`staticfiles/mainfiles/test/quiz/script.js`**
   - Added automatic ranking update after assessment completion

5. **`myaccount/jdmasterpanel/calculate-rankings.html`**
   - New page for manual ranking calculation
   - Statistics display
   - Progress tracking

## Usage

### For Administrators

1. **View Rankings**: Access the JD Master Panel to see user rankings
2. **Filter by Ranking**: Use the ranking dropdown to filter candidates
3. **Manual Calculation**: Use the "Calculate Rankings" button to recalculate all rankings
4. **Statistics**: View ranking statistics on the calculator page

### For Students

1. **Take Assessments**: Complete assessments to generate ranking data
2. **View Performance**: Rankings are automatically calculated and stored
3. **Improve Scores**: Better performance leads to higher rankings

## Security

- Only master admins can access the ranking calculator
- Rankings are automatically updated when assessments are completed
- All ranking data is stored securely in Firestore

## Future Enhancements

1. **Email Notifications**: Notify users when their ranking changes
2. **Ranking History**: Track ranking changes over time
3. **Advanced Filters**: Filter by assessment type, date range, etc.
4. **Export Functionality**: Export ranking data to CSV/Excel
5. **Leaderboard**: Public leaderboard for top performers
6. **Ranking Analytics**: Detailed analytics and insights

## Troubleshooting

### Common Issues

1. **Rankings not updating**: Check if assessment results are being saved correctly
2. **Missing ranking data**: Ensure users have completed at least one assessment
3. **Calculation errors**: Use the manual calculator to recalculate rankings
4. **Display issues**: Check browser console for JavaScript errors

### Manual Fixes

1. **Recalculate Rankings**: Use the ranking calculator page
2. **Check Database**: Verify data in Firestore collections
3. **Clear Cache**: Refresh the page and clear browser cache
4. **Check Permissions**: Ensure user has admin access

## Support

For technical support or questions about the ranking system, contact the development team or refer to the Firebase console for database issues. 