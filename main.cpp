#include <iostream>
#include <iomanip>
#include <stack>
#include <queue>
#include <string>

using namespace std;

// ================= TRANSACTION STRUCT ====================
struct Transaction {
    string type;       // "Income" or "Expense"
    string category;
    double amount;
    string date;       // format: YYYY-MM-DD
    Transaction* next;

    Transaction(string t, string c, double a, string d)
        : type(t), category(c), amount(a), date(d), next(nullptr) {}
};

// ================= FINANCE TRACKER CLASS ====================
class FinanceTracker {
private:
    Transaction* head = nullptr;
    stack<Transaction*> undoStack;
    queue<Transaction*> futureTransactions;

public:
    // Add transaction to linked list
    void addTransaction(const string& type, const string& category, double amount, const string& date) {
        Transaction* newNode = new Transaction(type, category, amount, date);
        newNode->next = head;
        head = newNode;
        undoStack.push(newNode);

        cout << "Transaction added successfully.\n";
    }

    // Add future/scheduled transaction
    void scheduleTransaction(const string& type, const string& category, double amount, const string& date) {
        Transaction* scheduled = new Transaction(type, category, amount, date);
        futureTransactions.push(scheduled);
        cout << "Transaction scheduled successfully.\n";
    }

    // View all transactions (linked list)
    void viewTransactions() {
        if (!head) {
            cout << "No transactions available.\n";
            return;
        }

        cout << left << setw(10) << "Type"
             << setw(15) << "Category"
             << setw(10) << "Amount"
             << setw(12) << "Date" << "\n";

        Transaction* current = head;
        while (current) {
            cout << left << setw(10) << current->type
                 << setw(15) << current->category
                 << setw(10) << current->amount
                 << setw(12) << current->date << "\n";
            current = current->next;
        }
    }

    // View future scheduled transactions (queue)
    void viewScheduledTransactions() {
        if (futureTransactions.empty()) {
            cout << "No scheduled transactions.\n";
            return;
        }

        cout << "\nScheduled Transactions:\n";
        queue<Transaction*> temp = futureTransactions;

        while (!temp.empty()) {
            Transaction* t = temp.front();
            temp.pop();
            cout << t->type << " | " << t->category << " | " << t->amount << " | " << t->date << "\n";
        }
    }

    // Calculate balance
    void viewBalance() {
        double income = 0, expense = 0;
        Transaction* current = head;

        while (current) {
            if (current->type == "Income")
                income += current->amount;
            else
                expense += current->amount;
            current = current->next;
        }

        cout << fixed << setprecision(2);
        cout << "Total Income: rs" << income << "\n";
        cout << "Total Expenses: rs" << expense << "\n";
        cout << "Balance: rs" << (income - expense) << "\n";
    }

    // Undo last transaction (stack)
    void undoTransaction() {
        if (undoStack.empty()) {
            cout << "Nothing to undo.\n";
            return;
        }

        Transaction* last = undoStack.top();
        undoStack.pop();

        // Remove from linked list
        if (head == last) {
            head = head->next;
        } else {
            Transaction* prev = head;
            while (prev && prev->next != last) {
                prev = prev->next;
            }
            if (prev) prev->next = last->next;
        }

        delete last;
        cout << "Last transaction undone.\n";
    }
};

// ================= MAIN FUNCTION ====================
int main() {
    FinanceTracker ft;
    int choice;

    do {
        cout << "\n--- Finance Tracker Menu ---\n";
        cout << "1. Add Transaction\n";
        cout << "2. View Transactions\n";
        cout << "3. View Balance\n";
        cout << "4. Undo Last Transaction\n";
        cout << "5. Schedule Future Transaction\n";
        cout << "6. View Scheduled Transactions\n";
        cout << "0. Exit\n";
        cout << "Enter choice: ";
        cin >> choice;

        string type, category, date;
        double amount;

        switch (choice) {
            case 1:
                cout << "Enter type (Income/Expense): ";
                cin >> type;
                cout << "Enter category: ";
                cin >> category;
                cout << "Enter amount: ";
                cin >> amount;
                cout << "Enter date (YYYY-MM-DD): ";
                cin >> date;
                ft.addTransaction(type, category, amount, date);
                break;

            case 2:
                ft.viewTransactions();
                break;

            case 3:
                ft.viewBalance();
                break;

            case 4:
                ft.undoTransaction();
                break;

            case 5:
                cout << "Enter type (Income/Expense): ";
                cin >> type;
                cout << "Enter category: ";
                cin >> category;
                cout << "Enter amount: ";
                cin >> amount;
                cout << "Enter future date (YYYY-MM-DD): ";
                cin >> date;
                ft.scheduleTransaction(type, category, amount, date);
                break;

            case 6:
                ft.viewScheduledTransactions();
                break;

            case 0:
                cout << "Exiting...\n";
                break;

            default:
                cout << "Invalid choice.\n";
        }

    } while (choice != 0);

    return 0;
}