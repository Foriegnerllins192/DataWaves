# Remove Validity Periods from Existing Database

If you already have the database set up with validity periods and want to remove them so data bundles don't expire, you can use this script.

## Prerequisites

1. Database is already set up with the original schema (including validity_days column)
2. Node.js is installed and working
3. Database server is running

## How to Use

1. Make sure your database is running
2. Navigate to your project directory:
   ```
   cd c:\xampp\htdocs\DATAWAY
   ```
3. Run the script:
   ```
   node remove_validity_periods.js
   ```

## What the Script Does

1. Checks if the `validity_days` column exists in the `data_plans` table
2. If it exists, removes the column completely
3. If it doesn't exist, informs you that no action is needed

## Manual Alternative

If you prefer to do this manually, you can run this SQL command in phpMyAdmin:

```sql
ALTER TABLE data_plans DROP COLUMN validity_days;
```

## After Running the Script

Once the script completes:
1. Your data plans will no longer have validity periods
2. Data bundles will not expire automatically
3. The application will work with the updated schema

## Reverting Changes

If you need to add validity periods back, you would need to:
1. Add the column back to the table:
   ```sql
   ALTER TABLE data_plans ADD COLUMN validity_days INT NOT NULL DEFAULT 30;
   ```
2. Update the values as needed for each plan

## Troubleshooting

If you encounter any errors:
1. Make sure the database server is running
2. Check that the database connection details in `config/db.js` are correct
3. Ensure you have the necessary permissions to modify the database structure