import pandas as pd
import os
from datetime import datetime

# Global Constants
FILE_NAME = "expenses.csv"
MONTHLY_BUDGET = 5000.0  # Default budget for a student
CATEGORIES = ["Food", "Travel", "Shopping", "Bills", "Recharge", "Personal", "Other"]


def initialize_file():
    """Creates the CSV file with headers if it doesn't exist."""
    if not os.path.exists(FILE_NAME):
        df = pd.DataFrame(columns=["Date", "Category", "Amount", "Description"])
        df.to_csv(FILE_NAME, index=False)

def add_expense():
    """Takes user input to add a new expense to the CSV file."""
    print("\n--- Add New Expense ---")
    
    # 1. Date input
    date_input = input("Enter Date (YYYY-MM-DD) or press Enter for today: ").strip()
    if not date_input:
        date_input = datetime.now().strftime("%Y-%m-%d")
        
    # 2. Category selection
    print("\nSelect a Category:")
    for i, cat in enumerate(CATEGORIES, 1):
        print(f"{i}. {cat}")
    
    try:
        cat_choice = int(input("Enter category number: "))
        if 1 <= cat_choice <= len(CATEGORIES):
            category = CATEGORIES[cat_choice - 1]
        else:
            print("Invalid choice. Setting category to 'Other'.")
            category = "Other"
    except ValueError:
        print("Invalid input. Setting category to 'Other'.")
        category = "Other"
        
    # 3. Amount input
    try:
        amount = float(input("Enter Amount (₹): "))
    except ValueError:
        print("Invalid amount. Expense not added.")
        return
        
    # 4. Description input
    description = input("Enter Description: ").strip()
    
    # Save to CSV using Pandas
    new_expense = pd.DataFrame([{
        "Date": date_input,
        "Category": category,
        "Amount": amount,
        "Description": description
    }])
    
    # Append without overwriting headers
    new_expense.to_csv(FILE_NAME, mode='a', header=False, index=False)
    print("\n✅ Expense added successfully!")

def view_expenses():
    """Displays all recorded expenses."""
    print("\n--- All Expenses ---")
    try:
        df = pd.read_csv(FILE_NAME)
        if df.empty:
            print("No expenses recorded yet.")
        else:
            print(df.to_string(index=False))
    except Exception as e:
        print(f"Error reading file: {e}")

def show_summary():
    """Shows category-wise spending, total spending, and highest spending category."""
    print("\n--- Expense Summary ---")
    try:
        df = pd.read_csv(FILE_NAME)
        if df.empty:
            print("No expenses recorded yet.")
            return
            
        # Total Spending calculation
        total_spent = df["Amount"].sum()
        print(f"\n💰 Total Spending: ₹{total_spent:.2f}")
        
        # Category-wise spending using Pandas GroupBy
        print("\n📊 Category-wise Spending:")
        category_group = df.groupby("Category")["Amount"].sum().reset_index()
        # Sort by amount descending
        category_group = category_group.sort_values(by="Amount", ascending=False)
        
        for index, row in category_group.iterrows():
            print(f" - {row['Category']}: ₹{row['Amount']:.2f}")
            
        # Highest Spending Category
        if not category_group.empty:
            highest_cat = category_group.iloc[0]["Category"]
            highest_amt = category_group.iloc[0]["Amount"]
            print(f"\n🔥 Highest Spending Category: {highest_cat} (₹{highest_amt:.2f})")
            
        # Budget Warning
        if total_spent > MONTHLY_BUDGET:
            print(f"\n⚠️ WARNING: You have crossed your monthly budget of ₹{MONTHLY_BUDGET}!")
        else:
            print(f"\n✅ You are within your budget. Remaining: ₹{MONTHLY_BUDGET - total_spent:.2f}")
            
        # Smart Suggestions based on percentage of total spending
        print("\n💡 Smart Spending Suggestions:")
        if total_spent > 0:
            for index, row in category_group.iterrows():
                percentage = (row["Amount"] / total_spent) * 100
                if row["Category"] == "Food" and percentage > 30:
                    print(" - You spent too much on Food this month. Try cooking at home more!")
                if row["Category"] == "Shopping" and percentage > 20:
                    print(" - Shopping expenses are high. Ask yourself if you really need those items.")
                if row["Category"] == "Travel" and percentage > 25:
                    print(" - Travel costs are taking up a big portion. Consider carpooling or public transport.")
                if row["Category"] == "Recharge" and percentage > 15:
                    print(" - Recharge/Subscriptions are high. Check for cheaper plans.")
                    
    except Exception as e:
        print(f"Error generating summary: {e}")

def main():
    """Main dashboard loop."""
    initialize_file()
    
    while True:
        print("\n" + "="*40)
        print("  SMART EXPENSE TRACKER DASHBOARD  ")
        print("="*40)
        print("1. Add New Expense")
        print("2. View All Expenses")
        print("3. View Spending Summary & Insights")
        print("4. Exit")
        print("="*40)
        
        choice = input("Enter your choice (1-4): ").strip()
        
        if choice == '1':
            add_expense()
        elif choice == '2':
            view_expenses()
        elif choice == '3':
            show_summary()
        elif choice == '4':
            print("\nThank you for using Smart Expense Tracker! Exiting...\n")
            break
        else:
            print("\nInvalid choice! Please select between 1 and 4.")

if __name__ == "__main__":
    main()
