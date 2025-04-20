class Transaction {
    constructor(type, category, amount, date) {
        this.type = type;
        this.category = category;
        this.amount = parseFloat(amount);
        this.date = date;
        this.next = null;
    }
}

class ScheduledTransaction {
    constructor(type, category, amount, date) {
        this.type = type;
        this.category = category;
        this.amount = parseFloat(amount);
        this.date = date;
    }
}
class FinanceTracker {
    constructor() {
        this.head = null;
        this.undoStack = [];
        this.scheduledTransactions = [];
    }

    addTransaction(type, category, amount, date) {
        const newNode = new Transaction(type, category, amount, date);
        newNode.next = this.head;
        this.head = newNode;
        this.undoStack.push(newNode);
        return "Transaction added successfully!";
    }

    addScheduledTransaction(type, category, amount, date) {
        const newScheduled = new ScheduledTransaction(type, category, amount, date);
        this.scheduledTransactions.push(newScheduled);
        return "Transaction scheduled successfully!";
    }

    getTransactions(limit = 0) {
        let transactions = [];
        let current = this.head;
        let count = 0;
        
        while (current && (limit === 0 || count < limit)) {
            transactions.push({
                type: current.type,
                category: current.category,
                amount: current.amount,
                date: current.date
            });
            current = current.next;
            count++;
        }
        
        return transactions;
    }

    getScheduledTransactions() {
        return [...this.scheduledTransactions];
    }

    processScheduledTransactions() {
        const today = new Date().toISOString().split('T')[0];
        this.scheduledTransactions = this.scheduledTransactions.filter(transaction => {
            if (transaction.date === today) {
                this.addTransaction(transaction.type, transaction.category, transaction.amount, transaction.date);
                return false; // Remove from scheduled
            }
            return true; // Keep in scheduled
        });
    }

    getBalance() {
        let income = 0, expense = 0;
        let current = this.head;

        while (current) {
            if (current.type === "Income")
                income += current.amount;
            else
                expense += current.amount;
            current = current.next;
        }

        return {
            income: income.toFixed(2),
            expense: expense.toFixed(2),
            balance: (income - expense).toFixed(2)
        };
    }

    undoTransaction() {
        if (this.undoStack.length === 0) {
            showNotification("Nothing to undo!");
            return;
        }

        let last = this.undoStack.pop();

        if (this.head === last) {
            this.head = this.head.next;
        } else {
            let prev = this.head;
            while (prev && prev.next !== last) {
                prev = prev.next;
            }
            if (prev) prev.next = last.next;
        }

        showNotification("Last transaction undone!");
        updateUI();
    }
}

const financeTracker = new FinanceTracker();


function showPanel(panelId) {
  
    document.querySelectorAll('.panel').forEach(panel => {
        panel.classList.remove('active');
    });
    
   
    document.getElementById(panelId).classList.add('active');
    
    
    document.querySelectorAll('.menu-option').forEach(option => {
        option.classList.remove('active');
    });
    
   
    const menuOptions = {
        'dashboard': 0,
        'add-transaction': 1,
        'transactions': 2,
        'scheduled': 3
    };
    
    if (menuOptions[panelId] !== undefined) {
        document.querySelectorAll('.menu-option')[menuOptions[panelId]].classList.add('active');
    }
    
    updateUI();
}

function updateUI() {
 
    const balance = financeTracker.getBalance();
    document.getElementById('total-income').textContent = `₹${balance.income}`;
    document.getElementById('total-expense').textContent = `₹${balance.expense}`;
    document.getElementById('total-balance').textContent = `₹${balance.balance}`;
    
   
    const recentTransactions = financeTracker.getTransactions(5);
    const recentTableBody = document.querySelector('#recent-transactions tbody');
    recentTableBody.innerHTML = '';
    
    recentTransactions.forEach(t => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(t.date)}</td>
            <td>${t.category}</td>
            <td class="${t.type === 'Income' ? 'income' : 'expense'}">${t.type === 'Income' ? '+' : '-'}₹${t.amount.toFixed(2)}</td>
        `;
        recentTableBody.appendChild(row);
    });
    
   
    const allTransactions = financeTracker.getTransactions();
    const allTableBody = document.querySelector('#transactions-table tbody');
    allTableBody.innerHTML = '';
    
    allTransactions.forEach(t => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(t.date)}</td>
            <td>${t.type}</td>
            <td>${t.category}</td>
            <td class="${t.type === 'Income' ? 'income' : 'expense'}">${t.type === 'Income' ? '+' : '-'}₹${t.amount.toFixed(2)}</td>
        `;
        allTableBody.appendChild(row);
    });
    

    const scheduledTransactions = financeTracker.getScheduledTransactions();
    const scheduledTableBody = document.querySelector('#scheduled-transactions-table tbody');
    scheduledTableBody.innerHTML = '';
    
    scheduledTransactions.forEach(t => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(t.date)}</td>
            <td>${t.type}</td>
            <td>${t.category}</td>
            <td class="${t.type === 'Income' ? 'income' : 'expense'}">${t.type === 'Income' ? '+' : '-'}₹${t.amount.toFixed(2)}</td>
            <td><button class="btn btn-secondary" onclick="cancelScheduledTransaction('${t.date}', '${t.type}', '${t.category}', ${t.amount})">Cancel</button></td>
        `;
        scheduledTableBody.appendChild(row);
    });
}

function addTransaction() {
    const type = document.getElementById('type').value;
    const category = document.getElementById('category').value.trim();
    const amount = document.getElementById('amount').value;
    const date = document.getElementById('date').value;
    
    if (!category || !amount || !date) {
        showNotification("Please fill all fields!");
        return;
    }
    
    if (parseFloat(amount) <= 0) {
        showNotification("Amount must be positive!");
        return;
    }
    
    const result = financeTracker.addTransaction(type, category, amount, date);
    showNotification(result);
    
    
    document.getElementById('category').value = '';
    document.getElementById('amount').value = '';
    
  
    showPanel('dashboard');
}

function addScheduledTransaction() {
    const type = document.getElementById('scheduled-type').value;
    const category = document.getElementById('scheduled-category').value.trim();
    const amount = document.getElementById('scheduled-amount').value;
    const date = document.getElementById('scheduled-date').value;
    
    if (!category || !amount || !date) {
        showNotification("Please fill all fields!");
        return;
    }
    
    if (parseFloat(amount) <= 0) {
        showNotification("Amount must be positive!");
        return;
    }
    
    const today = new Date().toISOString().split('T')[0];
    if (date <= today) {
        showNotification("Scheduled date must be in the future!");
        return;
    }
    
    const result = financeTracker.addScheduledTransaction(type, category, amount, date);
    showNotification(result);
    
   
    document.getElementById('scheduled-category').value = '';
    document.getElementById('scheduled-amount').value = '';
    
   
    updateUI();
}

function cancelScheduledTransaction(date, type, category, amount) {
    financeTracker.scheduledTransactions = financeTracker.scheduledTransactions.filter(
        t => !(t.date === date && t.type === type && t.category === category && t.amount === amount)
    );
    showNotification("Scheduled transaction cancelled!");
    updateUI();
}

function undoTransaction() {
    financeTracker.undoTransaction();
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
}


window.onload = function() {
    
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
    

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('scheduled-date').value = tomorrow.toISOString().split('T')[0];
    
   
    financeTracker.addTransaction('Income', 'Salary', '50000', today);
    financeTracker.addTransaction('Expense', 'Rent', '15000', today);
    financeTracker.addTransaction('Expense', 'Groceries', '3500', today);
    
    
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    financeTracker.addScheduledTransaction('Income', 'Freelance', '12000', nextWeek.toISOString().split('T')[0]);
    
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    financeTracker.addScheduledTransaction('Expense', 'Internet', '800', nextMonth.toISOString().split('T')[0]);
    
   
    showPanel('dashboard');
    
  
    setInterval(() => {
        financeTracker.processScheduledTransactions();
        updateUI();
    }, 86400000); 
};
